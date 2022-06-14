import { FC, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import useFollowing from '@/hooks/lens/useFollowing'
import useFollowProfile from '@/hooks/lens/useFollowProfile'
import { FollowModuleRedeemParams, Profile } from '@/types/lens'

const FollowButton: FC<{ profile: Profile }> = ({ profile }) => {
	const [tempFollowing, setTempFollowing] = useState<boolean>(false)
	const isFollowing = useFollowing(profile?.id)
	const { followProfile } = useFollowProfile({ onSuccess: () => setTempFollowing(true) })

	const followModule = useMemo<FollowModuleRedeemParams>(() => {
		if (!profile?.followModule) return

		if (profile?.followModule?.__typename == 'FeeFollowModuleSettings') {
			return {
				feeFollowModule: {
					amount: {
						currency: profile?.followModule?.amount?.asset?.address,
						value: profile?.followModule?.amount?.value,
					},
				},
			}
		}

		if (profile?.followModule?.__typename == 'ProfileFollowModuleSettings') {
			return {
				profileFollowModule: {
					profileId: profile?.id,
				},
			}
		}
	}, [profile?.followModule, profile?.id])

	const unfollowProfile = () => {
		toast.error('Not implemented yet')
	}

	if (isFollowing || tempFollowing) {
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
				onClick={() => followProfile(profile?.id, followModule)}
				className="px-3 py-2 bg-red-600 uppercase text-red-50 font-medium text-sm rounded-md"
			>
				Join for {profile.followModule.amount.value} ${profile.followModule.amount.asset.symbol}
			</button>
		)
	}

	return (
		<button
			onClick={() => followProfile(profile?.id, followModule)}
			className="px-3 py-2 bg-red-600 uppercase text-red-50 font-medium text-sm rounded-md"
		>
			Subscribe
		</button>
	)
}

export default FollowButton
