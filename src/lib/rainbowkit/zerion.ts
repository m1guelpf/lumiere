import { Chain } from 'wagmi'
import { Wallet } from '@rainbow-me/rainbowkit'
import { getWalletConnectConnector } from './getWalletConnectConnector'

export interface RainbowOptions {
	chains: Chain[]
}

function isAndroid(): boolean {
	return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
}

export const zerion = ({ chains }: RainbowOptions): Wallet => ({
	id: 'zerion',
	name: 'Zerion',
	iconUrl: 'https://registry.walletconnect.com/api/v2/logo/lg/f216b371-96cf-409a-9d88-296392b85800',
	iconBackground: '#355CE0',
	downloadUrls: {
		android: 'https://play.google.com/store/apps/details?id=io.zerion.android',
		ios: 'https://apps.apple.com/app/id1456732565',
		qrCode: 'https://link.zerion.io/c11o6IN0jqb',
	},
	createConnector: () => {
		const connector = getWalletConnectConnector({ chains })

		return {
			connector,
			mobile: {
				getUri: async () => {
					const { uri } = (await connector.getProvider()).connector

					return isAndroid() ? uri : `https://app.zerion.io/wc?uri=${encodeURIComponent(uri)}`
				},
			},
			qrCode: {
				getUri: async () => (await connector.getProvider()).connector.uri,
				instructions: {
					learnMoreUrl: 'https://help.zerion.io/en/articles/6271651-connecting-to-dapps',
					steps: [
						{
							description:
								'We recommend putting Zerion on your home screen for faster access to your wallet.',
							step: 'install',
							title: 'Open the Zerion app',
						},
						{
							description: 'You can easily backup your wallet using our backup feature on your phone.',
							step: 'create',
							title: 'Create or Import a Wallet',
						},
						{
							description:
								'After you scan, a connection prompt will appear for you to connect your wallet.',
							step: 'scan',
							title: 'Tap the scan button',
						},
					],
				},
			},
		}
	},
})
