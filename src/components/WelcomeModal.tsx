import Image from 'next/image'
import splashImg from '@images/splash.png'
import { Dialog, Transition } from '@headlessui/react'
import { FC, Fragment, useCallback, useEffect, useState } from 'react'

const WelcomeModal: FC = () => {
	const [open, setOpen] = useState<boolean>(false)

	useEffect(() => {
		setOpen(localStorage.getItem('welcomeModal') !== 'true')
	}, [])

	const onClose = useCallback(() => {
		setOpen(false)
		localStorage.setItem('welcomeModal', 'true')
	}, [])

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={onClose}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
				</Transition.Child>

				<div className="fixed z-10 inset-0 overflow-y-auto ">
					<div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
								<div>
									<Image
										src={splashImg}
										height={450}
										objectFit="cover"
										alt="Welcome"
										placeholder="blur"
									/>
								</div>
								<div className="bg-white px-4 pb-4 pt-2 sm:px-6 sm:pb-4">
									<Dialog.Title as="h3" className="text-2xl text-center font-bold text-gray-900">
										Welcome to <span className="text-red-500">Lumiere</span>!
									</Dialog.Title>
									<div className="mt-3 mb-6 space-y-4 text-sm md:text-base text-gray-500 text-center md:max-w-md md:mx-auto">
										<p>
											Lumiere is a web3 video platform, powered by the Lens Protocol. It allows
											you to finally{' '}
											<span className="font-semibold text-red-500">own your content</span>.
										</p>
										<p>
											The videos you see here come from all across the{' '}
											<span className="font-semibold text-green-500">Lensverse</span>. Everything
											you post will also show up in other Lens sites.
										</p>
										<p>
											Lumiere is{' '}
											<span className="text-yellow-500 font-semibold">still in beta</span>, so
											some things aren&apos;t quite there yet. Report (and contribute){' '}
											<a
												className="font-semibold text-black"
												href="https://github.com/m1guelpf/lumiere"
												target="_blank"
												rel="noreferrer"
											>
												on GitHub
											</a>
											!
										</p>
									</div>
									<button
										onClick={onClose}
										className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
									>
										Let&apos;s do this!
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	)
}

export default WelcomeModal
