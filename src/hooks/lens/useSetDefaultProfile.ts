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
import { Mutation, MutationCreateSetDefaultProfileTypedDataArgs, RelayerResult } from '@/types/lens'

type SetDefaultProfile = {
	setDefaultProfile: (profileId: string) => Promise<() => Promise<unknown>>
	loading: boolean
	error?: Error
}
type SetDefaultProfileOptions = { onSuccess?: () => void; onIndex?: () => void }

const DEFAULT_PROFILE_REQUEST_SIG = gql`
	mutation ($request: CreateSetDefaultProfileRequest!) {
		createSetDefaultProfileTypedData(request: $request) {
			id
			expiresAt
			typedData {
				types {
					SetDefaultProfileWithSig {
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
					wallet
					profileId
				}
			}
		}
	}
`

const useSetDefaultProfile = ({ onSuccess, onIndex }: SetDefaultProfileOptions = {}): SetDefaultProfile => {
	const { chain } = useNetwork()
	const { isConnected } = useAccount()
	const { profile: activeProfile } = useProfile()

	//#region Data Hooks
	const [getTypedData, { loading: dataLoading, error: dataError }] = useMutation<
		{
			createSetDefaultProfileTypedData: Mutation['createSetDefaultProfileTypedData']
		},
		MutationCreateSetDefaultProfileTypedDataArgs
	>(DEFAULT_PROFILE_REQUEST_SIG, {
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
		functionName: 'setDefaultProfileWithSig',
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

	const setDefaultProfile = useCallback(
		async (profileId: string) => {
			if (!isConnected) throw toast.error('Please connect your wallet first.')
			if (chain?.unsupported) throw toast.error('Please change your network.')
			if (!activeProfile?.id) throw toast.error('Please create a Lens profile first.')

			const { id, typedData } = await toastOn(
				async () => {
					const {
						data: { createSetDefaultProfileTypedData },
					} = await getTypedData({
						variables: {
							request: {
								profileId,
							},
						},
					})

					return createSetDefaultProfileTypedData
				},
				{
					loading: 'Getting signature details...',
					success: 'Signature is ready!',
					error: ERROR_MESSAGE,
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
							profileId,
							wallet: typedData.value.wallet,
							sig: { v, r, s, deadline: typedData.value.deadline },
						},
					}),
				{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
			)

			return resolveOnAction({ txHash: tx.hash })
		},
		[
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
		setDefaultProfile,
		loading: dataLoading || sigLoading || txLoading || gasslessLoading,
		error: dataError || sigError || txError || gasslessError,
	}
}

export default useSetDefaultProfile
