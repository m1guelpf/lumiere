import { ethers } from 'ethers'
import { omit } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useCallback } from 'react'
import { toastOn } from '@/lib/toasts'
import { useMutation } from '@apollo/client'
import LensHubProxy from '@/abis/LensHubProxy.json'
import { useProfile } from '@/context/ProfileContext'
import BROADCAST_MUTATION from '@/graphql/broadcast/broadcast'
import COLLECT_SIG from '@/graphql/publications/collect-request'
import { ERROR_MESSAGE, LENSHUB_PROXY, RELAYER_ON } from '@/lib/consts'
import { Mutation, MutationCreateCollectTypedDataArgs } from '@/types/lens'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'

type CollectPublication = {
	collectPublication: (publicationId: string) => Promise<unknown>
	loading: boolean
	error?: Error
}
type CollectPublicationOptions = { onSuccess?: () => void }

// @TODO: Needs to account for allowance & balance for paid collects
const useCollectPublication = ({ onSuccess }: CollectPublicationOptions = {}): CollectPublication => {
	const { profile } = useProfile()
	const { activeChain } = useNetwork()
	const { data: account } = useAccount()

	//#region Data Hooks
	const [getTypedData, { loading: dataLoading, error: dataError }] = useMutation<
		{
			createCollectTypedData: Mutation['createCollectTypedData']
		},
		MutationCreateCollectTypedDataArgs
	>(COLLECT_SIG, {
		onError: error => toast.error(error.message ?? ERROR_MESSAGE),
	})
	const {
		signTypedDataAsync: signRequest,
		isLoading: sigLoading,
		error: sigError,
	} = useSignTypedData({
		onError: error => {
			toast.error(error.message ?? ERROR_MESSAGE)
		},
	})
	const {
		writeAsync: sendTx,
		isLoading: txLoading,
		error: txError,
	} = useContractWrite(
		{
			addressOrName: LENSHUB_PROXY,
			contractInterface: LensHubProxy,
		},
		'collectWithSig',
		{
			onError(error: any) {
				toast.error(error?.data?.message ?? error?.message)
			},
			onSuccess() {
				onSuccess && onSuccess()
			},
		}
	)
	const [broadcast, { loading: gasslessLoading, error: gasslessError }] = useMutation<{
		broadcast: Mutation['broadcast']
	}>(BROADCAST_MUTATION, {
		onCompleted({ broadcast }) {
			if ('reason' in broadcast) return toast.error(broadcast.reason)

			onSuccess && onSuccess()
		},
		onError() {
			toast.error(ERROR_MESSAGE)
		},
	})
	//#endregion

	const collectPublication = useCallback(
		async (publicationId: string) => {
			if (!account?.address) return toast.error('Please connect your wallet first.')
			if (activeChain?.unsupported) return toast.error('Please change your network.')
			if (!profile?.id) return toast.error('Please create a Lens profile first.')

			const { id, typedData } = await toastOn(
				async () => {
					const {
						data: { createCollectTypedData },
					} = await getTypedData({
						variables: {
							request: { publicationId },
						},
					})

					return createCollectTypedData
				},
				{
					loading: 'Getting signature details...',
					success: 'Signature is ready!',
					error: ERROR_MESSAGE,
				}
			)

			const { profileId, pubId, data, deadline } = typedData.value

			const signature = await signRequest({
				domain: omit(typedData?.domain, '__typename'),
				types: omit(typedData?.types, '__typename'),
				value: omit(typedData?.value, '__typename'),
			})

			const { v, r, s } = ethers.utils.splitSignature(signature)

			if (RELAYER_ON) {
				return toastOn(
					async () => {
						const {
							data: { broadcast: result },
						} = await broadcast({
							variables: {
								request: { id, signature },
							},
						})

						if ('reason' in result) throw result.reason
					},
					{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
				)
			}

			await toastOn(
				() =>
					sendTx({
						args: {
							collector: account?.address,
							profileId,
							pubId,
							data,
							sig: { v, r, s, deadline },
						},
					}),
				{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
			)
		},
		[account?.address, activeChain?.unsupported, profile?.id, getTypedData, signRequest, broadcast, sendTx]
	)

	return {
		collectPublication,
		loading: dataLoading || sigLoading || txLoading || gasslessLoading,
		error: dataError || sigError || txError || gasslessError,
	}
}

export default useCollectPublication
