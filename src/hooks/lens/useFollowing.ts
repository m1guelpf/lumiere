import { useAccount } from 'wagmi'
import { useQuery } from '@apollo/client'
import DOES_FOLLOW from '@/graphql/profiles/is-following'

const useFollowing = (profileId: string): { data: boolean; refetch: () => void } => {
	const { data: accountData } = useAccount()

	const { data: followData, refetch } = useQuery(DOES_FOLLOW, {
		variables: { address: accountData?.address, profileId },
		skip: !accountData?.address || !profileId,
	})

	return { data: followData?.doesFollow?.[0]?.follows ?? false, refetch }
}

export default useFollowing
