import { Media, MediaSet } from '@/types/lens'

export const includesImage = (media: MediaSet[]): boolean => {
	return media.some(({ original: { mimeType } }) => mimeType.startsWith('image'))
}

export const getImageUrl = (media: MediaSet[]): string => {
	return normalizeUrl(media.find(({ original: { mimeType } }) => mimeType.startsWith('image'))?.original?.url)
}

export const getVideo = (media: MediaSet[]): Media | null => {
	const video = media.find(({ original: { mimeType } }) => mimeType.startsWith('video'))?.original

	if (!video) return
	return { ...video, url: normalizeUrl(video.url) }
}

export const normalizeUrl = (url: string): string => {
	if (!url) return null
	const parsed = new URL(url)

	if (parsed.protocol == 'ipfs:') {
		return `https://dweb.link/ipfs/${parsed.hostname != '' ? parsed.hostname : parsed.pathname.slice(2)}`
	}

	return url
}
