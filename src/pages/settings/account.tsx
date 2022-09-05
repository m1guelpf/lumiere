import { useAccount } from 'wagmi'
import toast from 'react-hot-toast'
import { toastOn } from '@/lib/toasts'
import { useRouter } from 'next/router'
import { classNames } from '@/lib/utils'
import { ERROR_MESSAGE } from '@/lib/consts'
import { FC, useEffect, useState } from 'react'
import { Erc20, FollowModules } from '@/types/lens'
import VerifiedIcon from '@/components/VerifiedIcon'
import { useProfile } from '@/context/ProfileContext'
import SettingsLayout from '@/components/SettingsLayout'
import WorldIdBadge from '@/components/Icons/WorldIdBadge'
import useSetDefaultProfile from '@/hooks/lens/useSetDefaultProfile'
import useApprovedCurrencies from '@/hooks/lens/useApprovedCurrencies'
import useUpdateFollowModule from '@/hooks/lens/useUpdateFollowModule'

const SettingsPage: FC = () => {
	const router = useRouter()
	const { address } = useAccount()
	const { currencies } = useApprovedCurrencies()
	const { profile, isAuthenticated } = useProfile()
	const { profiles, setSelectedProfile } = useProfile()
	const { updateFollowModule } = useUpdateFollowModule()
	const { setDefaultProfile: saveDefaultProfile } = useSetDefaultProfile()

	const [amount, setAmount] = useState<string>('')
	const [currency, setCurrency] = useState<string>('')
	const [recipient, setRecipient] = useState<string>('')
	const [defaultProfile, setDefaultProfile] = useState<string>('')
	const [followModule, setFollowModule] = useState<FollowModules>(null)

	useEffect(() => {
		if (isAuthenticated) return

		router.push('/login?next=settings/account')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated])

	useEffect(() => {
		if (!profiles) return

		setDefaultProfile(profiles.find(profile => profile.isDefault)?.id)
	}, [profiles])

	useEffect(() => {
		if (!profile) return

		setFollowModule(profile.followModule?.type)

		if (profile.followModule?.__typename == 'FeeFollowModuleSettings') {
			setAmount(profile.followModule.amount.value)
			setRecipient(profile.followModule.recipient)
			setCurrency(profile.followModule.amount.asset.address)
		} else {
			setRecipient(address)
		}
	}, [profile, address])

	const onFollowModuleUpdate = async event => {
		event.preventDefault()

		const waitForIndex = await updateFollowModule({
			feeFollowModule: {
				amount: {
					value: amount,
					currency: currency,
				},
				recipient,
			},
		})

		await toastOn(waitForIndex, {
			loading: 'Finishing update...',
			success: 'Subscriptions updated!',
			error: ERROR_MESSAGE,
		})

		setFollowModule(FollowModules.FeeFollowModule)
	}

	const disableSubscriptions = async () => {
		const waitForIndex = await updateFollowModule({
			freeFollowModule: true,
		})

		await toastOn(waitForIndex, {
			loading: 'Finishing update...',
			success: 'Subscriptions disabled!',
			error: ERROR_MESSAGE,
		})

		setAmount('')
		setCurrency('')
		setFollowModule(null)
	}

	const updateDefaultProfile = async event => {
		event.preventDefault()

		await saveDefaultProfile(defaultProfile)

		setSelectedProfile(profiles.findIndex(profile => profile.id === defaultProfile))
	}

	return (
		<SettingsLayout title="Account" className="bg-gray-100">
			<div className="space-y-6 mt-8">
				<section>
					<form onSubmit={updateDefaultProfile}>
						<div className="shadow sm:overflow-hidden sm:rounded-md">
							<div className="bg-white py-6 px-4 sm:p-6">
								<div>
									<h2
										id="payment-details-heading"
										className="text-lg font-medium leading-6 text-gray-900"
									>
										Default Profile
									</h2>
									<p className="mt-1 text-sm text-gray-500">
										Set a default profile to automatically switch to it on every Lens frontend.
									</p>
								</div>

								<div className="mt-6 grid grid-cols-4 gap-6">
									<div className="col-span-4">
										<label htmlFor="profile" className="block text-sm font-medium text-gray-700">
											Profile
										</label>
										<select
											value={defaultProfile}
											onChange={event => setDefaultProfile(event.target.value)}
											id="profile"
											name="profile"
											required
											className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
										>
											<option value={null} disabled>
												Select profile
											</option>
											{profiles?.map(profile => (
												<option key={profile.id} value={profile.id}>
													{profile.handle}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
								<button
									type="submit"
									className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
								>
									Update
								</button>
							</div>
						</div>
					</form>
				</section>
				<section>
					<form onSubmit={onFollowModuleUpdate}>
						<div className="shadow sm:overflow-hidden sm:rounded-md">
							<div className="bg-white py-6 px-4 sm:p-6">
								<div>
									<h2
										id="payment-details-heading"
										className="text-lg font-medium leading-6 text-gray-900"
									>
										Channel Subscriptions
									</h2>
									<p className="mt-1 text-sm text-gray-500">
										Require a one-time payment to subscribe to your channel. Will only be billed to
										new subscribers.
									</p>
								</div>

								<div className="mt-6 grid grid-cols-4 gap-6">
									<div className="col-span-4 md:col-span-2">
										<label htmlFor="currency" className="block text-sm font-medium text-gray-700">
											Currency
										</label>
										<select
											value={currency}
											onChange={event => setCurrency(event.target.value)}
											id="currency"
											name="currency"
											required
											className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
										>
											<option value="" disabled>
												Select a currency
											</option>
											{currencies.map(currency => (
												<option key={currency.address} value={currency.address}>
													{currency.name}
												</option>
											))}
										</select>
									</div>
									<div className="col-span-4 md:col-span-2">
										<label htmlFor="amount" className="block text-sm font-medium text-gray-700">
											Amount
										</label>
										<input
											type="text"
											name="amount"
											id="amount"
											value={amount}
											required
											onChange={event => setAmount(event.target.value)}
											className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
										/>
									</div>
									<div className="col-span-4">
										<label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
											Recipient
										</label>
										<input
											type="text"
											required
											value={recipient}
											onChange={event => setRecipient(event.target.value)}
											name="recipient"
											id="recipient"
											className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
										/>
									</div>
								</div>
							</div>
							<div
								className={classNames(
									followModule == FollowModules.FeeFollowModule
										? 'flex flex-row-reverse items-center justify-between'
										: 'flex items-center justify-end',
									`bg-gray-50 px-4 py-3 sm:px-6`
								)}
							>
								<button
									type="submit"
									className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
								>
									{followModule != FollowModules.FeeFollowModule
										? 'Enable Subscriptions'
										: 'Update Subscription'}
								</button>
								{followModule == FollowModules.FeeFollowModule && (
									<button
										type="button"
										onClick={disableSubscriptions}
										className="rounded-md text-sm bg-white font-medium text-red-600 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
									>
										Disable Subscription
									</button>
								)}
							</div>
						</div>
					</form>
				</section>
				<section>
					<form>
						<div className="shadow sm:overflow-hidden sm:rounded-md">
							<div className="bg-white py-6 px-4 sm:p-6">
								<div>
									<h2
										id="payment-details-heading"
										className="text-lg font-medium leading-6 text-gray-900"
									>
										Verification
									</h2>
									<p className="mt-1 text-sm text-gray-500">
										Requesting verification for your profile is coming soon!
									</p>
								</div>
							</div>
						</div>
					</form>
				</section>
				<section>
					<form>
						<div className="shadow sm:overflow-hidden sm:rounded-md">
							<div className="bg-white py-6 px-4 sm:p-6">
								<div>
									<h2 className="text-lg font-medium leading-6 text-gray-900 flex items-center space-x-1">
										<span>Human Badge</span>
										<WorldIdBadge width={20} height={20} />
									</h2>
									<p className="mt-1 text-sm text-gray-500">
										The human badge shows which users have completed a biometric proof of humanity.
									</p>
									{profile?.onChainIdentity?.worldcoin?.isHuman && (
										<p className="mt-2 text-gray-800 text-sm">Your profile is verified.</p>
									)}
								</div>
							</div>
							{!profile?.onChainIdentity?.worldcoin?.isHuman && (
								<div className="bg-gray-50 text-right px-4 py-3 sm:px-6">
									<a
										target="_blank"
										rel="noreferrer"
										href="https://human.withlens.app"
										className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
									>
										Verify with Worldcoin
									</a>
								</div>
							)}
						</div>
					</form>
				</section>
			</div>
		</SettingsLayout>
	)
}

export default SettingsPage
