import Link from 'next/link'
import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import VideoCard from '@/components/VideoCard'
import { VideoCameraIcon } from '@heroicons/react/outline'
import { ExplorePublicationResult, Post } from '@/types/lens'
import EXPLORE_PUBLICATIONS from '@/graphql/explore/explore-publications'

const HomePage = () => {
	const { data, loading } = useQuery<{ explorePublications: ExplorePublicationResult }>(EXPLORE_PUBLICATIONS)

	const videos = useMemo<Post[]>(() => {
		if (loading) return [...new Array(16).keys()].map(() => null)

		return data?.explorePublications?.items?.filter(post => !post.hidden)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.explorePublications, loading])

	return (
		<div
			className={`my-6 mx-6 ${
				videos?.length == 0 ? 'flex-1 flex' : 'grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
			}`}
		>
			{videos.map((post, i) => (
				<VideoCard key={post?.id ?? i} post={post} expanded />
			))}
			{videos?.length == 0 && (
				<div className="flex-1 flex flex-col items-center justify-center space-y-6">
					<div className="space-y-2">
						<VideoCameraIcon className="mx-auto h-24 w-24 text-gray-400" />
						<p className="block font-medium text-4xl text-gray-900">No videos yet!</p>
					</div>
					<Link className="border border-red-500 text-red-500 rounded-lg px-3 py-1" href="/upload">
						Create something awesome
					</Link>
				</div>
			)}
		</div>
	)
}

export default HomePage
