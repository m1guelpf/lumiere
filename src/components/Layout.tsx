import Meta from './Meta'
import Link from 'next/link'
import toast from 'react-hot-toast'
import SearchBar from './SearchBar'
import { FC, ReactNode } from 'react'
import { APP_NAME } from '@/lib/consts'
import { Toaster } from 'react-hot-toast'
import ConnectWallet from './ConnectWallet'
import { BellIcon, UploadIcon } from '@heroicons/react/outline'
import { VideoCameraIcon } from '@heroicons/react/solid'
import { useProfile } from '@/context/ProfileContext'

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
	const { isAuthenticated } = useProfile()
	return (
		<div className="min-h-screen flex flex-col overflow-hidden">
			<Meta />
			<Toaster position="top-center" />
			<nav className="py-2 shadow">
				<div className="flex items-center justify-between px-4 lg:px-6">
					<div className="flex items-center justify-center">
						<Link href="/">
							<a className="text-red-400 tracking-tighter flex items-center space-x-2">
								<VideoCameraIcon className="w-6 h-6 text-red-500" />
								<h1 className="text-black font-bold tracking-tighter text-lg">{APP_NAME}</h1>
							</a>
						</Link>
					</div>
					<div className="hidden md:block flex-1 max-w-2xl mx-4">
						<SearchBar />
					</div>
					<div>
						<div className="flex items-center justify-end space-x-6">
							{isAuthenticated && (
								<>
									<Link href="/upload">
										<a>
											<UploadIcon className="w-6 h-6" />
										</a>
									</Link>
									<button onClick={() => toast.error('Not implemented yet')}>
										<BellIcon className="w-6 h-6" />
									</button>
								</>
							)}
							<ConnectWallet />
						</div>
					</div>
				</div>
			</nav>
			<main className="flex-1 flex flex-col">{children}</main>
		</div>
	)
}

export default Layout
