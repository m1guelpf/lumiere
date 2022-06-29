import toast from 'react-hot-toast'
import { useCallback } from 'react'
import { toastOn } from '@/lib/toasts'
import { ERROR_MESSAGE } from '@/lib/consts'
import { useAccount, useNetwork } from 'wagmi'
import { useProfile } from '@/context/ProfileContext'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Mutation, MutationAddReactionArgs, MutationRemoveReactionArgs, ReactionTypes } from '@/types/lens'

type ReactToPublication = {
	error?: Error
	loading: boolean
	data?: { totalUpvotes?: number; totalDownvotes?: number; userReaction?: ReactionTypes }
	upvotePublication: (publicationId: string) => Promise<unknown>
	downvotePublication: (publicationId: string) => Promise<unknown>
	removeReaction: (publicationId: string, reaction: ReactionTypes) => Promise<unknown>
	reactToPublication: (publicationId: string, reaction: ReactionTypes) => Promise<unknown>
}
type ReactToPublicationOptions = { onSuccess?: () => void }

const HAS_REACTED_QUERY = gql`
	query HasReactedToPublication($publicationId: InternalPublicationId!, $profileId: ProfileId!) {
		publication(request: { publicationId: $publicationId }) {
			... on Post {
				reaction(request: { profileId: $profileId })
				stats {
					totalUpvotes
					totalDownvotes
				}
			}
			... on Comment {
				reaction(request: { profileId: $profileId })
				stats {
					totalUpvotes
					totalDownvotes
				}
			}
			... on Mirror {
				reaction(request: { profileId: $profileId })
				stats {
					totalUpvotes
					totalDownvotes
				}
			}
		}
	}
`

const REMOVE_REACTION_MUTATION = gql`
	mutation RemoveReaction($request: ReactionRequest!) {
		removeReaction(request: $request)
	}
`

const ADD_REACTION_MUTATION = gql`
	mutation AddReaction($request: ReactionRequest!) {
		addReaction(request: $request)
	}
`

const useReactToPublication = (
	publicationId?: string,
	{ onSuccess }: ReactToPublicationOptions = {}
): ReactToPublication => {
	const { profile } = useProfile()
	const { activeChain } = useNetwork()
	const { data: account } = useAccount()

	const { data: reactedData, refetch } = useQuery<
		{ publication: { reaction: ReactionTypes; stats: { totalUpvotes: number; totalDownvotes: number } } },
		{ publicationId: string; profileId: string }
	>(HAS_REACTED_QUERY, {
		variables: { publicationId, profileId: profile?.id },
		skip: !publicationId || !profile,
	})

	//#region Data Hooks
	const [react, { loading: reactLoading, error: reactError }] = useMutation<
		{
			addReaction: Mutation['addReaction']
		},
		MutationAddReactionArgs
	>(ADD_REACTION_MUTATION, {
		onCompleted() {
			refetch()
			onSuccess && onSuccess()
		},
	})
	const [unreact, { loading: removeLoading, error: removeError }] = useMutation<
		{
			removeReaction: Mutation['removeReaction']
		},
		MutationRemoveReactionArgs
	>(REMOVE_REACTION_MUTATION, {
		onCompleted() {
			refetch()
			onSuccess && onSuccess()
		},
	})
	//#endregion

	const reactToPublication = useCallback(
		async (publicationId: string, reaction: ReactionTypes) => {
			if (!account?.address) throw toast.error('Please connect your wallet first.')
			if (activeChain?.unsupported) throw toast.error('Please change your network.')
			if (!profile?.id) throw toast.error('Please create a Lens profile first.')

			return await toastOn(
				async () => {
					const { errors } = await react({
						variables: {
							request: { profileId: profile?.id, reaction, publicationId },
						},
					})

					if (!errors) return

					throw errors[0]
				},
				{
					loading: `${reaction == ReactionTypes.Upvote ? 'Liking' : 'Disliking'}...`,
					success: `${reaction == ReactionTypes.Upvote ? 'Liked' : 'Disliked'}!`,
					error: err => {
						if (!err?.message) return ERROR_MESSAGE
						if (!err.message.startsWith('You have already reacted')) return err?.message

						return `Already ${reaction == ReactionTypes.Upvote ? 'liked' : 'disliked'}.`
					},
				}
			)
		},
		[account?.address, activeChain?.unsupported, profile?.id, react]
	)

	const removeReaction = useCallback(
		async (publicationId: string, reaction: ReactionTypes) => {
			if (!account?.address) throw toast.error('Please connect your wallet first.')
			if (activeChain?.unsupported) throw toast.error('Please change your network.')
			if (!profile?.id) throw toast.error('Please create a Lens profile first.')

			return await toastOn(
				async () => {
					const { errors } = await unreact({
						variables: {
							request: { profileId: profile?.id, reaction, publicationId },
						},
					})

					if (!errors) return

					throw errors[0]
				},
				{
					loading: `Removing ${reaction == ReactionTypes.Upvote ? 'like' : 'dislike'}...`,
					success: `Removed!`,
					error: err => err?.message ?? ERROR_MESSAGE,
				}
			)
		},
		[account?.address, activeChain?.unsupported, profile?.id, unreact]
	)

	return {
		removeReaction,
		reactToPublication,
		error: reactError || removeError,
		loading: reactLoading || removeLoading,
		data: {
			userReaction: reactedData?.publication?.reaction,
			totalUpvotes: reactedData?.publication?.stats?.totalUpvotes,
			totalDownvotes: reactedData?.publication?.stats?.totalDownvotes,
		},
		upvotePublication: (publicationId: string) => reactToPublication(publicationId, ReactionTypes.Upvote),
		downvotePublication: (publicationId: string) => reactToPublication(publicationId, ReactionTypes.Downvote),
	}
}

export default useReactToPublication
