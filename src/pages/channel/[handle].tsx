import { FC, useMemo } from 'react'
import Layout from '@/components/Layout'
import { nodeClient } from '@/lib/apollo'
import { useQuery } from '@apollo/client'
import Skeleton from 'react-loading-skeleton'
import VideoCard from '@/components/VideoCard'
import LensAvatar from '@/components/LensAvatar'
import LensBanner from '@/components/LensBanner'
import { Post, Profile, Query, SingleProfileQueryRequest } from '@/types/lens'
import FollowButton from '@/components/FollowButton'
import { GetStaticPaths, GetStaticProps } from 'next'
import { GlobeAltIcon } from '@heroicons/react/outline'
import { BadgeCheckIcon } from '@heroicons/react/solid'
import TwitterIcon from '@/components/Icons/TwitterIcon'
import GET_PROFILE from '@/graphql/profiles/get-profile'
import GET_USER_PUBLICATIONS from '@/graphql/publications/get-user-publications'

const ChannelPage: FC<{ profile: Profile }> = ({ profile }) => {
	const { data: videoData, loading: loadingVideos } = useQuery<{ videos: Query['publications'] }>(
		GET_USER_PUBLICATIONS,
		{
			variables: { profileId: profile?.id },
			skip: !profile?.id,
		}
	)

	const videos = useMemo<Post[]>(() => {
		if (loadingVideos || !profile) return [...new Array(12).keys()].map(() => null)

		return videoData?.videos?.items
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoData?.videos, loadingVideos])

	return (
		<Layout>
			<div className="relative">
				<LensBanner className="!h-24 md:!h-60 bg-cover !w-full" profile={profile} />
				<div className="absolute right-4 md:right-8 bottom-4 md:bottom-6 bg-black/20 rounded-lg px-2 py-1 flex items-center space-x-2 text-white/80">
					{(() => {
						const website = profile?.attributes?.find(attr => attr.key == 'website')
						if (!website) return

						return (
							<a
								href={website.value}
								target="_blank"
								rel="noreferrer"
								className="flex items-center space-x-2"
							>
								<GlobeAltIcon className="w-5 md:w-6 h-5 md:h-6 rounded-full" />
								<span className="sr-only">Website</span>
							</a>
						)
					})()}
					{(() => {
						const twitter = profile?.attributes?.find(attr => attr.key == 'twitter')
						if (!twitter) return

						return (
							<a
								href={`https://twitter.com/${twitter.value}`}
								target="_blank"
								rel="noreferrer"
								className="flex items-center space-x-2"
							>
								<TwitterIcon className="w-5 md:w-6 h-5 md:h-6 rounded-full" />
								<span className="sr-only">Twitter</span>
							</a>
						)
					})()}
				</div>
			</div>
			<div className="-mt-1 bg-gray-200">
				<div className="container mx-auto">
					<div className="flex flex-col md:flex-row justify-between items-center py-4 px-4 md:px-16 space-y-6 md:space-y-0">
						<div className="flex items-center space-x-6">
							<LensAvatar profile={profile} className="rounded-full" width={80} height={80} />
							<div className="space-y-1">
								<div className="flex items-baseline space-x-1">
									<p className="text-2xl">{profile?.name ?? profile?.handle ?? <Skeleton />}</p>
									<BadgeCheckIcon className="w-4 h-4 text-gray-600" />
								</div>
								<p className="text-xs md:text-sm max-w-prose text-gray-600">
									{profile ? profile.bio : <Skeleton count={2} width={230} />}
								</p>
							</div>
						</div>
						<div className="text-gray-600 flex flex-row-reverse md:flex-col justify-start w-full md:w-auto">
							<FollowButton profileId={profile?.id} />
							<p className="mt-2 font-hairline text-sm text-center md:text-right mr-2 md:mr-0">
								{profile ? `${profile?.stats?.totalFollowers} subscribers` : <Skeleton width={80} />}
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="container mx-auto flex pb-10">
				{videos?.length > 0 ? (
					<div className="mx-6 md:mx-16">
						<h3 className="py-6 text-base font-medium">Uploads</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
							{videos.map((video, i) => (
								<VideoCard key={video?.id ?? i} post={video} />
							))}
						</div>
					</div>
				) : (
					<p className="text-sm text-center mt-6 w-full">This channel doesn&apos;t have any content.</p>
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

export const getStaticProps: GetStaticProps = async ({ params: { handle } }) => {
	const {
		data: { profile },
	} = await nodeClient.query<{ profile: Query['profile'] }, SingleProfileQueryRequest>({
		query: GET_PROFILE,
		variables: { handle },
	})

	if (!profile) return { notFound: true }

	return {
		props: { profile },
	}
}

export default ChannelPage
