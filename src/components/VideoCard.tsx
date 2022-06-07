import { FC, useMemo } from 'react'
import { Post } from '@/types/lens'
import Skeleton from 'react-loading-skeleton'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import { getImageUrl, includesImage } from '@/lib/media'
import Link from 'next/link'

const VideoCard: FC<{ post?: Post }> = ({ post }) => {
	const coverImg = useMemo(() => {
		if (!post) return
		if (post.metadata.cover) return post.metadata.cover.original.url
		if (includesImage(post.metadata.media)) return getImageUrl(post.metadata.media)

		return `https://avatar.tobi.sh/${post.id}.png`
	}, [post])
	return (
		<Link href={`/watch/${post?.id}`}>
			<a className="flex-1 space-y-2">
				{coverImg ? (
					<img className="h-44 w-80 bg-cover rounded-lg" src={coverImg} alt="" />
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
