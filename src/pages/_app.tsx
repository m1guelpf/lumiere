import '@/styles/app.css'
import { useEffect } from 'react'
import client from '@/lib/apollo'
import { useRouter } from 'next/router'
import * as Fathom from 'fathom-client'
import Layout from '@/components/Layout'
import { APP_NAME, CHAIN } from '@/lib/consts'
import { ApolloProvider } from '@apollo/client'
import { createClient, WagmiConfig } from 'wagmi'
import { SkeletonTheme } from 'react-loading-skeleton'
import { ProfileProvider } from '@/context/ProfileContext'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'

const wagmiClient = createClient(
	getDefaultClient({
		chains: [CHAIN],
		autoConnect: true,
		appName: APP_NAME,
		infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
	})
)

const App = ({ Component, pageProps }) => {
	const router = useRouter()

	useEffect(() => {
		Fathom.load('CVRODMKX', {
			includedDomains: ['lumiere.withlens.app'],
			url: 'https://kangaroo-endorsed.withlens.app/script.js',
		})

		const onRouteChangeComplete = () => Fathom.trackPageview()

		router.events.on('routeChangeComplete', onRouteChangeComplete)

		return () => {
			router.events.off('routeChangeComplete', onRouteChangeComplete)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<WagmiConfig client={wagmiClient}>
			<ConnectKitProvider mode="light">
				<ApolloProvider client={client}>
					<SkeletonTheme baseColor="#00000010" highlightColor="#00000040" width={100}>
						<ProfileProvider>
							<Layout>
								<Component {...pageProps} />
							</Layout>
						</ProfileProvider>
					</SkeletonTheme>
				</ApolloProvider>
			</ConnectKitProvider>
		</WagmiConfig>
	)
}

export default App
