import { ethers } from 'ethers'
import { omit } from '@/lib/utils'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { toastOn } from '@/lib/toasts'
import { gql, useMutation } from '@apollo/client'
import useWaitForAction from './useWaitForAction'
import LensHubProxy from '@/abis/LensHubProxy.json'
import { useProfile } from '@/context/ProfileContext'
import BROADCAST_MUTATION from '@/graphql/broadcast/broadcast'
import { ERROR_MESSAGE, LENSHUB_PROXY, RELAYER_ON } from '@/lib/consts'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { Mutation, RelayerResult, MutationCreateSetFollowModuleTypedDataArgs, FollowModuleParams } from '@/types/lens'

const UPDATE_FOLLOW_MODULE_SIG = gql`
	mutation ($request: CreateSetFollowModuleRequest!) {
		createSetFollowModuleTypedData(request: $request) {
			id
			expiresAt
			typedData {
				types {
					SetFollowModuleWithSig {
						name
						type
					}
				}
				domain {
					name
					chainId
					version
					verifyingContract
				}
				value {
					nonce
					deadline
					profileId
					followModule
					followModuleInitData
				}
			}
		}
	}
`

type UpdateFollowModule = {
	updateFollowModule: (followModule: FollowModuleParams) => Promise<() => Promise<unknown>>
	loading: boolean
	error?: Error
}
type UpdateFollowModuleOptions = { onSuccess?: () => void; onIndex?: () => void }

const useUpdateFollowModule = ({ onSuccess, onIndex }: UpdateFollowModuleOptions = {}): UpdateFollowModule => {
	const { chain } = useNetwork()
	const { profile } = useProfile()
	const { isConnected } = useAccount()

	//#region Data Hooks
	const [getTypedData, { loading: dataLoading, error: dataError }] = useMutation<
		{
			createSetFollowModuleTypedData: Mutation['createSetFollowModuleTypedData']
		},
		MutationCreateSetFollowModuleTypedDataArgs
	>(UPDATE_FOLLOW_MODULE_SIG, {
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
		data: txData,
		isLoading: txLoading,
		error: txError,
	} = useContractWrite({
		mode: 'recklesslyUnprepared',
		addressOrName: LENSHUB_PROXY,
		contractInterface: LensHubProxy,
		functionName: 'setFollowModuleWithSig',
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
		expectsMetadata: false,
		txId: (broadcastResult?.broadcast as RelayerResult)?.txId as string,
	})

	const updateFollowModule = useCallback(
		async (followModule: FollowModuleParams) => {
			if (!isConnected) throw toast.error('Please connect your wallet first.')
			if (chain?.unsupported) throw toast.error('Please change your network.')
			if (!profile?.id) throw toast.error('Please create a Lens profile first.')

			const { id, typedData } = await toastOn(
				async () => {
					const {
						data: { createSetFollowModuleTypedData },
					} = await getTypedData({
						variables: {
							request: {
								followModule,
								profileId: profile.id,
							},
						},
					})

					return createSetFollowModuleTypedData
				},
				{
					loading: 'Getting signature details...',
					success: 'Signature is ready!',
					error: 'Something went wrong! Please try again later',
				}
			)

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
							profileId: profile.id,
							followModule: typedData.value.followModule,
							followModuleInitData: typedData.value.followModuleInitData,
							sig: { v, r, s, deadline: typedData.value.deadline },
						},
					}),
				{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
			)

			return resolveOnAction({ txHash: tx.hash })
		},
		[isConnected, chain?.unsupported, profile?.id, getTypedData, signRequest, broadcast, sendTx, resolveOnAction]
	)

	return {
		updateFollowModule,
		loading: dataLoading || sigLoading || txLoading || gasslessLoading,
		error: dataError || sigError || txError || gasslessError,
	}
}

export default useUpdateFollowModule
