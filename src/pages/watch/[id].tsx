import { FC, Suspense } from 'react'
import { nodeClient } from '@/lib/apollo'
import { Maybe, Post } from '@/types/lens'
import { GetStaticPaths, GetStaticProps } from 'next'
import GET_PUBLICATION from '@/graphql/publications/get-publication'
import Layout from '@/components/Layout'
import Skeleton from 'react-loading-skeleton'
import { LensVideoFallback } from '@/components/LensVideo'
import { SaveAsIcon, ShareIcon, SwitchHorizontalIcon } from '@heroicons/react/outline'
import dynamic from 'next/dynamic'
import format from 'date-fns/format'
import LensAvatar from '@/components/LensAvatar'
import { BadgeCheckIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import FollowButton from '@/components/FollowButton'
import { toast } from 'react-hot-toast'
const LensVideo = dynamic(() => import('@/components/LensVideo'), { ssr: false })

const VideoPage: FC<{ video: Maybe<Post> }> = ({ video }) => {
	return (
		<Layout>
			<div className="pb-10">
				<Suspense fallback={<LensVideoFallback video={video} />}>
					<LensVideo video={video} />
				</Suspense>
				<div className="mx-6 mt-5 pb-2 border-b">
					<div>
						<h2 className="font-medium text-lg break-words">
							{video?.metadata?.name ?? <Skeleton width={500} />}
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
									<span>{video?.stats?.totalAmountOfMirrors ?? <Skeleton width={15} inline />}</span>
								</div>
								<div className="flex items-center space-x-1">
									<button
										onClick={() => toast.error('Not implemented yet')}
										className="hover:bg-gray-100 rounded-full p-2"
									>
										<SaveAsIcon className="w-6 h-6" />
									</button>
									<span>{video?.stats?.totalAmountOfCollects ?? <Skeleton width={15} inline />}</span>
								</div>
								<div className="flex items-center space-x-1">
									<button
										onClick={() => toast.error('Not implemented yet')}
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
				<div className="flex items-start space-x-4 mx-6 pt-4">
					<Link href={`/channel/${video?.profile?.handle}`}>
						<a>
							<LensAvatar width={48} height={48} profile={video?.profile} />
						</a>
					</Link>
					<div className="space-y-3 flex-1">
						<div className="flex items-center justify-between">
							<div>
								<Link href={`/channel/${video?.profile?.handle}`}>
									<a className="flex items-center space-x-1">
										<p className="font-medium">
											{video?.profile?.name ?? video?.profile?.handle ?? <Skeleton width={200} />}
										</p>
										<BadgeCheckIcon className="w-4 h-4 text-gray-600" />
									</a>
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
						<div className="">{video?.metadata?.content ?? <Skeleton count={3} width={500} />}</div>
					</div>
				</div>
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
