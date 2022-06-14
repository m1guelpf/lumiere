import omitDeep from 'omit-deep'
import toast from 'react-hot-toast'
import Autolinker from 'autolinker'
import copy from 'copy-to-clipboard'

export const classNames = (...classes: string[]): string => classes.filter(Boolean).join(' ')

export const omit = <T>(object: T, name: string): Omit<T, '__typename'> => omitDeep(object, name)

export const unCapitalize = (value: string): string => value.charAt(0).toLowerCase() + value.slice(1)

export const trimIndentedSpaces = (value: string): string => value?.replace(/\n\s*\n/g, '\n\n').trim()

export const linkify = (value: string): string => {
	return Autolinker.link(value, {
		replaceFn: match => {
			if (
				match.getType() == 'mention' &&
				// @ts-ignore
				match.getServiceName() == 'tiktok'
			) {
				// @ts-ignore
				return `<a href="https://open.withlens.app/profile/${match.getMention()}" target="_blank" rel="noreferrer" class="underline">@${match.getMention()}</a>`
			}
		},
		mention: 'tiktok',
		stripPrefix: false,
		sanitizeHtml: true,
		className: 'text-blue-500',
	})
}

export const shareLink = (url: string) => {
	if (!navigator?.canShare?.({ url })) {
		toast.success('Copied to clipboard!')
		return copy(url)
	}

	navigator.share({ url })
}
