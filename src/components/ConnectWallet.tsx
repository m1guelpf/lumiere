import Link from 'next/link'
import LensAvatar from './LensAvatar'
import { FC, useEffect } from 'react'
import useLogin from '@/hooks/lens/useLogin'
import { useAccount, useNetwork } from 'wagmi'
import { useProfile } from '@/context/ProfileContext'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CubeTransparentIcon, RefreshIcon, UserCircleIcon } from '@heroicons/react/outline'

const ConnectWallet: FC = () => {
	const { login } = useLogin()
	const { activeChain } = useNetwork()
	const { profile, isAuthenticated } = useProfile()
	const { data: account } = useAccount()

	useEffect(() => {
		if (!account || activeChain?.unsupported) return

		login()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account, activeChain])

	return (
		<ConnectButton.Custom>
			{({ account, chain, openChainModal, openConnectModal, mounted }) => {
				return (
					<div className={mounted ? '' : 'opacity-0 pointer-events-none select-none'} aria-hidden={!mounted}>
						{(() => {
							if (!mounted || !account || !chain) {
								return (
									<button
										onClick={openConnectModal}
										className="flex items-center space-x-2 border border-red-500 text-red-500 rounded-lg px-3 py-1 text-sm"
									>
										<UserCircleIcon className="w-6 h-6" />
										<span className="uppercase">Sign in</span>
									</button>
								)
							}

							if (chain.unsupported) {
								return (
									<button
										onClick={openChainModal}
										className="flex items-center space-x-2 border border-red-500 text-red-500 rounded-lg px-3 py-1 text-sm"
									>
										<CubeTransparentIcon className="w-6 h-6" />
										<span className="uppercase">Wrong network</span>
									</button>
								)
							}

							if (!isAuthenticated) {
								return (
									<button
										onClick={openChainModal}
										className="flex items-center space-x-2 border border-red-500 text-red-500 rounded-lg px-3 py-1 text-sm"
									>
										<span className="uppercase">Logging in...</span>
										<RefreshIcon className="w-6 h-6 animate-spin" />
									</button>
								)
							}

							return (
								<Link href={`/channel/${profile?.handle}`}>
									<a className="flex items-center justify-center">
										<LensAvatar profile={profile} width={32} height={32} />
									</a>
								</Link>
							)
						})()}
					</div>
				)
			}}
		</ConnectButton.Custom>
	)
}

export default ConnectWallet
