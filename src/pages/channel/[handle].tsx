import { FC, useMemo } from 'react'
import { GetStaticProps } from 'next'
import Layout from '@/components/Layout'
import { nodeClient } from '@/lib/apollo'
import VideoCard from '@/components/VideoCard'
import LensAvatar from '@/components/LensAvatar'
import LensBanner from '@/components/LensBanner'
import { Post, Profile, Query } from '@/types/lens'
import FollowButton from '@/components/FollowButton'
import { GlobeAltIcon } from '@heroicons/react/outline'
import { BadgeCheckIcon } from '@heroicons/react/solid'
import GET_PROFILE from '@/graphql/profiles/get-profile'

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
				<LensBanner className="!h-60 bg-cover !w-full" profile={profile} />
				<div className="absolute right-8 bottom-6 bg-black/20 rounded-lg px-2 py-1 flex items-center space-x-2 text-white/80">
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
								<GlobeAltIcon className="w-6 h-6 rounded-full" />
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
								<TwitterIcon className="w-6 h-6 rounded-full" />
								<span className="sr-only">Twitter</span>
							</a>
						)
					})()}
				</div>
			</div>
			<div className="-mt-1 bg-gray-200">
				<div className="container mx-auto">
					<div className="flex justify-between items-center py-4 px-16">
						<div className="flex items-center space-x-6">
							<LensAvatar profile={profile} className="rounded-full" width={80} height={80} />
							<div className="space-y-1">
								<div className="flex items-baseline space-x-1">
									<p className="text-2xl">{profile?.name ?? <Skeleton />}</p>
									<BadgeCheckIcon className="w-4 h-4 text-gray-600" />
								</div>
								<p className="text-sm max-w-prose text-gray-600">
									{profile?.bio ?? <Skeleton count={2} width={300} />}
								</p>
							</div>
						</div>
						<div className="text-gray-600">
							<FollowButton profileId={profile?.id} />
							<p className="mt-2 font-hairline text-sm text-right">
								{profile ? `${profile?.stats?.totalFollowers} subscribers` : <Skeleton />}
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="container mx-auto flex">
				{videos?.length > 0 ? (
					<div className="mx-16">
						<h3 className="py-6 text-base font-medium">Uploads</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
							{videos.map((video, i) => (
								<VideoCard key={video?.id ?? i} post={video} />
							))}
						</div>
					</div>
				) : (
					<p className="text-sm text-center mt-6 w-full">This channel doesn&apos;t have any content</p>
				)}
			</div>
		</Layout>
	)
}

// You should use getStaticPaths if you’re statically pre-rendering pages that use dynamic routes
import { GetStaticPaths } from 'next'
import Skeleton from 'react-loading-skeleton'
import { useQuery } from '@apollo/client'
import GET_USER_PUBLICATIONS from '@/graphql/publications/get-user-publications'
import TwitterIcon from '@/components/Icons/TwitterIcon'

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: true,
	}
}

export const getStaticProps: GetStaticProps = async ({ params: { handle } }) => {
	const {
		data: {
			profiles: { items: profiles },
		},
	} = await nodeClient.query<{ profiles: Query['profiles'] }>({ query: GET_PROFILE, variables: { handle } })

	if (profiles.length == 0) return { notFound: true }

	return {
		props: { profile: profiles[0] },
	}
}

export default ChannelPage
