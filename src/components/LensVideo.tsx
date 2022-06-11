import { Maybe, Post } from '@/types/lens'
import { FC, useEffect, useRef, useState } from 'react'
import { getImageUrl, getVideo, normalizeUrl } from '@/lib/media'
import { DefaultUi, Video, Player, DefaultControls, DefaultSettings, Skeleton } from '@vime/react'

export const LensVideoRenderer: FC<{ video: Maybe<Post> }> = ({ video }) => {
	const [hydrated, setHydrated] = useState<boolean>(false)

	useEffect(() => {
		setHydrated(true)
	}, [])

	if (!hydrated) return <LensVideoFallback video={video} />

	return <LensVideo video={video} />
}

export const LensVideoFallback: FC<{ video: Maybe<Post> }> = ({ video }) => {
	const source = getVideo(video?.metadata?.media ?? [])
	const posterImg = video?.metadata?.cover
		? normalizeUrl(video.metadata.cover?.original?.url, video.metadata.cover?.original?.mimeType)
		: getImageUrl(video?.metadata?.media ?? [])

	return (
		<div className="relative w-full max-h-[calc(100vh_-_169px)] min-h-[400px] h-[56.25vw] bg-black">
			<video className="w-full h-full" poster={posterImg}>
				{source && <source src={source.url} type={source.mimeType} />}
			</video>
		</div>
	)
}

const LensVideo: FC<{ video: Maybe<Post> }> = ({ video }) => {
	const ref = useRef<HTMLVmPlayerElement>()
	const source = getVideo(video?.metadata?.media ?? [])
	const posterImg = video?.metadata?.cover
		? normalizeUrl(video.metadata.cover?.original?.url, video.metadata.cover?.original?.mimeType)
		: getImageUrl(video?.metadata?.media ?? [])

	// ugly hack to get vime to the size we want on big screens
	useEffect(() => {
		requestAnimationFrame(() => {
			const el = ref.current.shadowRoot.querySelector('.player.video') as HTMLDivElement

			el.style.width = '100%'
			el.style.height = '100%'
			el.style.paddingBottom = '0%'
		})
	}, [])

	return (
		<div className="relative w-full max-h-[calc(100vh_-_169px)] min-h-[400px] h-[56.25vw] flex bg-black">
			<Player ref={ref}>
				<Video
					crossOrigin="anonymous"
					preload="metadata"
					poster={posterImg}
					autoPiP
					mediaTitle={video?.metadata?.name}
				>
					{source && <source data-src={source.url} type={source.mimeType} />}
				</Video>
				<DefaultUi noControls>
					<Skeleton />
					<DefaultControls hideOnMouseLeave activeDuration={2000} />
					<DefaultSettings />
				</DefaultUi>
			</Player>
		</div>
	)
}

export default LensVideo
