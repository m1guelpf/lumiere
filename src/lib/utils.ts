import omitDeep from 'omit-deep'
import Autolinker from 'autolinker'
import copy from 'copy-to-clipboard'

export const classNames = (...classes: string[]): string => classes.filter(Boolean).join(' ')

export const validateAccept = (fileType: string, accept: React.AllHTMLAttributes<HTMLInputElement>['accept']) => {
	const allowedTypes = accept?.split(', ')
	if (!allowedTypes) return true

	const mime = getMimeType(fileType)

	return allowedTypes.some(x => {
		const allowedMime = getMimeType(x)

		return allowedMime.type === mime.type && allowedMime.subtype === mime.subtype
	})
}

const getMimeType = (type: string) => {
	const parts = type.split('/')

	return { type: parts[0], subtype: parts[1] }
}

export const dataURItoFile = (dataURI: string, fileName: string): File => {
	const [, , type, , encodedByteString] = /^(data:)([\w\/\+-]*)(;charset=[\w-]+|;base64){0,1},(.*)/gi.exec(dataURI)
	const byteString = Buffer.from(encodedByteString, 'base64').toString('binary')

	var u8arr = new Uint8Array(byteString.length)
	for (var i = 0; i < byteString.length; i++) u8arr[i] = byteString.charCodeAt(i)

	return new File([new Blob([u8arr], { type })], fileName)
}

export const omit = <T>(object: T, name: string): Omit<T, '__typename'> => omitDeep(object, name)

export const trimIndentedSpaces = (value: string): string => value?.replace(/\n\s*\n/g, '\n\n').trim()

export const linkify = (value: string): string =>
	Autolinker.link(value, {
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

export const shareLink = (url: string) => {
	if (!navigator?.canShare?.({ url })) return copy(url)

	navigator.share({ url })
}
