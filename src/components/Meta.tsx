import { FC } from 'react'
import Head from 'next/head'
// import cardImage from '@images/card.jpg'

const meta = {
	title: `Obscura: Web3 Video Platform`,
	description: `WIP`,
	image: ``, // @TODO: Design meta image
}
const Meta: FC<{ title?: string; description?: string; image?: string }> = ({
	title = meta.title,
	description = meta.description,
	image = meta.image,
}) => {
	return (
		<Head>
			<title>{title}</title>
			<meta name="title" content={title} />
			<meta name="description" content={description} />

			<meta property="og:type" content="website" />
			<meta property="og:url" content="https://obscura.withlens.app" />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={image} />

			<meta property="twitter:card" content="summary_large_image" />
			<meta property="twitter:url" content="https://obscura.withlens.app" />
			<meta property="twitter:title" content={title} />
			<meta property="twitter:description" content={description} />
			<meta property="twitter:image" content={image} />
		</Head>
	)
}

export default Meta
