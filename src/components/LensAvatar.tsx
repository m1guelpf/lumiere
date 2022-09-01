import Image from 'next/image'
import { FC, useMemo } from 'react'
import { Profile } from '@/types/lens'
import Skeleton from 'react-loading-skeleton'
import { normalizeUrl, resolveImageUrl } from '@/lib/media'

const LensAvatar: FC<{ profile: Profile; width: number; height: number; className?: string; srcOverride?: string }> = ({
	profile,
	width,
	height,
	srcOverride,
	className = '',
}) => {
	const avatarUrl = useMemo<string | null>(() => {
		if (!profile) return
		if (srcOverride !== undefined) return normalizeUrl(srcOverride)
		if (!profile?.picture) return `https://avatar.tobi.sh/${profile.handle}.png`

		return resolveImageUrl(profile.picture)
	}, [profile, srcOverride])

	return (
		<div className={`relative ${className}`} style={{ width, height }}>
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
