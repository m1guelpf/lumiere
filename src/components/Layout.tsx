import Meta from './Meta'
import Link from 'next/link'
import toast from 'react-hot-toast'
import SearchBar from './SearchBar'
import LensAvatar from './LensAvatar'
import { classNames } from '@/lib/utils'
import { Toaster } from 'react-hot-toast'
import ConnectWallet from './ConnectWallet'
import useLogin from '@/hooks/lens/useLogin'
import { FC, Fragment, ReactNode } from 'react'
import { APP_NAME, IS_MAINNET } from '@/lib/consts'
import { Menu, Transition } from '@headlessui/react'
import { useProfile } from '@/context/ProfileContext'
import { BellIcon, UploadIcon } from '@heroicons/react/outline'
import { BeakerIcon, VideoCameraIcon } from '@heroicons/react/solid'

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
	const { logout } = useLogin()
	const { profile, isAuthenticated } = useProfile()

	return (
		<div className="min-h-screen flex flex-col overflow-hidden">
			<Meta />
			<Toaster position="top-center" />
			<nav className="py-2 shadow">
				<div className="flex items-center justify-between px-4 lg:px-6">
					<div className="flex items-center justify-center">
						<Link href="/" className="text-red-400 tracking-tighter flex items-center space-x-2">
							<VideoCameraIcon className="w-6 h-6 text-red-500" />
							<h1 className="text-black font-bold tracking-tighter text-lg">{APP_NAME}</h1>
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
										<UploadIcon className="w-6 h-6" />
									</Link>
									<button onClick={() => toast.error('Not implemented yet')}>
										<BellIcon className="w-6 h-6" />
									</button>
								</>
							)}
							<ConnectWallet>
								<Menu as="div" className="ml-3 relative">
									<div>
										<Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
											<span className="sr-only">Open user menu</span>
											<LensAvatar profile={profile} width={32} height={32} />
										</Menu.Button>
									</div>
									<Transition
										as={Fragment}
										enter="transition ease-out duration-200"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
											<Menu.Item>
												{({ active }) => (
													<Link
														href={`/channel/${profile?.handle}`}
														className={classNames(
															active ? 'bg-gray-100' : '',
															'hover:bg-gray-100 block px-4 py-2 text-sm text-gray-700 transition'
														)}
													>
														Your Channel
													</Link>
												)}
											</Menu.Item>
											<Menu.Item>
												{({ active }) => (
													<Link
														href="/settings"
														className={classNames(
															active ? 'bg-gray-100' : '',
															'hover:bg-gray-100 block px-4 py-2 text-sm text-gray-700 transition'
														)}
													>
														Settings
													</Link>
												)}
											</Menu.Item>
											<Menu.Item>
												{({ active }) => (
													<button
														onClick={logout}
														className={classNames(
															active ? 'bg-gray-100' : '',
															'hover:bg-gray-100 block w-full text-left px-4 py-2 text-sm text-gray-700 transition'
														)}
													>
														Log out
													</button>
												)}
											</Menu.Item>
										</Menu.Items>
									</Transition>
								</Menu>
							</ConnectWallet>
						</div>
					</div>
				</div>
			</nav>
			{!IS_MAINNET && (
				<div className="bg-indigo-50 border-t border-indigo-200 border-b border-l-4 [border-left-color:rgb(129,140,248)] p-4">
					<div className="flex space-x-3">
						<div className="flex-shrink-0">
							<BeakerIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
						</div>
						<div>
							<p className="text-sm text-indigo-700 md:hidden">
								Lumiere is in test mode. Your content won&apos;t show up when we go live. Test away!
							</p>
							<p className="hidden md:inline text-sm text-indigo-700">
								Lumiere is in test mode. Your content is stored in the Mumbai testnet, and won&apos;t
								show up when we go live. Test away!
							</p>
						</div>
					</div>
				</div>
			)}
			<main className="flex-1 flex flex-col">{children}</main>
		</div>
	)
}

export default Layout
