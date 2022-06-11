import { useMemo } from 'react'
import Layout from '@/components/Layout'
import { useQuery } from '@apollo/client'
import VideoCard from '@/components/VideoCard'
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
		<Layout>
			<div className="my-6 mx-6 grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
				{videos.map((post, i) => (
					<VideoCard key={post?.id ?? i} post={post} expanded />
				))}
			</div>
		</Layout>
	)
}

export default HomePage
