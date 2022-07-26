import { Chain } from 'wagmi'
import { zerion } from './zerion'
import { connectorsForWallets, WalletList, wallet } from '@rainbow-me/rainbowkit'

export const getDefaultWallets = ({
	appName,
	chains,
}: {
	appName: string
	chains: Chain[]
}): {
	connectors: ReturnType<typeof connectorsForWallets>
	wallets: WalletList
} => {
	const needsInjectedWalletFallback =
		typeof window !== 'undefined' &&
		window.ethereum &&
		!window.ethereum.isMetaMask &&
		!window.ethereum.isCoinbaseWallet &&
		!window.ethereum.isBraveWallet

	const wallets: WalletList = [
		{
			groupName: 'Popular',
			wallets: [
				zerion({ chains }),
				wallet.coinbase({ appName, chains }),
				wallet.metaMask({ chains, shimDisconnect: true }),
				wallet.walletConnect({ chains }),
				...(needsInjectedWalletFallback ? [wallet.injected({ chains, shimDisconnect: true })] : []),
				wallet.rainbow({ chains }),
			],
		},
	]

	return {
		connectors: connectorsForWallets(wallets),
		wallets,
	}
}
