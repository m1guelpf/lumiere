import Link from 'next/link'
import useOnce from '@/hooks/useOnce'
import useLogin from '@/hooks/lens/useLogin'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { useProfile } from '@/context/ProfileContext'
import { FC, ReactNode, useCallback, useEffect } from 'react'
import { CubeTransparentIcon, RefreshIcon, UserAddIcon, UserCircleIcon } from '@heroicons/react/outline'
import { CHAIN } from '@/lib/consts'

const ConnectWallet: FC<{ children?: ({ logout: Function }) => ReactNode }> = ({ children }) => {
	const { login, logout } = useLogin()
	const [loginOnce, reset] = useOnce(login)
	const { chain } = useNetwork()
	const { isConnected } = useAccount()
	const { switchNetwork } = useSwitchNetwork({ chainId: CHAIN.id })
	const { profile, isAuthenticated } = useProfile()

	const handleLogout = async () => {
		await logout()
		reset()
	}

	useEffect(() => {
		if (!isConnected || chain?.unsupported) return

		loginOnce()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConnected, chain?.unsupported])

	const switchChain = useCallback(() => switchNetwork(), [switchNetwork])

	return (
		<ConnectKitButton.Custom>
			{({ isConnected, isConnecting, unsupported, show }) => {
				if (!isConnected) {
					return (
						<button
							onClick={show}
							className="flex items-center space-x-2 border border-red-500 text-red-500 rounded-lg px-3 py-1 text-sm"
						>
							<UserCircleIcon className="w-6 h-6" />
							<span className="uppercase">Sign in</span>
						</button>
					)
				}

				if (unsupported) {
					return (
						<button
							onClick={switchChain}
							className="flex items-center space-x-2 border border-red-500 text-red-500 rounded-lg px-3 py-1 text-sm"
						>
							<CubeTransparentIcon className="w-6 h-6" />
							<span className="uppercase">Wrong network</span>
						</button>
					)
				}

				if (isConnecting || !isAuthenticated) {
					return (
						<button className="flex items-center space-x-2 border border-red-500 text-red-500 rounded-lg px-3 py-1 text-sm">
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
			}}
		</ConnectKitButton.Custom>
	)
}

export default ConnectWallet
