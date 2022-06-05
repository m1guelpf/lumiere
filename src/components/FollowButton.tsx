import { FC } from 'react'
import toast from 'react-hot-toast'
import useFollowing from '@/hooks/lens/useFollowing'

const FollowButton: FC<{ profileId: string }> = ({ profileId }) => {
	const isFollowing = useFollowing(profileId)

	const followProfile = () => {
		toast.error('Not implemented yet')
	}

	const unfollowProfile = () => {
		toast.error('Not implemented yet')
	}

	if (!isFollowing) {
		return (
			<button
				onClick={followProfile}
				className="px-3 py-2 bg-red-600 uppercase text-red-50 font-medium text-sm rounded-lg"
			>
				Subscribe
			</button>
		)
	}

	return (
		<button
			onClick={unfollowProfile}
			className="px-3 py-2 bg-gray-300 uppercase text-gray-600 font-medium text-sm rounded-lg"
		>
			Subscribed
		</button>
	)
}

export default FollowButton
