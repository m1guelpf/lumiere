import { classNames } from '@/lib/utils'
import { CreditCardIcon, ExclamationIcon, StarIcon, UserCircleIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import { FC, ReactNode } from 'react'

const navigation = [
	{
		name: 'Channel',
		description: `Change your channel's appearance, name and branding.`,
		href: '/settings/channel',
		icon: StarIcon,
	},
	{
		name: 'Account',
		description: 'Set your default profile, and configure monetization.',
		href: '/settings/account',
		icon: UserCircleIcon,
	},
	{
		name: 'Allowance',
		description: 'Configure your payment settings to join channels or collect videos.',
		href: '/settings/allowance',
		icon: CreditCardIcon,
	},
	{
		name: 'Danger Zone',
		description: `Delete your channel and Lens account. You probably don't want to do this.`,
		href: '/settings/danger',
		icon: ExclamationIcon,
	},
]

const SettingsLayout: FC<{ title: string; children: ReactNode | ReactNode[] }> = ({ title, children }) => {
	const router = useRouter()

	return (
		<>
			<div className="h-full flex">
				<div className="flex-1 min-w-0 flex flex-col overflow-hidden">
					<main className="flex-1 flex overflow-hidden">
						<div className="flex-1 flex flex-col overflow-y-auto xl:overflow-hidden">
							<div className="flex-1 flex xl:overflow-hidden">
								{/* Secondary sidebar */}
								<nav
									aria-label="Sections"
									className="hidden flex-shrink-0 w-96 bg-white border-r border-slate-200 xl:flex xl:flex-col"
								>
									<div className="flex-shrink-0 h-16 px-6 border-b border-slate-200 flex items-center">
										<p className="text-lg font-medium text-slate-900">Settings</p>
									</div>
									<div className="flex-1 min-h-0 overflow-y-auto">
										{navigation.map(item => (
											<a
												key={item.name}
												href={item.href}
												className={classNames(
													router.asPath === item.href
														? 'bg-blue-50 bg-opacity-50'
														: 'hover:bg-blue-50 hover:bg-opacity-50',
													'flex p-6 border-b border-slate-200'
												)}
												aria-current={router.asPath === item.href ? 'page' : undefined}
											>
												<item.icon
													className="flex-shrink-0 -mt-0.5 h-6 w-6 text-slate-400"
													aria-hidden="true"
												/>
												<div className="ml-3 text-sm">
													<p className="font-medium text-slate-900">{item.name}</p>
													<p className="mt-1 text-slate-500">{item.description}</p>
												</div>
											</a>
										))}
									</div>
								</nav>
								{/* Main content */}
								<div className="flex-1 xl:overflow-y-auto">
									<div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:py-12 lg:px-8">
										<h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>

										{children}
									</div>
								</div>
							</div>
						</div>
					</main>
				</div>
			</div>
		</>
	)
}

export default SettingsLayout
