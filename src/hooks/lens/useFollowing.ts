import { useAccount } from 'wagmi'
import { useQuery } from '@apollo/client'
import DOES_FOLLOW from '@/graphql/profiles/is-following'

const useFollowing = (profileId: string): boolean => {
	const { data: accountData } = useAccount()

	const { data: followData } = useQuery(DOES_FOLLOW, {
		variables: { address: accountData?.address, profileId },
		skip: !accountData?.address || !profileId,
	})

	return followData?.doesFollow?.[0]?.follows ?? false
}

export default useFollowing
