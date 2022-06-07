import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { APP_ID } from '@/lib/consts'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { trimIndentedSpaces } from '@/lib/utils'
import { useProfile } from '@/context/ProfileContext'
import useCreatePost from '@/hooks/lens/useCreatePost'
import { FC, FormEventHandler, useState } from 'react'
import { MetadataVersions, VideoMimeTypes } from '@/types/metadata'
import { MediaPickerWithThumbnails } from '@/components/MediaPicker'

const UploadPage: FC = () => {
	const router = useRouter()
	const { profile } = useProfile()
	const { createPost } = useCreatePost()

	const [title, setTitle] = useState<string>('')
	const [videoCID, setVideoCID] = useState<string>(null)
	const [videoType, setVideoType] = useState<string>(null)
	const [description, setDescription] = useState<string>('')
	const [thumbnailCID, setThumbnailCID] = useState<string>(null)

	const uploadVideo: FormEventHandler<HTMLFormElement> = async event => {
		event.preventDefault()
		if (!videoCID) return toast.error('Please wait for the video to finish uploading.')
		if (!thumbnailCID) return toast.error('Please wait for the thumbnail to finish uploading.')

		await createPost({
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

		setTitle('')
		setDescription('')
		router.push(`/channel/${profile.handle}`)
		toast.success('Published video!')
	}

	return (
		<Layout>
			<div className="container mx-auto py-12 px-4 md:px-0">
				<div>
					<h3 className="text-2xl leading-6 font-medium text-gray-900">Upload to Lumiere</h3>
					<p className="mt-2 text-sm text-gray-500">
						Uploaded videos will be visible on your profile, search and explore pages. Other Lens-powered
						sites may choose to show them as well.
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
		</Layout>
	)
}

export default UploadPage
