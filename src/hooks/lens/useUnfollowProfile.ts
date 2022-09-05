import { omit } from '@/lib/utils'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { toastOn } from '@/lib/toasts'
import { ethers, Transaction } from 'ethers'
import FollowNFT from '@/abis/FollowNFT.json'
import { gql, useMutation } from '@apollo/client'
import useWaitForAction from './useWaitForAction'
import { useProfile } from '@/context/ProfileContext'
import { ERROR_MESSAGE, RELAYER_ON } from '@/lib/consts'
import BROADCAST_MUTATION from '@/graphql/broadcast/broadcast'
import { useAccount, useNetwork, useSigner, useSignTypedData } from 'wagmi'
import { FollowModuleRedeemParams, Mutation, MutationCreateUnfollowTypedDataArgs, RelayerResult } from '@/types/lens'

const UNFOLLOW_SIG = gql`
	mutation ($request: UnfollowRequest!) {
		createUnfollowTypedData(request: $request) {
			id
			expiresAt
			typedData {
				domain {
					name
					chainId
					version
					verifyingContract
				}
				types {
					BurnWithSig {
						name
						type
					}
				}
				value {
					nonce
					deadline
					tokenId
				}
			}
		}
	}
`

type UnfollowProfile = {
	unfollowProfile: (profileId: string) => Promise<() => Promise<unknown>>
	loading: boolean
	error?: Error
}
type UnfollowProfileOptions = { onSuccess?: () => void; onIndex?: () => void }

const useUnfollowProfile = ({ onSuccess, onIndex }: UnfollowProfileOptions = {}): UnfollowProfile => {
	const { chain } = useNetwork()
	const { data: signer } = useSigner()
	const { isConnected } = useAccount()
	const { profile: activeProfile } = useProfile()

	//#region Data Hooks
	const [getTypedData, { loading: dataLoading, error: dataError }] = useMutation<
		{
			createUnfollowTypedData: Mutation['createUnfollowTypedData']
		},
		MutationCreateUnfollowTypedDataArgs
	>(UNFOLLOW_SIG, {
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
		expectsMetadata: false,
		txId: (broadcastResult?.broadcast as RelayerResult)?.txId as string,
	})

	const unfollowProfile = useCallback(
		async (profileId: string) => {
			if (!isConnected) throw toast.error('Please connect your wallet first.')
			if (chain?.unsupported) throw toast.error('Please change your network.')
			if (!activeProfile?.id) throw toast.error('Please create a Lens profile first.')

			const { id, typedData } = await toastOn(
				async () => {
					const {
						data: { createUnfollowTypedData },
					} = await getTypedData({
						variables: {
							request: {
								profile: profileId,
							},
						},
					})

					return createUnfollowTypedData
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

			const followNftContract = new ethers.Contract(typedData.domain.verifyingContract, FollowNFT, signer)

			const sig = { v, r, s, deadline: typedData.value.deadline }

			const tx = await toastOn(() => followNftContract.burnWithSig(typedData.value.tokenId, sig), {
				loading: 'Sending transaction...',
				success: 'Transaction sent!',
				error: ERROR_MESSAGE,
			})

			onSuccess()

			return resolveOnAction({ txHash: (tx as Transaction).hash })
		},
		[
			signer,
			onSuccess,
			isConnected,
			chain?.unsupported,
			activeProfile?.id,
			getTypedData,
			signRequest,
			broadcast,
			resolveOnAction,
		]
	)

	return {
		unfollowProfile,
		loading: dataLoading || sigLoading || gasslessLoading,
		error: dataError || sigError || gasslessError,
	}
}

export default useUnfollowProfile
