import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/types/lens'
import { FC, useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { getImageUrl, includesImage, normalizeUrl } from '@/lib/media'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'

const VideoCard: FC<{ post?: Post }> = ({ post }) => {
	const coverImg = useMemo(() => {
		if (!post) return
		if (includesImage(post.metadata.media)) return getImageUrl(post.metadata.media)
		if (post.metadata.cover) {
			return normalizeUrl(post.metadata.cover.original.url, post.metadata.cover.original.mimeType)
		}

		return `https://avatar.tobi.sh/${post.id}.png`
	}, [post])

	return (
		<Link href={`/watch/${post?.id}`}>
			<a className="flex-1 space-y-2">
				{coverImg ? (
					<Image height={176} width={320} objectFit="cover" className="rounded-lg" src={coverImg} alt="" />
				) : (
					<Skeleton className="!h-44 !w-80" />
				)}
				<div className="space-y-2">
					<h4 className="text-sm font-medium">{post?.metadata?.name ?? <Skeleton width={250} />}</h4>
					<div>
						<p className="font-hairline text-xs text-gray-800">
							{post ? `${post?.stats?.totalAmountOfCollects} collects` : <Skeleton width={70} inline />} ·{' '}
							{post ? (
								`${formatDistanceToNowStrict(new Date(post.createdAt))} ago`
							) : (
								<Skeleton width={70} inline />
							)}
						</p>
					</div>
				</div>
			</a>
		</Link>
	)
}
export default VideoCard
