import { ClipboardCheckIcon, ClipboardCopyIcon } from '@heroicons/react/outline'
import copy from 'copy-to-clipboard'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

const CopyIcon = ({ text, className = '', iconClassName = '' }) => {
	const [justCopied, setJustCopied] = useState<boolean>(false)

	const copyText = useCallback(() => {
		copy(text)
		toast.success('Copied!')

		setJustCopied(true)
		setTimeout(() => setJustCopied(false), 500)
	}, [text, setJustCopied])

	return (
		<button type="button" onClick={copyText} className={className}>
			{justCopied ? (
				<ClipboardCheckIcon className={iconClassName} />
			) : (
				<ClipboardCopyIcon className={iconClassName} />
			)}
		</button>
	)
}

export default CopyIcon
