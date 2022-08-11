type Scalars = {
	Url: string
	MimeType: ImageMimeTypes | VideoMimeTypes | AudioMimeTypes
	Markdown: string
	AppId: string
	Locale: string
}

type ImageMimeTypes =
	| 'image/gif'
	| 'image/jpeg'
	| 'image/png'
	| 'image/tiff'
	| 'image/x-ms-bmp'
	| 'image/svg+xml'
	| 'image/webp'

export type VideoMimeTypes = 'video/webm' | 'video/mp4' | 'video/x-m4v' | 'video/ogv' | 'video/ogg'

type AudioMimeTypes = 'audio/wav' | 'audio/mpeg' | 'audio/ogg'

type PublicationMetadataMedia = {
	item: Scalars['Url']
	/**
	 * This is the mime type of media
	 */
	type: Scalars['MimeType']
}

export enum MetadataVersions {
	one = '1.0.0',
	two = '2.0.0',
}

enum PublicationMetadataDisplayType {
	number = 'number',
	string = 'string',
	date = 'date',
}

type PublicationMetadataAttribute = {
	displayType?: PublicationMetadataDisplayType
	key: string
	traitType?: string
	value: string
}

export enum PublicationContentWarning {
	NSFW = 'NSFW',
	SENSITIVE = 'SENSITIVE',
	SPOILER = 'SPOILER',
}

export enum PublicationMainFocus {
	VIDEO = 'VIDEO',
	IMAGE = 'IMAGE',
	ARTICLE = 'ARTICLE',
	TEXT_ONLY = 'TEXT_ONLY',
	AUDIO = 'AUDIO',
	LINK = 'LINK',
	EMBED = 'EMBED',
}

export type Metadata = {
	/**
	 * The metadata version.
	 */
	version: MetadataVersions

	/**
	 * The metadata lens_id can be anything but if your uploading to ipfs
	 * you will want it to be random.. using uuid could be an option!
	 */
	metadata_id: string

	/**
	 * A human-readable description of the item.
	 */
	description?: Scalars['Markdown']

	/**
	 * The content of a publication. If this is blank `media` must be defined or its out of spec.
	 */
	content?: Scalars['Markdown']

	/**
	 * IOS 639-1 language code aka en or it and ISO 3166-1 alpha-2 region code aka US or IT aka en-US or it-IT
	 * Full spec > https://tools.ietf.org/search/bcp47
	 */
	locale: Scalars['Locale']

	/**
	 * Ability to tag your publication
	 */
	tags?: string[]

	/**
	 * Ability to add a content warning
	 */
	contentWarning?: PublicationContentWarning

	/**
	 * Main content focus that for this publication
	 */
	mainContentFocus: PublicationMainFocus

	/**
	 * This is the URL that will appear below the asset's image on OpenSea and others etc
	 * and will allow users to leave OpenSea and view the item on the site.
	 */
	external_url?: Scalars['Url']

	/**
	 * Name of the item.
	 */
	name: string

	/**
     * These are the attributes for the item, which will show up on the OpenSea and others NFT trading websites on the
    item.
     */
	attributes: PublicationMetadataAttribute[]

	/**
	 * legacy to support OpenSea will store any NFT image here.
	 */
	image?: Scalars['Url']

	/**
	 * This is the mime type of image. This is used if you uploading more advanced cover images
	 * as sometimes IPFS does not emit the content header so this solves the pr
	 */
	imageMimeType?: ImageMimeTypes

	/**
	 * This is lens supported attached media items to the publication
	 */
	media?: PublicationMetadataMedia[]

	/**
     * In spec for OpenSea and other providers - also used when using EMBED main publication focus
     * A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV,
     * and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA.
     * Animation_url also supports HTML pages, allowing you to build rich experiences and interactive NFTs using JavaScript canvas,
     * WebGL, and more. Scripts and relative paths within the HTML page are now supported. However, access to browser extensions is not supported.

     */
	animation_url?: Scalars['Url']

	/**
	 * This is the appId the content belongs to
	 */
	appId?: Scalars['AppId']
}
