import { FC, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { classNames, linkify } from '@/lib/utils'

const LensVideoDescription: FC<{ description: string | null; loading: boolean; className?: string }> = ({
	description,
	loading,
	className = '',
}) => {
	const [expandDescription, setExpandDescription] = useState<boolean>(false)

	const processed = useMemo<string>(() => linkify(description), [description])

	if (!description) return null

	return (
		<div className={className}>
			<div
				className={classNames(
					!expandDescription && 'max-h-16 overflow-hidden',
					'max-w-2xl text-sm whitespace-pre-wrap break-words'
				)}
			>
				{loading ? <Skeleton count={3} width={500} /> : <p dangerouslySetInnerHTML={{ __html: processed }} />}
			</div>
			<button
				onClick={() => setExpandDescription(!expandDescription)}
				className="uppercase text-gray-500 font-medium text-xs"
			>
				{expandDescription ? 'Show Less' : 'Show More'}
			</button>
		</div>
	)
}

export default LensVideoDescription
