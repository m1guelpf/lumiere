import { ethers } from 'ethers'
import { omit } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useCallback } from 'react'
import { toastOn } from '@/lib/toasts'
import { useMutation } from '@apollo/client'
import useWaitForAction from './useWaitForAction'
import LensHubProxy from '@/abis/LensHubProxy.json'
import { useProfile } from '@/context/ProfileContext'
import BROADCAST_MUTATION from '@/graphql/broadcast/broadcast'
import FOLLOW_REQUEST_SIG from '@/graphql/follows/follow-request'
import { ERROR_MESSAGE, LENSHUB_PROXY, RELAYER_ON } from '@/lib/consts'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { FollowModuleRedeemParams, Mutation, MutationCreateFollowTypedDataArgs, RelayerResult } from '@/types/lens'

type FollowProfile = {
	followProfile: (profile: string, followModule: FollowModuleRedeemParams) => Promise<() => Promise<unknown>>
	loading: boolean
	error?: Error
}
type FollowProfileOptions = { onSuccess?: () => void; onIndex?: () => void }

const useFollowProfile = ({ onSuccess, onIndex }: FollowProfileOptions = {}): FollowProfile => {
	const { profile: activeProfile } = useProfile()
	const { chain } = useNetwork()
	const { address, isConnected } = useAccount()

	//#region Data Hooks
	const [getTypedData, { loading: dataLoading, error: dataError }] = useMutation<
		{
			createFollowTypedData: Mutation['createFollowTypedData']
		},
		MutationCreateFollowTypedDataArgs
	>(FOLLOW_REQUEST_SIG, {
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
		functionName: 'followWithSig',
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
		onParse: onIndex,
		txHash: txData?.hash,
		txId: (broadcastResult?.broadcast as RelayerResult)?.txId as string,
	})

	const followProfile = useCallback(
		async (profile: string, followModule: FollowModuleRedeemParams) => {
			if (!isConnected) throw toast.error('Please connect your wallet first.')
			if (chain?.unsupported) throw toast.error('Please change your network.')
			if (!activeProfile?.id) throw toast.error('Please create a Lens profile first.')

			const { id, typedData } = await toastOn(
				async () => {
					const {
						data: { createFollowTypedData },
					} = await getTypedData({
						variables: {
							request: {
								follow: [{ profile, followModule }],
							},
						},
					})

					return createFollowTypedData
				},
				{
					loading: 'Getting signature details...',
					success: 'Signature is ready!',
					error: ERROR_MESSAGE,
				}
			)

			const { profileIds, datas, deadline } = typedData.value

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
							follower: address,
							profileIds,
							datas,
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
			activeProfile?.id,
			getTypedData,
			signRequest,
			broadcast,
			sendTx,
			resolveOnAction,
		]
	)

	return {
		followProfile,
		loading: dataLoading || sigLoading || txLoading || gasslessLoading,
		error: dataError || sigError || txError || gasslessError,
	}
}

export default useFollowProfile
