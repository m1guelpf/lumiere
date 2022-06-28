import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { toastOn } from '@/lib/toasts'
import { useRouter } from 'next/router'
import { trimIndentedSpaces } from '@/lib/utils'
import { APP_ID, ERROR_MESSAGE } from '@/lib/consts'
import { useProfile } from '@/context/ProfileContext'
import useCreatePost from '@/hooks/lens/useCreatePost'
import { FC, FormEventHandler, useEffect, useState } from 'react'
import { MetadataVersions, VideoMimeTypes } from '@/types/metadata'
import { MediaPickerWithThumbnails } from '@/components/MediaPicker'

const UploadPage: FC = () => {
	const router = useRouter()
	const { profile, isAuthenticated } = useProfile()
	const { createPost } = useCreatePost()

	useEffect(() => {
		if (isAuthenticated) return

		router.push('/login?next=upload')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated])

	const [title, setTitle] = useState<string>('')
	const [videoCID, setVideoCID] = useState<string>(null)
	const [videoType, setVideoType] = useState<string>(null)
	const [description, setDescription] = useState<string>('')
	const [thumbnailCID, setThumbnailCID] = useState<string>(null)

	const uploadVideo: FormEventHandler<HTMLFormElement> = async event => {
		event.preventDefault()
		if (!videoCID) return toast.error('Please wait for the video to finish uploading.')
		if (!thumbnailCID) return toast.error('Please wait for the thumbnail to finish uploading.')

		const waitForIndex = await createPost({
			version: MetadataVersions.one,
			metadata_id: uuidv4(),
			description: trimIndentedSpaces(description),
			content: trimIndentedSpaces(description),
			external_url: null,
			image: `ipfs://${thumbnailCID}`,
			imageMimeType: 'image/jpeg',
			animation_url: `ipfs://${videoCID}`,
			name: title,
			attributes: [
				{
					traitType: 'string',
					key: 'type',
					value: 'post',
				},
			],
			media: [
				{ item: `ipfs://${videoCID}`, type: videoType as VideoMimeTypes },
				{ item: `ipfs://${thumbnailCID}`, type: 'image/jpeg' },
			],
			appId: APP_ID,
		})

		await toastOn(waitForIndex, {
			loading: 'Finishing upload...',
			success: 'Video uploaded!',
			error: ERROR_MESSAGE,
		})

		setTitle('')
		setDescription('')
		router.push(`/channel/${profile.handle}`)
	}

	return (
		<div className="container mx-auto py-12 px-4 md:px-0">
			<div>
				<h3 className="text-2xl leading-6 font-medium text-gray-900">Upload to Lumiere</h3>
				<p className="mt-2 text-sm text-gray-500">
					Uploaded videos will be visible on your profile, search and explore pages. Other Lens-powered sites
					may choose to show them as well.
				</p>
			</div>
			<form onSubmit={uploadVideo} className="space-y-8 divide-y divide-gray-200">
				<div className="space-y-8 divide-y divide-gray-200">
					<div>
						<div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
							<MediaPickerWithThumbnails
								className="h-full"
								name="video"
								cover
								label="Choose or drag and drop media"
								accept="video/mp4, video/webm, video/x-m4v"
								maxSize={100}
								onThumbnailChange={setThumbnailCID}
								onChange={(CID, mimeType) => {
									setVideoCID(CID)
									setVideoType(mimeType)
								}}
								required
							/>
							<div className="sm:col-span-4">
								<label htmlFor="title" className="block text-sm font-medium text-gray-700">
									Title
								</label>
								<div className="mt-1">
									<input
										id="title"
										name="title"
										type="text"
										className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md placeholder:text-gray-400"
										required
										placeholder="Badgers : animated music video : MrWeebl"
										value={title}
										onChange={event => setTitle(event.target.value)}
									/>
								</div>
							</div>

							<div className="sm:col-span-6">
								<label htmlFor="description" className="block text-sm font-medium text-gray-700">
									Description
								</label>
								<div className="mt-1">
									<textarea
										id="description"
										name="description"
										rows={4}
										required
										className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md placeholder:text-gray-400"
										placeholder="badger badger badger badger"
										value={description}
										onChange={event => setDescription(event.target.value)}
									/>
								</div>
								<p className="mt-2 text-sm text-gray-500">
									Will be shown below the video, across Lens sites, and on the collected NFT.
								</p>
							</div>
						</div>
						<fieldset className="mt-4">
							<legend className="block text-sm font-medium text-gray-700">Terms</legend>
							<div className="mt-2 space-y-5">
								<label className="relative flex items-start">
									<div className="flex items-center h-5">
										<input
											id="rights"
											aria-describedby="rights-description"
											name="rights"
											type="checkbox"
											required
											className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<span className="sr-only">Rights</span>
										<p id="rights-description" className="text-gray-500">
											I own the rights for the uploaded content, and allow Lumiere (and other
											Lens-powered sites) to host and display it
										</p>
									</div>
								</label>
								<label className="relative flex items-start">
									<div className="flex items-center h-5">
										<input
											id="sensitive"
											aria-describedby="sensitive-description"
											name="sensitive"
											type="checkbox"
											className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
											required
										/>
									</div>
									<div className="ml-3 text-sm">
										<span className="sr-only">Sensitive</span>
										<p id="sensitive-description" className="text-gray-500">
											The uploaded content is suitable for all audiences, and does not contain
											illegal or sensitive media
										</p>
									</div>
								</label>
							</div>
						</fieldset>
					</div>
				</div>

				<div className="pt-5">
					<div className="flex justify-end">
						<button
							type="submit"
							className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
						>
							Create
						</button>
					</div>
				</div>
			</form>
		</div>
	)
}

export default UploadPage
