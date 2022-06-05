import { FC, useMemo } from 'react'
import { Profile } from '@/types/lens'
import Skeleton from 'react-loading-skeleton'

const LensBanner: FC<{ profile: Profile; className?: string }> = ({ profile, className = '' }) => {
	const bannerURL = useMemo(() => {
		if (!profile) return
		if (!profile?.coverPicture) return `https://avatar.tobi.sh/${profile?.handle}.png`

		if (profile.coverPicture?.__typename == 'NftImage') return profile.coverPicture?.uri
		return profile.coverPicture.original.url
	}, [profile])

	return bannerURL ? (
		<img className={className} src={bannerURL} alt={`${profile?.name}'s banner`} />
	) : (
		<Skeleton className={className} />
	)
}

export default LensBanner
