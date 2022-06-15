import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/types/lens'
import { FC, useMemo } from 'react'
import LensAvatar from './LensAvatar'
import Skeleton from 'react-loading-skeleton'
import { BadgeCheckIcon } from '@heroicons/react/solid'
import { getImageUrl, includesImage, normalizeUrl } from '@/lib/media'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'

const VideoCard: FC<{ post?: Post; expanded?: boolean }> = ({ post, expanded = false }) => {
	const coverImg = useMemo(() => {
		if (!post) return
		if (includesImage(post.metadata.media)) return getImageUrl(post.metadata.media)
		if (post.metadata.cover) {
			return normalizeUrl(post.metadata.cover.original.url)
		}

		return `https://avatar.tobi.sh/${post.id}.png`
	}, [post])

	return (
		<div className="flex-1 space-y-2">
			<Link href={`/watch/${post?.id}`}>
				{coverImg ? (
					<Image height={176} width={320} objectFit="cover" className="rounded-lg" src={coverImg} alt="" />
				) : (
					<Skeleton className="!h-44 !w-80" />
				)}
			</Link>
			<div className="space-y-2">
				<div className="flex items-start md:space-x-3">
					<Link href={`/channel/${post?.profile?.handle}`} className="hidden md:block">
						{expanded && <LensAvatar width={36} height={36} profile={post?.profile} />}
					</Link>
					<div>
						<Link href={`/watch/${post?.id}`} className="text-sm font-medium">
							{post?.metadata?.name ?? <Skeleton width={250} />}
						</Link>
						<div>
							{expanded && (
								<Link
									className="text-xs text-gray-800 flex items-center space-x-1"
									href={`/channel/${post?.profile?.handle}`}
								>
									<span>{post?.profile?.handle ?? <Skeleton />}</span>
									<BadgeCheckIcon className="w-3 h-3 text-gray-600" />
								</Link>
							)}
							<p className="font-hairline text-xs text-gray-800">
								{post ? (
									`${post?.stats?.totalAmountOfCollects} collects`
								) : (
									<Skeleton width={70} inline />
								)}{' '}
								·{' '}
								<Link href={`/watch/${post?.id}`}>
									{post ? (
										`${formatDistanceToNowStrict(new Date(post.createdAt))} ago`
									) : (
										<Skeleton width={70} inline />
									)}
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
export default VideoCard
