import { useQuery } from '@apollo/client'
import { useProfile } from '@/context/ProfileContext'
import DOES_FOLLOW from '@/graphql/profiles/is-following'

const useFollowing = (profileId: string): { data: boolean; refetch: () => void } => {
	const { profile } = useProfile()

	const { data: followData, refetch } = useQuery<{ profile: { isFollowedByMe: boolean } }>(DOES_FOLLOW, {
		variables: { profileId },
		skip: !profile || !profileId,
	})

	return { data: followData?.profile?.isFollowedByMe, refetch }
}

export default useFollowing
