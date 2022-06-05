import { useAccount } from 'wagmi'
import LensAvatar from './LensAvatar'
import { FC, useEffect } from 'react'
import useLogin from '@/hooks/lens/useLogin'
import { useProfile } from '@/context/ProfileContext'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CubeTransparentIcon, RefreshIcon, UserCircleIcon } from '@heroicons/react/outline'

const ConnectWallet: FC = () => {
	const { login } = useLogin()
	const { profile, isAuthenticated } = useProfile()
	const { data: account } = useAccount()

	useEffect(() => {
		if (!account) return

		login()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account])

	return (
		<ConnectButton.Custom>
			{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
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
								<button className="flex items-center justify-center">
									<LensAvatar profile={profile} width={32} height={32} />
								</button>
							)

							return (
								<div style={{ display: 'flex', gap: 12 }}>
									<button
										onClick={openChainModal}
										style={{ display: 'flex', alignItems: 'center' }}
										type="button"
									>
										{chain.hasIcon && (
											<div
												style={{
													background: chain.iconBackground,
													width: 12,
													height: 12,
													borderRadius: 999,
													overflow: 'hidden',
													marginRight: 4,
												}}
											>
												{chain.iconUrl && (
													<img
														alt={chain.name ?? 'Chain icon'}
														src={chain.iconUrl}
														style={{ width: 12, height: 12 }}
													/>
												)}
											</div>
										)}
										{chain.name}
									</button>

									<button onClick={openAccountModal} type="button">
										{account.displayName}
										{account.displayBalance ? ` (${account.displayBalance})` : ''}
									</button>
								</div>
							)
						})()}
					</div>
				)
			}}
		</ConnectButton.Custom>
	)
}

export default ConnectWallet
