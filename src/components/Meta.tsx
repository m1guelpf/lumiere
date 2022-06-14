import { FC } from 'react'
import Head from 'next/head'
import cardImage from '@images/card.jpg'

const meta = {
	title: `Lumiere: Own Your Content.`,
	description: `A web3 video platform to own, distribute and monetize your content. Powered by the Lens Protocol.`,
	image: `${process.env.NEXT_PUBLIC_URL}${cardImage.src}`,
}
const Meta: FC<{ title?: string; description?: string; image?: string }> = ({ title, description, image }) => {
	return (
		<Head>
			<title>{title ?? meta.title}</title>
			<meta name="title" key="title" content={title ?? meta.title} />
			<meta name="description" key="description" content={description ?? meta.description} />

			<meta property="og:type" key="og-type" content="website" />
			<meta property="og:url" key="og-url" content={process.env.NEXT_PUBLIC_URL} />
			<meta property="og:title" key="og-title" content={title ?? meta.title} />
			<meta property="og:description" key="og-description" content={description ?? meta.description} />
			<meta property="og:image" key="og-image" content={image ?? meta.image} />

			<meta property="twitter:card" key="twitter-card" content="summary_large_image" />
			<meta property="twitter:url" key="twitter-url" content={process.env.NEXT_PUBLIC_URL} />
			<meta property="twitter:title" key="twitter-title" content={title ?? meta.title} />
			<meta property="twitter:description" key="twitter-description" content={description ?? meta.description} />
			<meta property="twitter:image" key="twitter-image" content={image ?? meta.image} />
		</Head>
	)
}

export default Meta
