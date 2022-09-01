import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CopyIcon from '@/components/CopyIcon'
import LensAvatar from '@/components/LensAvatar'
import { useProfile } from '@/context/ProfileContext'
import SettingsLayout from '@/components/SettingsLayout'
import StateAwareIcon from '@/components/StateAwareIcon'

const SettingsPage = () => {
	const router = useRouter()
	const { profile, isAuthenticated } = useProfile()

	const [bio, setBio] = useState<string>('')
	const [name, setName] = useState<string>('')
	const [website, setWebsite] = useState<string>('')
	const [twitter, setTwitter] = useState<string>('')

	useEffect(() => {
		if (isAuthenticated) return

		router.push('/login?next=settings/channel')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated])

	useEffect(() => {
		if (!profile) return

		setName(profile.name)
		setBio(profile.bio)
		setWebsite(profile.attributes.find(attr => attr.key == 'website')?.value ?? '')
		setTwitter(profile.attributes.find(attr => attr.key == 'twitter')?.value ?? '')
	}, [profile])

	const updateSettings = event => {
		event.preventDefault()

		toast.error('Not implemented yet.')
	}

	return (
		<SettingsLayout title="Channel">
			<form onSubmit={updateSettings} className="mt-6 space-y-8 divide-y divide-y-slate-200">
				<div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
					<div className="sm:col-span-6">
						<label htmlFor="name" className="block text-sm font-medium text-slate-900">
							Name
						</label>
						<input
							type="text"
							name="name"
							id="name"
							value={name}
							onChange={event => setName(event.target.value)}
							className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-slate-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div className="sm:col-span-6">
						<label htmlFor="channelURL" className="block text-sm font-medium text-slate-900">
							Channel URL
						</label>
						<div className="relative">
							<input
								type="text"
								name="channelURL"
								id="channelURL"
								readOnly
								value={`${process.env.NEXT_PUBLIC_URL}/${profile?.handle}`}
								className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm text-slate-900 sm:text-sm focus:ring-0 focus:border-slate-300"
							/>
							<CopyIcon
								text={`${process.env.NEXT_PUBLIC_URL}/${profile?.handle}`}
								className="absolute inset-y-0 right-4"
								iconClassName="w-5 h-5"
							/>
						</div>
					</div>

					<div className="sm:col-span-6">
						<label htmlFor="photo" className="block text-sm font-medium text-slate-900">
							Photo
						</label>
						<div className="mt-1 flex items-center">
							<LensAvatar width={48} height={48} profile={profile} />
							<div className="ml-4 flex">
								<div className="relative bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm flex items-center cursor-pointer hover:bg-slate-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-50 focus-within:ring-blue-500">
									<label
										htmlFor="avatar"
										className="relative text-sm font-medium text-slate-900 pointer-events-none"
									>
										<span>Change</span>
										<span className="sr-only"> avatar</span>
									</label>
									<input
										id="avatar"
										name="avatar"
										type="file"
										onChange={() => toast.error('Not implemented yet')}
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
									/>
								</div>
								<button
									type="button"
									onClick={() => toast.error('Not implemented yet')}
									className="ml-3 bg-transparent py-2 px-3 border border-transparent rounded-md text-sm font-medium text-slate-900 hover:text-slate-700 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-blue-500"
								>
									Remove
								</button>
							</div>
						</div>
					</div>

					<div className="sm:col-span-6">
						<label htmlFor="description" className="block text-sm font-medium text-slate-900">
							Description
						</label>
						<div className="mt-1">
							<textarea
								id="description"
								name="description"
								rows={4}
								className="block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
								value={bio}
								onChange={event => setBio(event.target.value)}
							/>
						</div>
						<p className="mt-3 text-sm text-slate-500">
							Brief description for your channel. Usernames are hyperlinked.
						</p>
					</div>

					<div className="sm:col-span-6">
						<label htmlFor="website" className="block text-sm font-medium text-slate-900">
							Website
						</label>
						<input
							type="url"
							name="website"
							id="website"
							value={website}
							onChange={event => setWebsite(event.target.value)}
							className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-slate-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div className="sm:col-span-6">
						<label htmlFor="twitterUsername" className="block text-sm font-medium text-slate-900">
							Twitter
						</label>
						<div className="mt-1 flex rounded-md shadow-sm">
							<span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
								twitter.com/
							</span>
							<input
								type="text"
								name="twitterUsername"
								id="twitterUsername"
								autoComplete="twitter"
								value={twitter}
								onChange={event => setTwitter(event.target.value)}
								className="flex-1 block w-full min-w-0 border-slate-300 rounded-none rounded-r-md text-slate-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
				</div>

				<div className="pt-8 flex justify-end">
					<button
						type="submit"
						className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Save
					</button>
				</div>
			</form>
		</SettingsLayout>
	)
}

export default SettingsPage
