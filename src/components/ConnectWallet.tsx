import Link from 'next/link'
import useOnce from '@/hooks/useOnce'
import LensAvatar from './LensAvatar'
import { FC, ReactNode, useEffect } from 'react'
import useLogin from '@/hooks/lens/useLogin'
import { useAccount, useNetwork } from 'wagmi'
import { useProfile } from '@/context/ProfileContext'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CubeTransparentIcon, RefreshIcon, UserCircleIcon } from '@heroicons/react/outline'

const ConnectWallet: FC<{ children?: ReactNode }> = ({ children }) => {
	const { login } = useLogin()
	const loginOnce = useOnce(login)
	const { activeChain } = useNetwork()
	const { data: account } = useAccount()
	const { isAuthenticated } = useProfile()

	useEffect(() => {
		if (!account?.address || activeChain?.unsupported) return

		loginOnce()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account?.address, activeChain?.unsupported])

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

							return children
						})()}
					</div>
				)
			}}
		</ConnectButton.Custom>
	)
}

export default ConnectWallet
