import { ethers } from 'ethers'
import { omit } from '@/lib/utils'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { toastOn } from '@/lib/toasts'
import { uploadJSON } from '@/lib/ipfs'
import { gql, useMutation } from '@apollo/client'
import useWaitForAction from './useWaitForAction'
import { useProfile } from '@/context/ProfileContext'
import LensPeriphery from '@/abis/LensPeriphery.json'
import { Mutation, RelayerResult } from '@/types/lens'
import { Metadata, ProfileMetadata } from '@/types/metadata'
import BROADCAST_MUTATION from '@/graphql/broadcast/broadcast'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { ERROR_MESSAGE, LENSHUB_PROXY, LENS_PERIPHERY, RELAYER_ON } from '@/lib/consts'

const UPDATE_PROFILE_SIG = gql`
	mutation CreateSetProfileMetadataTypedData($profileId: ProfileId!, $metadata: Url!) {
		createSetProfileMetadataTypedData(request: { profileId: $profileId, metadata: $metadata }) {
			id
			expiresAt
			typedData {
				types {
					SetProfileMetadataURIWithSig {
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
					metadata
				}
			}
		}
	}
`

type UpdateProfile = {
	updateProfile: (post: ProfileMetadata) => Promise<() => Promise<unknown>>
	loading: boolean
	error?: Error
}
type UpdateProfileOptions = { onSuccess?: () => void; onIndex?: () => void }

const useUpdateProfile = ({ onSuccess, onIndex }: UpdateProfileOptions = {}): UpdateProfile => {
	const { chain } = useNetwork()
	const { profile } = useProfile()
	const { isConnected } = useAccount()

	//#region Data Hooks
	const [getTypedData, { loading: dataLoading, error: dataError }] = useMutation<{
		createSetProfileMetadataTypedData: Mutation['createSetProfileMetadataTypedData']
	}>(UPDATE_PROFILE_SIG, {
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
		addressOrName: LENS_PERIPHERY,
		contractInterface: LensPeriphery,
		functionName: 'setProfileMetadataURIWithSig',
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

	const updateProfile = useCallback(
		async (profileMetadata: ProfileMetadata) => {
			if (!isConnected) throw toast.error('Please connect your wallet first.')
			if (chain?.unsupported) throw toast.error('Please change your network.')
			if (!profile?.id) throw toast.error('Please create a Lens profile first.')

			const { id, typedData, metadata } = await toastOn(
				async () => {
					const ipfsCID = await uploadJSON(profileMetadata)

					const {
						data: { createSetProfileMetadataTypedData },
					} = await getTypedData({
						variables: {
							profileId: profile.id,
							metadata: `ipfs://${ipfsCID}`,
						},
					})

					return { ...createSetProfileMetadataTypedData, metadata: `ipfs://${ipfsCID}` }
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
							metadata,
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
		updateProfile,
		loading: dataLoading || sigLoading || txLoading || gasslessLoading,
		error: dataError || sigError || txError || gasslessError,
	}
}

export default useUpdateProfile
