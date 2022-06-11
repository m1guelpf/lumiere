import Link from 'next/link'
import { FC, useMemo } from 'react'
import format from 'date-fns/format'
import { toast } from 'react-hot-toast'
import Layout from '@/components/Layout'
import { useQuery } from '@apollo/client'
import { nodeClient } from '@/lib/apollo'
import Spinner from '@/components/Spinner'
import Skeleton from 'react-loading-skeleton'
import NewComment from '@/components/NewComment'
import LensAvatar from '@/components/LensAvatar'
import { linkify, shareLink } from '@/lib/utils'
import FollowButton from '@/components/FollowButton'
import { formatDistanceToNowStrict } from 'date-fns'
import { GetStaticPaths, GetStaticProps } from 'next'
import { BadgeCheckIcon } from '@heroicons/react/solid'
import { LensVideoRenderer } from '@/components/LensVideo'
import GET_PUBLICATION from '@/graphql/publications/get-publication'
import LensVideoDescription from '@/components/LensVideoDescription'
import { Comment, Maybe, PaginatedPublicationResult, Post } from '@/types/lens'
import { SaveAsIcon, ShareIcon, SwitchHorizontalIcon } from '@heroicons/react/outline'
import GET_PUBLICATION_COMMENTS from '@/graphql/publications/get-publication-comments'

const VideoPage: FC<{ video: Maybe<Post> }> = ({ video }) => {
	const {
		data: commentData,
		loading: commentsLoading,
		refetch: refetchComments,
	} = useQuery<{ comments: PaginatedPublicationResult }>(GET_PUBLICATION_COMMENTS, {
		variables: { id: video?.id },
		skip: !video,
	})

	const comments = useMemo<Comment[] | null>(() => {
		return commentData?.comments?.items?.filter(comment => !comment.hidden) as Comment[] | null
	}, [commentData])

	return (
		<Layout>
			<div className="pb-10">
				<LensVideoRenderer video={video} />
				<div className="mb-6 pb-4 border-b mx-6">
					<div className="mt-5 pb-2 border-b">
						<div>
							<h2 className="font-medium text-lg break-words">
								{video?.metadata?.name ?? <Skeleton width={380} />}
							</h2>
							<div className="flex items-center justify-between text-gray-500">
								<p className="text-sm">
									{video ? format(new Date(video.createdAt as number), 'd LLL y') : <Skeleton />}
								</p>
								<div className="flex items-center space-x-6">
									<div className="flex items-center space-x-1">
										<button
											onClick={() => toast.error('Not implemented yet')}
											className="hover:bg-gray-100 rounded-full p-2"
										>
											<SwitchHorizontalIcon className="w-6 h-6" />
										</button>
										<span>
											{video?.stats?.totalAmountOfMirrors ?? <Skeleton width={15} inline />}
										</span>
									</div>
									<div className="flex items-center space-x-1">
										<button
											onClick={() => toast.error('Not implemented yet')}
											className="hover:bg-gray-100 rounded-full p-2"
										>
											<SaveAsIcon className="w-6 h-6" />
										</button>
										<span>
											{video?.stats?.totalAmountOfCollects ?? <Skeleton width={15} inline />}
										</span>
									</div>
									<div className="flex items-center space-x-1">
										<button
											onClick={() => shareLink(window.location.href)}
											className="hover:bg-gray-100 rounded-full p-2"
										>
											<ShareIcon className="w-6 h-6" />
										</button>
										<span>Share</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="flex items-start space-x-4 pt-4">
						<Link href={`/channel/${video?.profile?.handle}`}>
							<LensAvatar width={48} height={48} profile={video?.profile} />
						</Link>
						<div className="space-y-3 flex-1">
							<div className="flex items-center justify-between">
								<div>
									<Link
										href={`/channel/${video?.profile?.handle}`}
										className="flex items-center space-x-1"
									>
										<p className="font-medium">
											{video?.profile?.name ?? video?.profile?.handle ?? <Skeleton width={150} />}
										</p>
										<BadgeCheckIcon className="w-4 h-4 text-gray-600" />
									</Link>
									<p className="text-xs text-gray-500">
										{(video && `${video?.profile?.stats?.totalFollowers} subscribers`) ?? (
											<Skeleton width={80} />
										)}
									</p>
								</div>
								<div>
									<FollowButton profileId={video?.profile?.id} />
								</div>
							</div>
							<LensVideoDescription
								className="hidden md:block"
								description={video?.metadata?.description}
								loading={!video}
							/>
						</div>
					</div>
					<div className="md:hidden mt-4">
						<LensVideoDescription description={video?.metadata?.description} loading={!video} />
					</div>
				</div>
				{!video || commentsLoading ? (
					<div className="mt-6 flex items-center justify-center">
						<Spinner className="w-8 h-8" />
					</div>
				) : (
					<div className="mx-6">
						<div className="mt-6 mb-8">
							<div className="mb-6">
								{commentData?.comments && (
									<p>
										{commentData.comments.pageInfo.totalCount} Comment
										{commentData.comments.pageInfo.totalCount == 1 ? '' : 's'}
									</p>
								)}
							</div>
							<div>
								<NewComment videoId={video?.id} onChange={refetchComments} />
							</div>
						</div>
						<div className="space-y-6">
							{comments?.map(comment => (
								<div className="flex items-start space-x-4" key={comment.id}>
									<LensAvatar profile={comment.profile} width={40} height={40} />
									<div>
										<div className="flex items-center space-x-2">
											<Link
												href={`/channel/${comment.profile.handle}`}
												className="font-medium text-black text-sm flex items-center space-x-1"
											>
												<span>{comment.profile.name ?? comment.profile.handle}</span>
												<BadgeCheckIcon className="w-3 h-3 text-gray-600" />
											</Link>
											<p className="text-xs text-gray-500">
												{formatDistanceToNowStrict(new Date(comment.createdAt))} ago
											</p>
										</div>
										<div>
											<p
												className="text-sm"
												dangerouslySetInnerHTML={{ __html: linkify(comment.metadata.content) }}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</Layout>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: true,
	}
}

export const getStaticProps: GetStaticProps = async ({ params: { id } }) => {
	const {
		data: { video },
	} = await nodeClient.query<{ video: Maybe<Post> }>({ query: GET_PUBLICATION, variables: { id } })

	if (!video) return { notFound: true }

	return {
		props: { video },
	}
}

export default VideoPage
