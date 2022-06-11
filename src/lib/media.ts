import { Media, MediaSet } from '@/types/lens'

export const includesImage = (media: MediaSet[]): boolean => {
	return media.some(({ original: { mimeType } }) => mimeType.startsWith('image'))
}

export const getImageUrl = (media: MediaSet[]): string => {
	const image = media.find(({ original: { mimeType } }) => mimeType.startsWith('image'))?.original

	if (!image) return
	return normalizeUrl(image.url, image.mimeType)
}

export const getVideo = (media: MediaSet[]): Media | null => {
	const video = media.find(({ original: { mimeType } }) => mimeType.startsWith('video'))?.original

	if (!video) return
	return { ...video, url: normalizeUrl(video.url, video.mimeType) }
}

export const normalizeUrl = (url: string, mimeType: string): string => {
	if (!url) return null
	const parsed = new URL(url)

	if (parsed.protocol == 'ipfs:') {
		return `https://${mimeType?.startsWith('video') ? 'dweb.link' : 'ipfs.infura.io'}/ipfs/${
			parsed.hostname != '' ? parsed.hostname : parsed.pathname.slice(2)
		}`
	}

	return url
}
