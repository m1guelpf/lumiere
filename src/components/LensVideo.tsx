import { FC } from 'react'
import { Maybe, Post } from '@/types/lens'
import { getImageUrl, getVideo } from '@/lib/media'
import { DefaultUi, Video, Player, DefaultControls, DefaultSettings, Skeleton } from '@vime/react'

export const LensVideoFallback: FC<{ video: Maybe<Post> }> = ({ video }) => {
	const source = getVideo(video?.metadata?.media ?? [])
	const posterImg = getImageUrl(video?.metadata?.media ?? [])

	return (
		<div className="relative w-full max-h-[calc(100vh_-_169px)] min-h-[400px]  h-[56.25vw]">
			<video className="w-full h-full" poster={posterImg}>
				{source && <source src={source.url} type={source.mimeType} />}
			</video>
		</div>
	)
}

const LensVideo: FC<{ video: Maybe<Post> }> = ({ video }) => {
	const source = getVideo(video?.metadata?.media ?? [])
	const posterImg = getImageUrl(video?.metadata?.media ?? [])

	return (
		<div className="relative w-full max-h-[calc(100vh_-_169px)] min-h-[400px]  h-[56.25vw]">
			<Player>
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
