import { ethers } from 'ethers'
import { omit } from '@/lib/utils'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { toastOn } from '@/lib/toasts'
import useWaitForAction from './useWaitForAction'
import LensHubProxy from '@/abis/LensHubProxy.json'
import { useProfile } from '@/context/ProfileContext'
import { gql, useMutation, useQuery } from '@apollo/client'
import BROADCAST_MUTATION from '@/graphql/broadcast/broadcast'
import { ERROR_MESSAGE, LENSHUB_PROXY, RELAYER_ON } from '@/lib/consts'
import CREATE_MIRROR_SIG from '@/graphql/publications/mirror-publication-request'
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi'
import { Mutation, MutationCreateMirrorTypedDataArgs, ReferenceModuleParams, RelayerResult } from '@/types/lens'

type MirrorPublication = {
	data: boolean
	mirrorPublication: (publicationId: string, refModule: ReferenceModuleParams) => Promise<() => Promise<unknown>>
	loading: boolean
	error?: Error
}
type MirrorPublicationOptions = { onSuccess?: () => void; onIndex?: () => void }

const HAS_MIRRORED_QUERY = gql`
	query HasMirroredPublication($publicationId: InternalPublicationId!, $profileId: ProfileId) {
		publication(request: { publicationId: $publicationId }) {
			... on Post {
				mirrors(by: $profileId)
			}
			... on Comment {
				mirrors(by: $profileId)
			}
		}
	}
`

const useMirrorPublication = (
	publicationId?: string,
	{ onSuccess, onIndex }: MirrorPublicationOptions = {}
): MirrorPublication => {
	const { profile } = useProfile()
	const { chain } = useNetwork()
	const { isConnected } = useAccount()

	const { data: collectedData, refetch } = useQuery<
		{ publication: { mirrors: string[] } },
		{ publicationId: string; profileId?: string }
	>(HAS_MIRRORED_QUERY, {
		variables: { publicationId, profileId: profile?.id },
		skip: !publicationId || !profile,
	})

	//#region Data Hooks
	const [getTypedData, { loading: dataLoading, error: dataError }] = useMutation<
		{
			createMirrorTypedData: Mutation['createMirrorTypedData']
		},
		MutationCreateMirrorTypedDataArgs
	>(CREATE_MIRROR_SIG, {
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
		functionName: 'mirrorWithSig',
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
			refetch()

			onIndex && onIndex()
		},
		txHash: txData?.hash,
		txId: (broadcastResult?.broadcast as RelayerResult)?.txId as string,
	})

	const mirrorPublication = useCallback(
		async (publicationId: string, refModule: ReferenceModuleParams) => {
			if (!isConnected) throw toast.error('Please connect your wallet first.')
			if (chain?.unsupported) throw toast.error('Please change your network.')
			if (!profile?.id) throw toast.error('Please create a Lens profile first.')

			const { id, typedData } = await toastOn(
				async () => {
					const {
						data: { createMirrorTypedData },
					} = await getTypedData({
						variables: {
							request: {
								profileId: profile.id,
								publicationId,
								referenceModule: refModule,
							},
						},
					})

					return createMirrorTypedData
				},
				{
					loading: 'Getting signature details...',
					success: 'Signature is ready!',
					error: ERROR_MESSAGE,
				}
			)

			const {
				profileId,
				profileIdPointed,
				pubIdPointed,
				referenceModuleData,
				referenceModule,
				referenceModuleInitData,
				deadline,
			} = typedData.value

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
							profileIdPointed,
							pubIdPointed,
							referenceModuleData,
							referenceModule,
							referenceModuleInitData,
							sig: { v, r, s, deadline },
						},
					}),
				{ loading: 'Sending transaction...', success: 'Transaction sent!', error: ERROR_MESSAGE }
			)

			return resolveOnAction({ txHash: tx.hash })
		},
		[isConnected, chain?.unsupported, profile?.id, getTypedData, signRequest, broadcast, sendTx, resolveOnAction]
	)

	return {
		mirrorPublication,
		data: collectedData?.publication?.mirrors?.length > 0,
		loading: dataLoading || sigLoading || txLoading || gasslessLoading,
		error: dataError || sigError || txError || gasslessError,
	}
}

export default useMirrorPublication
