import '@/styles/app.css'
import client from '@/lib/apollo'
import * as Fathom from 'fathom-client'
import Layout from '@/components/Layout'
import { ApolloProvider } from '@apollo/client'
import { APP_NAME, IS_MAINNET } from '@/lib/consts'
import { SkeletonTheme } from 'react-loading-skeleton'
import { chain, createClient, WagmiConfig } from 'wagmi'
import { ProfileProvider } from '@/context/ProfileContext'
import { apiProvider, configureChains, getDefaultWallets, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const { chains, provider } = configureChains(
	[IS_MAINNET ? chain.polygon : chain.polygonMumbai],
	[apiProvider.infura(process.env.NEXT_PUBLIC_INFURA_ID), apiProvider.fallback()]
)

const { connectors } = getDefaultWallets({ appName: APP_NAME, chains })
const wagmiClient = createClient({ autoConnect: true, connectors, provider })

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
			<RainbowKitProvider chains={chains} theme={lightTheme({ accentColor: 'red' })}>
				<ApolloProvider client={client}>
					<SkeletonTheme baseColor="#00000010" highlightColor="#00000040" width={100}>
						<ProfileProvider>
							<Layout>
								<Component {...pageProps} />
							</Layout>
						</ProfileProvider>
					</SkeletonTheme>
				</ApolloProvider>
			</RainbowKitProvider>
		</WagmiConfig>
	)
}

export default App
