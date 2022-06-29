import { FC } from 'react'
import { verifiedProfiles } from '@/lib/consts'
import { BadgeCheckIcon } from '@heroicons/react/solid'

const VerifiedIcon: FC<{ className?: string; profileId?: string }> = ({ className, profileId }) => {
	if (!verifiedProfiles.includes(profileId)) return null

	return <BadgeCheckIcon className={className} />
}

export default VerifiedIcon
