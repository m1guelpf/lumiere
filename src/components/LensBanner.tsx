import Image from 'next/image'
import { FC, useMemo } from 'react'
import { Profile } from '@/types/lens'
import { normalizeUrl } from '@/lib/media'
import Skeleton from 'react-loading-skeleton'

const LensBanner: FC<{ profile: Profile; className?: string }> = ({ profile, className = '' }) => {
	const bannerURL = useMemo(() => {
		if (!profile) return
		if (!profile?.coverPicture) return `https://avatar.tobi.sh/${profile?.handle}.png`

		if (profile.coverPicture?.__typename == 'NftImage') return normalizeUrl(profile.coverPicture?.uri)
		return normalizeUrl(profile.coverPicture.original.url)
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
