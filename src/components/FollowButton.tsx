import toast from 'react-hot-toast'
import { toastOn } from '@/lib/toasts'
import { ERROR_MESSAGE } from '@/lib/consts'
import useFollowing from '@/hooks/lens/useFollowing'
import { FC, useCallback, useMemo, useState } from 'react'
import useFollowProfile from '@/hooks/lens/useFollowProfile'
import { FollowModuleRedeemParams, Profile } from '@/types/lens'
import useUnfollowProfile from '@/hooks/lens/useUnfollowProfile'

const FollowButton: FC<{ profile: Profile }> = ({ profile }) => {
	const { unfollowProfile } = useUnfollowProfile()
	const { data: isFollowing, refetch } = useFollowing(profile?.id)
	const [tempFollowing, setTempFollowing] = useState<boolean>(false)
	const { followProfile } = useFollowProfile({ onSuccess: () => setTempFollowing(true), onIndex: refetch })

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

	const follow = useCallback(async () => {
		const waitForIndex = await followProfile(profile?.id, followModule)

		await toastOn(waitForIndex, {
			loading: 'Processing subscription...',
			success: 'Subscribed to channel!',
			error: ERROR_MESSAGE,
		})
	}, [profile?.id, followModule, followProfile])

	const unfollow = useCallback(async () => {
		const waitForIndex = await unfollowProfile(profile?.id)
		setTempFollowing(false)

		await toastOn(waitForIndex, {
			loading: 'Processing subscription...',
			success: 'Unsubscribed from channel!',
			error: ERROR_MESSAGE,
		})
		refetch()
	}, [profile?.id, unfollowProfile, refetch])

	if (isFollowing || tempFollowing) {
		return (
			<button
				onClick={unfollow}
				className="px-3 py-2 bg-gray-200 uppercase text-gray-600 font-medium text-sm rounded-md"
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
				onClick={follow}
				className="px-3 py-2 bg-red-600 uppercase text-red-50 font-medium text-sm rounded-md whitespace-nowrap"
			>
				Join for {profile.followModule.amount.value} ${profile.followModule.amount.asset.symbol}
			</button>
		)
	}

	return (
		<button onClick={follow} className="px-3 py-2 bg-red-600 uppercase text-red-50 font-medium text-sm rounded-md">
			Subscribe
		</button>
	)
}

export default FollowButton
