import { FC } from 'react'
import toast from 'react-hot-toast'
import { Profile } from '@/types/lens'
import useFollowing from '@/hooks/lens/useFollowing'

const FollowButton: FC<{ profile: Profile }> = ({ profile }) => {
	const isFollowing = useFollowing(profile?.id)

	const followProfile = () => {
		toast.error('Not implemented yet')
	}

	const unfollowProfile = () => {
		toast.error('Not implemented yet')
	}

	if (isFollowing) {
		return (
			<button
				onClick={unfollowProfile}
				className="px-3 py-2 bg-gray-300 uppercase text-gray-600 font-medium text-sm rounded-md"
			>
				Subscribed
			</button>
		)
	}

	if (profile?.followModule?.__typename == 'RevertFollowModuleSettings') {
		return (
			<button
				onClick={() => toast.error("This profile isn't accepting new followers right now")}
				className="px-3 py-2 bg-red-300 uppercase text-red-50 font-medium text-sm rounded-md cursor-not-allowed"
			>
				Subscribe
			</button>
		)
	}

	if (profile?.followModule?.__typename == 'FeeFollowModuleSettings') {
		return (
			<button
				onClick={followProfile}
				className="px-3 py-2 bg-red-600 uppercase text-red-50 font-medium text-sm rounded-md"
			>
				Join for {profile.followModule.amount.value} ${profile.followModule.amount.asset.symbol}
			</button>
		)
	}

	return (
		<button
			onClick={followProfile}
			className="px-3 py-2 bg-red-600 uppercase text-red-50 font-medium text-sm rounded-md"
		>
			Subscribe
		</button>
	)
}

export default FollowButton
