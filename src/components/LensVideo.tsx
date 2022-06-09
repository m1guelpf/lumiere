import { Maybe, Post } from '@/types/lens'
import { getImageUrl, getVideo } from '@/lib/media'
import { FC, useEffect, useRef, useState } from 'react'
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
	const posterImg = getImageUrl(video?.metadata?.media ?? [])

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
	const posterImg = getImageUrl(video?.metadata?.media ?? [])

	// (very) ugly hack to get the vime to the size we want on big screens
	useEffect(() => {
		requestAnimationFrame(() => {
			// if (!window.matchMedia('(min-width: 1024px)')) return

			const sheet = new CSSStyleSheet()
			sheet.insertRule('.player.video { width: 100%; height: 100%; padding-bottom: 0% !important; }')

			// @ts-ignore
			ref.current.shadowRoot.adoptedStyleSheets = [sheet]
		})
	}, [])

	return (
		<div className="relative w-full max-h-[calc(100vh_-_169px)] min-h-[400px] h-[56.25vw] flex bg-black">
			<Player ref={ref}>
				<Video crossOrigin="anonymous" poster={posterImg} autoPiP mediaTitle={video?.metadata?.name}>
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
