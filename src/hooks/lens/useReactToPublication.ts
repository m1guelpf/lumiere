import toast from 'react-hot-toast'
import { useCallback } from 'react'
import { toastOn } from '@/lib/toasts'
import { ERROR_MESSAGE } from '@/lib/consts'
import { useAccount, useNetwork } from 'wagmi'
import { gql, useMutation } from '@apollo/client'
import { useProfile } from '@/context/ProfileContext'
import { Mutation, MutationAddReactionArgs, ReactionTypes } from '@/types/lens'

type ReactToPublication = {
	reactToPublication: (publicationId: string, reaction: ReactionTypes) => Promise<unknown>
	upvotePublication: (publicationId: string) => Promise<unknown>
	downvotePublication: (publicationId: string) => Promise<unknown>
	loading: boolean
	error?: Error
}
type ReactToPublicationOptions = { onSuccess?: () => void }

const ADD_REACTION_MUTATION = gql`
	mutation AddReaction($request: ReactionRequest!) {
		addReaction(request: $request)
	}
`

const useReactToPublication = ({ onSuccess }: ReactToPublicationOptions = {}): ReactToPublication => {
	const { profile } = useProfile()
	const { activeChain } = useNetwork()
	const { data: account } = useAccount()

	//#region Data Hooks
	const [react, { loading, error }] = useMutation<
		{
			addReaction: Mutation['addReaction']
		},
		MutationAddReactionArgs
	>(ADD_REACTION_MUTATION, {
		onCompleted() {
			onSuccess && onSuccess()
		},
	})
	//#endregion

	const reactToPublication = useCallback(
		async (publicationId: string, reaction: ReactionTypes) => {
			if (!account?.address) return toast.error('Please connect your wallet first.')
			if (activeChain?.unsupported) return toast.error('Please change your network.')
			if (!profile?.id) return toast.error('Please create a Lens profile first.')

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
					loading: `${reaction == ReactionTypes.Upvote ? 'Upvoting' : 'Downvoting'}...`,
					success: `${reaction == ReactionTypes.Upvote ? 'Upvoted' : 'Downvoted'}!`,
					error: err => {
						if (!err?.message) return ERROR_MESSAGE
						if (!err.message.startsWith('You have already reacted')) return err?.message

						return `Already ${reaction == ReactionTypes.Upvote ? 'Upvoted' : 'Downvoted'}.`
					},
				}
			)
		},
		[account?.address, activeChain?.unsupported, profile?.id, react]
	)

	return {
		reactToPublication,
		upvotePublication: (publicationId: string) => reactToPublication(publicationId, ReactionTypes.Upvote),
		downvotePublication: (publicationId: string) => reactToPublication(publicationId, ReactionTypes.Downvote),
		loading,
		error,
	}
}

export default useReactToPublication
