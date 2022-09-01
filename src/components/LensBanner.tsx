import Image from 'next/image'
import { FC, useMemo } from 'react'
import { Profile } from '@/types/lens'
import Skeleton from 'react-loading-skeleton'
import { resolveImageUrl } from '@/lib/media'

const LensBanner: FC<{ profile: Profile; className?: string }> = ({ profile, className = '' }) => {
	const bannerURL = useMemo(() => {
		if (!profile) return
		if (!profile?.coverPicture) return `https://avatar.tobi.sh/${profile?.handle}.png`

		return resolveImageUrl(profile.coverPicture)
	}, [profile])

	return bannerURL ? (
		<div className={className}>
			<Image
				layout="fill"
				objectFit="cover"
				src={bannerURL}
				alt={`${profile?.name ?? profile?.handle}'s banner`}
			/>
		</div>
	) : (
		<Skeleton className={className} />
	)
}

export default LensBanner
