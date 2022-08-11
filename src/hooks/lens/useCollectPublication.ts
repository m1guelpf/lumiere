import { ethers } from 'ethers'
import { omit } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useCallback } from 'react'
import { toastOn } from '@/lib/toasts'
import useWaitForAction from './useWaitForAction'
import LensHubProxy from '@/abis/LensHubProxy.json'
import { useProfile } from '@/context/ProfileContext'
import { gql, useMutation, useQuery } from '@apollo/client'
import BROADCAST_MUTATION from '@/graphql/broadcast/broadcast'
import COLLECT_SIG from '@/graphql/publications/collect-request'
import { ERROR_MESSAGE, LENSHUB_PROXY, RELAYER_ON } from '@/lib/consts'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { Mutation, MutationCreateCollectTypedDataArgs, RelayerResult } from '@/types/lens'

type CollectPublication = {
	collectPublication: (publicationId: string) => Promise<unknown>
	data: boolean
	loading: boolean
	error?: Error
	refetch?: () => void
}
type CollectPublicationOptions = { onSuccess?: () => void; onIndex?: () => void }

const HAS_COLLECTED_QUERY = gql`
	query HasCollectedPublication($publicationId: InternalPublicationId!) {
		publication(request: { publicationId: $publicationId }) {
			... on Post {
				hasCollectedByMe
			}
			... on Comment {
				hasCollectedByMe
			}
			... on Mirror {
				hasCollectedByMe
			}
		}
	}
`

// @TODO: Needs to account for allowance & balance for paid collects
const useCollectPublication = (
	publicationId?: string,
	{ onSuccess, onIndex }: CollectPublicationOptions = {}
): CollectPublication => {
	const { chain } = useNetwork()
	const { profile } = useProfile()
	const { address, isConnected } = useAccount()
	const { data: collectedData, refetch } = useQuery<
		{ publication: { hasCollectedByMe: boolean } },
		{ publicationId: string }
	>(HAS_COLLECTED_QUERY, {
		variables: { publicationId },
		skip: !publicationId || !profile,
	})

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
		data: txData,
		writeAsync: sendTx,
		isLoading: txLoading,
		error: txError,
	} = useContractWrite({
		mode: 'recklesslyUnprepared',
		addressOrName: LENSHUB_PROXY,
		contractInterface: LensHubProxy,
		functionName: 'collectWithSig',
		onError: (error: any) => {
			toast.error(error?.data?.message ?? error?.message)
		},
		onSuccess: () => {
			onSuccess && onSuccess()
		},
	})
	const [broadcast, { data: broadcastResult, loading: gasslessLoading, error: gasslessError }] = useMutation<{
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

	const { resolveOnAction } = useWaitForAction({
		onParse: () => {
			onIndex && onIndex()

			refetch()
		},
		txHash: txData?.hash,
		txId: (broadcastResult?.broadcast as RelayerResult)?.txId as string,
	})

	const collectPublication = useCallback(
		async (publicationId: string) => {
			if (!isConnected) return toast.error('Please connect your wallet first.')
			if (chain?.unsupported) return toast.error('Please change your network.')
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
				const result = await toastOn(
					async () => {
						const {
							data: { broadcast: result },
						} = await broadcast({
							variables: {
								request: { id, signature },
							},
						})

						if ('reason' in result) throw result.reason

						return result
					},
					{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
				)

				return resolveOnAction({ txId: result.txId })
			}

			const tx = await toastOn(
				() =>
					sendTx({
						recklesslySetUnpreparedArgs: {
							collector: address,
							profileId,
							pubId,
							data,
							sig: { v, r, s, deadline },
						},
					}),
				{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
			)

			return resolveOnAction({ txHash: tx.hash })
		},
		[
			address,
			isConnected,
			chain?.unsupported,
			profile?.id,
			getTypedData,
			signRequest,
			broadcast,
			sendTx,
			resolveOnAction,
		]
	)

	return {
		refetch,
		collectPublication,
		data: collectedData?.publication?.hasCollectedByMe,
		error: dataError || sigError || txError || gasslessError,
		loading: dataLoading || sigLoading || txLoading || gasslessLoading,
	}
}

export default useCollectPublication
