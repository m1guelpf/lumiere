import Link from 'next/link'
import Meta from '@/components/Meta'
import format from 'date-fns/format'
import { APP_NAME } from '@/lib/consts'
import { useQuery } from '@apollo/client'
import { nodeClient } from '@/lib/apollo'
import Spinner from '@/components/Spinner'
import { FC, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import NewComment from '@/components/NewComment'
import LensAvatar from '@/components/LensAvatar'
import { linkify, shareLink } from '@/lib/utils'
import ReportModal from '@/components/ReportModal'
import FollowButton from '@/components/FollowButton'
import { formatDistanceToNowStrict } from 'date-fns'
import VerifiedIcon from '@/components/VerifiedIcon'
import { GetStaticPaths, GetStaticProps } from 'next'
import StateAwareIcon from '@/components/StateAwareIcon'
import { LensVideoRenderer } from '@/components/LensVideo'
import { FlagIcon, ShareIcon } from '@heroicons/react/outline'
import GET_PUBLICATION from '@/graphql/publications/get-publication'
import useMirrorPublication from '@/hooks/lens/useMirrorPublication'
import LensVideoDescription from '@/components/LensVideoDescription'
import useCollectPublication from '@/hooks/lens/useCollectPublication'
import useReactToPublication from '@/hooks/lens/useReactToPublication'
import GET_PUBLICATION_COMMENTS from '@/graphql/publications/get-publication-comments'
import { Comment, Maybe, PaginatedPublicationResult, Post, ReactionTypes } from '@/types/lens'

const VideoPage: FC<{ video: Maybe<Post> }> = ({ video }) => {
	const [reportOpen, setReportOpen] = useState<boolean>(false)
	const { data: hasMirrored, mirrorPublication, loading: mirrorLoading } = useMirrorPublication(video?.id)
	const { data: hasCollected, collectPublication, loading: collectLoading } = useCollectPublication(video?.id)
	const {
		removeReaction,
		data: reactionData,
		upvotePublication,
		downvotePublication,
		loading: reactionLoading,
	} = useReactToPublication(video?.id)

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
		<>
			<Meta
				title={video && `${video.metadata.name} | ${APP_NAME}`}
				description={video && video.metadata.description}
			/>
			<ReportModal open={reportOpen} onClose={() => setReportOpen(false)} videoId={video?.id} />
			<div className="pb-10">
				<LensVideoRenderer video={video} />
				<div className="mb-6 pb-4 border-b mx-6">
					<div className="mt-5 pb-2 border-b">
						<div>
							<h2 className="font-medium text-lg break-words">
								{video?.metadata?.name ?? <Skeleton width={380} />}
							</h2>
							<div className="flex flex-col md:flex-row items-start md:items-center md:justify-between space-y-2 md:space-y-0 text-gray-500">
								<p className="text-sm whitespace-nowrap">
									{video ? format(new Date(video.createdAt as number), 'd LLL y') : <Skeleton />}
								</p>
								<div className="flex items-center md:space-x-6 justify-between md:justify-start w-full md:w-auto">
									<div className="flex items-center md:space-x-1">
										<button
											onClick={
												reactionData.userReaction == ReactionTypes.Upvote
													? () => removeReaction(video?.id, ReactionTypes.Upvote)
													: () => upvotePublication(video?.id)
											}
											className="hover:bg-gray-100 rounded-full p-2"
										>
											<StateAwareIcon
												iconName="ThumbUp"
												loading={reactionLoading}
												active={reactionData.userReaction == ReactionTypes.Upvote}
												className="w-5 md:w-6 h-5 md:h-6"
											/>
										</button>
										<span>
											{video ? (
												(reactionData.totalUpvotes ?? video.stats.totalUpvotes) -
												(reactionData.totalDownvotes ?? video.stats.totalDownvotes)
											) : (
												<Skeleton width={15} inline />
											)}
										</span>
										<button
											onClick={
												reactionData.userReaction == ReactionTypes.Downvote
													? () => removeReaction(video?.id, ReactionTypes.Downvote)
													: () => downvotePublication(video?.id)
											}
											className="hover:bg-gray-100 rounded-full p-2"
										>
											<StateAwareIcon
												iconName="ThumbDown"
												loading={reactionLoading}
												active={reactionData.userReaction == ReactionTypes.Downvote}
												className="w-5 md:w-6 h-5 md:h-6"
											/>
										</button>
									</div>
									<div className="flex items-center space-x-1">
										<button
											onClick={() =>
												mirrorPublication(video?.id, {
													followerOnlyReferenceModule:
														video?.referenceModule?.__typename ==
														'FollowOnlyReferenceModuleSettings',
												})
											}
											disabled={hasMirrored}
											className="hover:bg-gray-100 disabled:hover:bg-transparent rounded-full p-2"
										>
											<StateAwareIcon
												iconName="SwitchHorizontal"
												loading={mirrorLoading}
												active={hasMirrored}
												className="w-5 md:w-6 h-5 md:h-6"
											/>
										</button>
										<span>
											{video?.stats?.totalAmountOfMirrors ?? <Skeleton width={15} inline />}
										</span>
									</div>
									<div className="flex items-center space-x-1">
										<button
											disabled={hasCollected}
											onClick={() => collectPublication(video?.id)}
											className="hover:bg-gray-100 disabled:hover:bg-transparent rounded-full p-2"
										>
											<StateAwareIcon
												iconName="SaveAs"
												loading={collectLoading}
												active={hasCollected}
												className="w-5 md:w-6 h-5 md:h-6"
											/>
										</button>
										<span>
											{video?.stats?.totalAmountOfCollects ?? <Skeleton width={15} inline />}
										</span>
									</div>
									<div className="flex items-center md:space-x-6">
										<div className="flex items-center space-x-1">
											<button
												onClick={() => shareLink(window.location.href)}
												className="hover:bg-gray-100 rounded-full p-2"
											>
												<ShareIcon className="w-5 md:w-6 h-5 md:h-6" />
											</button>
											<span className="hidden md:inline">Share</span>
										</div>
										<div className="flex items-center space-x-1">
											<button
												onClick={() => setReportOpen(true)}
												className="hover:bg-gray-100 rounded-full p-2"
											>
												<FlagIcon className="w-5 md:w-6 h-5 md:h-6" />
											</button>
											<span className="hidden md:inline">Report</span>
										</div>
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
										<VerifiedIcon
											profileId={video?.profile?.id}
											className="w-4 h-4 text-gray-600"
										/>
									</Link>
									<p className="text-xs text-gray-500">
										{(video && `${video?.profile?.stats?.totalFollowers} subscribers`) ?? (
											<Skeleton width={80} />
										)}
									</p>
								</div>
								<div>
									<FollowButton profile={video?.profile} />
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
								<NewComment videoId={video?.id} onIndex={refetchComments} />
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
												<VerifiedIcon
													profileId={comment?.profile?.id}
													className="w-3 h-3 text-gray-600"
												/>
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
		</>
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
