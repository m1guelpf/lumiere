import { FC } from 'react'
import { Post } from '@/types/lens'
import Skeleton from 'react-loading-skeleton'
import { format as timeago } from 'timeago.js'

const VideoCard: FC<{ post?: Post }> = ({ post }) => {
	return (
		<div className="flex-1 space-y-2">
			{post ? (
				<img
					className="h-44 w-80 bg-cover rounded-lg"
					src={post?.metadata?.cover?.original?.url ?? `https://avatar.tobi.sh/${post?.id ?? 'default'}.png`}
					alt=""
				/>
			) : (
				<Skeleton className="!h-44 !w-80" />
			)}
			<div className="space-y-2">
				<h4 className="text-sm font-medium">{post?.metadata?.name ?? <Skeleton width={250} />}</h4>
				<div>
					<p className="font-hairline text-xs text-gray-800">
						{post ? `${post?.stats?.totalAmountOfCollects} collects` : <Skeleton width={70} inline />} ·{' '}
						{post ? timeago(post.createdAt) : <Skeleton width={70} inline />}
					</p>
				</div>
			</div>
		</div>
	)
}
export default VideoCard
