import Link from 'next/link'
import useOnce from '@/hooks/useOnce'
import useLogin from '@/hooks/lens/useLogin'
import { useAccount, useNetwork } from 'wagmi'
import { FC, ReactNode, useEffect } from 'react'
import { useProfile } from '@/context/ProfileContext'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CubeTransparentIcon, RefreshIcon, UserAddIcon, UserCircleIcon } from '@heroicons/react/outline'

const ConnectWallet: FC<{ children?: ({ logout: Function }) => ReactNode }> = ({ children }) => {
	const { login, logout } = useLogin()
	const [loginOnce, reset] = useOnce(login)
	const { activeChain } = useNetwork()
	const { data: account } = useAccount()
	const { profile, isAuthenticated } = useProfile()

	const handleLogout = async () => {
		await logout()
		reset()
	}

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

							if (!profile) {
								return (
									<Link
										href="https://testnet.lenster.xyz"
										target="_blank"
										onClick={() =>
											alert(
												"Haven't had time to add creating profiles yet, so go do it in Lenster and then come back :D"
											)
										}
										className="flex items-center space-x-2 border border-red-500 text-red-500 rounded-lg px-3 py-1 text-sm"
									>
										<UserAddIcon className="w-6 h-6" />
										<span className="uppercase">Create Profile</span>
									</Link>
								)
							}

							return children?.({ logout: handleLogout })
						})()}
					</div>
				)
			}}
		</ConnectButton.Custom>
	)
}

export default ConnectWallet
