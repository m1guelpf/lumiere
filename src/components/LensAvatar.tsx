import Image from 'next/image'
import { FC, useMemo } from 'react'
import { Profile } from '@/types/lens'
import Skeleton from 'react-loading-skeleton'

const LensAvatar: FC<{ profile: Profile; width: number; height: number; className?: string }> = ({
	profile,
	width,
	height,
	className = '',
}) => {
	const avatarUrl = useMemo<string | null>(() => {
		if (!profile) return
		if (!profile?.picture) return `https://avatar.tobi.sh/${profile.handle}.png`

		if (profile.picture?.__typename == 'NftImage') return profile.picture?.uri
		return profile.picture.original.url
	}, [profile])

	return (
		<div className={`relative ${className}`}>
			{avatarUrl ? (
				<Image
					src={avatarUrl}
					alt={profile?.name ?? profile?.handle}
					width={width}
					height={height}
					className="rounded-full"
				/>
			) : (
				<div className="-mt-1">
					<Skeleton circle width={width} height={height} />
				</div>
			)}
		</div>
	)
}

export default LensAvatar
