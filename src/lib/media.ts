import { MediaSet } from '@/types/lens'

export const includesImage = (media: MediaSet[]): boolean => {
	return media.some(({ original: { mimeType } }) => mimeType.startsWith('image'))
}

export const getImageUrl = (media: MediaSet[]): string => {
	return normalizeUrl(media.find(({ original: { mimeType } }) => mimeType.startsWith('image')).original.url)
}

export const normalizeUrl = (url: string): string => {
	const parsed = new URL(url)

	if (parsed.protocol == 'ipfs:') return `https://ipfs.infura.io/ipfs/${parsed.pathname.slice(2)}`
	return url
}
