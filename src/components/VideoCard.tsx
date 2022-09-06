import Link from 'next/link'
import Image from 'next/image'
import { FC, useMemo } from 'react'
import { Post } from '@/types/lens'
import LensAvatar from './LensAvatar'
import VerifiedIcon from './VerifiedIcon'
import Skeleton from 'react-loading-skeleton'
import WorldIdBadge from './Icons/WorldIdBadge'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import { getImageUrl, getPostCover, includesImage, normalizeUrl } from '@/lib/media'

const VideoCard: FC<{ post?: Post; expanded?: boolean }> = ({ post, expanded = false }) => {
	const coverImg = useMemo(() => {
		if (!post) return

		return getPostCover(post) ?? `https://avatar.tobi.sh/${post.id}.png`
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
									<div className="flex items-center">
										<VerifiedIcon profileId={post?.profile?.id} className="w-3 h-3 text-gray-600" />
										{post?.profile?.onChainIdentity?.worldcoin?.isHuman && (
											<WorldIdBadge width={12} height={12} />
										)}
									</div>
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
