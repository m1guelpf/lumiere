import { forwardRef, Ref } from 'react'
import { classNames } from '@/lib/utils'

type Props = {
	className?: string
	accessibilityLabel?: string
}

// eslint-disable-next-line react/display-name
const Spinner = forwardRef(({ accessibilityLabel, className = '' }: Props, ref: Ref<HTMLDivElement>) => {
	return (
		<div className={classNames(className, 'w-6 h-6 stroke-current animate-spin stroke-[1.5px]')} ref={ref}>
			{accessibilityLabel && <span className="sr-only">{accessibilityLabel}</span>}

			<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<circle cx="12" cy="12" fill="none" r="10" strokeDasharray="42" strokeLinecap="round" />
				<circle cx="12" cy="12" fill="none" opacity="0.25" r="10" strokeLinecap="round" />
			</svg>
		</div>
	)
})

export default Spinner
