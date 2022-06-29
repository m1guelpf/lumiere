import { FC } from 'react'
import Spinner from './Spinner'
import dynamic from 'next/dynamic'

const StateAwareIcon: FC<{ iconName: string; className?: string; active: boolean; loading?: boolean }> = ({
	iconName,
	loading,
	className,
	active,
}) => {
	const SolidIcon = dynamic<React.ComponentProps<'svg'>>(
		import('@heroicons/react/solid').then(module => module[`${iconName}Icon`])
	)
	const OutlineIcon = dynamic<React.ComponentProps<'svg'>>(
		import('@heroicons/react/outline').then(module => module[`${iconName}Icon`])
	)

	if (loading) return <Spinner className={className} />
	return active ? <SolidIcon className={className} /> : <OutlineIcon className={className} />
}

export default StateAwareIcon
