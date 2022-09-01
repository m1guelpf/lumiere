import Spinner from './Spinner'
import toast from 'react-hot-toast'
import { uploadFile } from '@/lib/ipfs'
import { classNames } from '@/lib/utils'
import { dataURItoFile } from '@/lib/files'
import { XIcon } from '@heroicons/react/solid'
import { generateVideoThumbnails } from '@/lib/thumbnails'
import FileInput, { Props as FileInputProps } from './FileInput'
import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { CheckCircleIcon, ExclamationIcon, UploadIcon } from '@heroicons/react/outline'

type Image = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/jpeg, image/png, image/webp'
type Video =
	| 'image/gif'
	| 'video/mp4'
	| 'video/ogg'
	| 'video/webm'
	| 'video/x-m4v'
	| 'image/gif, video/mp4, video/ogg, video/webm, video/x-m4v'
export type Accept =
	| Image
	| Video
	| `${Image}, ${Image}`
	| `${Video}, ${Video}`
	| `${Video}, ${Video}, ${Video}`
	| `${Image}, ${Video}`

type BaseProps = {
	accept?: Accept
	autoFocus?: FileInputProps['autoFocus']
	defaultValue?: { name?: string; type: string; url: string }
	disabled?: FileInputProps['disabled']
	error?: boolean | React.ReactNode
	id?: FileInputProps['id']
	label: React.ReactNode
	maxSize?: number
	name?: string
	required?: FileInputProps['required']
	tabIndex?: FileInputProps['tabIndex']
	uploaded?: boolean
	uploading?: boolean
	uploadProgress?: number
	onBlur?: FileInputProps['onBlur']
	onError?(error: string): void
	onChange?: FileInputProps['onChange']
	onFocus?: FileInputProps['onFocus']
	onReset?: FileInputProps['onReset']
	className?: string
}
type WithoutCompact = {
	compact?: never
	cover?: boolean
}
type WithCompact = {
	compact?: boolean
	cover?: never
}

type Props = BaseProps & (WithCompact | WithoutCompact)

type IpfsProps = { onChange?: (CID: string, mimeType: string) => void; onFileChange?: (arg0: File) => void } & Omit<
	Props,
	'uploadProgress' | 'uploading' | 'onChange'
>

export const IpfsMediaPicker: FC<IpfsProps> = ({ onChange, onFileChange, onReset, ...props }) => {
	const [ipfsCID, setIpfsCID] = useState<string>(null)
	const [mimeType, setMimeType] = useState<string>(null)
	const [uploadProgress, setUploadProgress] = useState<number>(0)

	useEffect(() => {
		onChange && onChange(ipfsCID, mimeType)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onChange, ipfsCID])

	const onUpload = (file: File) => {
		setMimeType(file.type)
		onFileChange && onFileChange(file)

		uploadFile(file, setUploadProgress).then(CID => {
			setIpfsCID(CID)
			setUploadProgress(0)
		})
	}

	const onRemove = () => {
		setMimeType(null)
		setIpfsCID(null)
		setUploadProgress(0)
		onReset && onReset()
	}

	return (
		<MediaPicker
			uploadProgress={uploadProgress}
			uploading={uploadProgress != 0}
			uploaded={!!ipfsCID}
			onChange={onUpload}
			onReset={onRemove}
			{...(props as Props)}
		/>
	)
}

type ThumbnailsProps = { onThumbnailChange?: (arg0: string) => void } & Omit<IpfsProps, 'onFileChange' | 'onReset'>

export const MediaPickerWithThumbnails: FC<ThumbnailsProps> = ({ onThumbnailChange, ...props }) => {
	const [thumbnails, setThumbnails] = useState<string[]>([])
	const [uploadProgress, setUploadProgress] = useState<number>(0)
	const [selectedThumbnail, setSelectedThumbnail] = useState(0)
	const onUpload = (file: File) => {
		generateVideoThumbnails(file, 3).then(setThumbnails)
	}

	useEffect(() => {
		if (thumbnails.length == 0) return

		const thumbnail = dataURItoFile(thumbnails[selectedThumbnail], 'thumbnail.jpg')

		uploadFile(thumbnail, setUploadProgress).then(CID => {
			onThumbnailChange(CID)
			setUploadProgress(0)
		})
	}, [thumbnails, selectedThumbnail, onThumbnailChange])

	return (
		<>
			<div className="sm:col-span-3">
				<span className="block text-sm font-medium text-gray-700 mb-1">Video</span>
				<div className="aspect-w-16 aspect-h-9">
					<IpfsMediaPicker onFileChange={onUpload} onReset={() => setThumbnails([])} {...props} />
				</div>
			</div>
			{thumbnails.length > 0 && (
				<div className="sm:col-span-3">
					<span className="block text-sm font-medium text-gray-700 mb-1">Video Thumbnail</span>
					<div className="grid grid-cols-2 gap-2">
						{thumbnails.map((url, i) => (
							<button
								type="button"
								onClick={() => setSelectedThumbnail(i)}
								className={classNames(
									selectedThumbnail == i
										? 'border-blue-500'
										: 'border-transparent hover:border-blue-500',
									'rounded-lg overflow-hidden border-2 transition relative'
								)}
								key={i}
							>
								<img src={url} alt={`Generated thumbnail #${i + 1}`} />
								{selectedThumbnail == i && (
									<div className="absolute top-2 right-2 bg-transparent backdrop-filter backdrop-blur-lg backdrop-saturate-150 rounded-full">
										<CheckCircleIcon className="w-5 h-5 text-blue-500" />
									</div>
								)}
								{selectedThumbnail == i && ![0, 100].includes(Math.floor(uploadProgress * 100)) && (
									<div className="absolute bottom-3 right-0 -mr-1 bg-blue-600 text-blue-100 py-1 pr-2 pl-3 text-xs rounded-l-full z-10">
										Uploading... {Math.floor(uploadProgress * 100)}%
									</div>
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</>
	)
}

const MediaPicker: FC<Props> = ({
	accept = 'image/jpeg, image/png, image/webp, image/gif, video/mp4, video/ogg, video/webm, video/x-m4v',
	autoFocus,
	compact,
	cover,
	defaultValue,
	disabled,
	error,
	id,
	label,
	maxSize = 5,
	name,
	required,
	tabIndex,
	uploaded,
	uploading,
	uploadProgress,
	onBlur,
	onChange,
	onError,
	onFocus,
	onReset,
	className,
}: Props) => {
	const hasError = error ? true : undefined

	const baseOnError = (error: string) => {
		toast.error(error)

		onError && onError(error)
	}

	return (
		<FileInput
			accept={accept}
			autoFocus={autoFocus}
			defaultValue={defaultValue}
			id={id}
			maxSize={maxSize}
			name={name}
			tabIndex={tabIndex}
			required={required}
			onBlur={onBlur}
			onChange={onChange}
			onError={baseOnError}
			onFocus={onFocus}
			onReset={onReset}
			className={className}
		>
			{context => (
				<div className="relative h-full">
					<div
						className={classNames(
							context.droppable && 'border-dashed',
							uploaded
								? 'border-emerald-400'
								: uploading || context.focused
								? 'border-blue-600'
								: 'border-gray-200',
							disabled && 'cursor-not-allowed bg-gray-400',
							'rounded-xl border-2 overflow-hidden relative transition w-full h-full transform-gpu'
						)}
					>
						<div
							className="absolute top-0 inset-x-0 bg-blue-500 h-1 rounded-lg z-10 transition-all"
							style={{ width: `${uploadProgress * 100}%` }}
						/>
						{uploading && (
							<div className="absolute bottom-3 right-0 -mr-1 bg-blue-600 text-blue-100 py-1 pr-2 pl-3 text-xs rounded-l-full z-10">
								Uploading... {Math.floor(uploadProgress * 100)}%
							</div>
						)}
						<div
							className={classNames(
								disabled && 'cursor-not-allowed',
								compact ? 'flex-row p-4 pr-12' : 'p-10',
								'flex items-center justify-center cursor-pointer flex-col gap-4 w-full h-full'
							)}
						>
							<MediaPreview
								compact={compact}
								fileName={context.name}
								fileType={context.type}
								hasError={hasError}
								previewUrl={context.previewUrl}
								uploading={uploading}
							/>
							<span
								className={classNames(
									compact ? 'items-start gap-1.5 text-left' : 'items-center gap-4 text-center',
									'flex flex-col'
								)}
							>
								<span
									className={classNames(
										compact ? '' : 'text-lg',
										context.file ? 'text-gray-600' : 'text-gray-500',
										'font-semibold break-words'
									)}
								>
									{!cover && context.file ? (
										context.file.name
									) : (
										<>
											{label} {required && <span className="sr-only">(required)</span>}
										</>
									)}
								</span>
								<MediaTag
									compact={compact}
									error={error}
									maxSize={maxSize}
									uploadProgress={uploadProgress}
									uploaded={uploaded}
									uploading={uploading}
								/>
							</span>
						</div>
						{cover && context.type && context.previewUrl && (
							<div className="flex inset-0 absolute justify-center">
								<Media cover name={context.name} type={context.type} url={context.previewUrl} />
							</div>
						)}
					</div>
					{context.type && (
						<div className="absolute right-1 top-1">
							<RemoveButton cover={cover} onClick={context.reset} />
						</div>
					)}
				</div>
			)}
		</FileInput>
	)
}

type MediaProps = {
	cover?: boolean
	name?: string
	type: string
	url: string
}

const Media = ({ cover, name, type, url }: MediaProps) => {
	if (type.includes('image')) {
		return (
			<img
				alt={name}
				src={url}
				className={classNames(
					cover ? 'bg-gray-100 min-h-full min-w-full object-cover object-center' : 'max-h-full max-w-full'
				)}
			/>
		)
	} else if (type.includes('video')) {
		return (
			<video
				autoPlay
				loop
				muted
				src={url}
				className={classNames(
					cover ? 'bg-gray-100 min-h-full min-w-full object-cover object-center' : 'max-h-full max-w-full'
				)}
			/>
		)
	}

	return null
}

type MediaPreviewProps = Pick<Props, 'compact' | 'uploading'> & {
	fileName?: string
	fileType?: string
	hasError?: boolean
	previewUrl?: string
}

const MediaPreview = ({ compact, fileName, fileType, hasError, previewUrl, uploading }: MediaPreviewProps) => {
	return (
		<span
			className={classNames(
				compact ? 'h-16 min-w-16' : 'h-32 w-32',
				'flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden relative text-gray-400'
			)}
		>
			{(() => {
				if (!uploading && fileType && previewUrl) {
					return <Media name={fileName} type={fileType} url={previewUrl} />
				}

				return (
					<div className="w-6 h-6">
						{(() => {
							if (uploading) return <Spinner />
							if (hasError) return <ExclamationIcon />
							return <UploadIcon />
						})()}
					</div>
				)
			})()}
		</span>
	)
}

type MediaTagProps = Pick<Props, 'compact' | 'error' | 'maxSize' | 'uploadProgress' | 'uploaded' | 'uploading'>

const MediaTag = ({ error, maxSize, uploadProgress, uploaded, uploading }: MediaTagProps) => {
	let statusProps: Parameters<typeof Tag>[0] | undefined
	if (uploading) {
		statusProps = {
			className: 'text-blue-400 bg-blue-50',
			...(uploadProgress
				? { label: 'Uploading', children: `${uploadProgress * 100}%` }
				: { children: 'Uploading' }),
		}
	} else if (uploaded) statusProps = { children: 'Success', className: 'text-green-400 bg-green-50' }
	else if (error)
		statusProps = {
			className: 'text-red-400 bg-red-50',
			...(typeof error === 'string' ? { label: 'Error', children: error } : { children: 'Error' }),
		}
	else if (maxSize !== undefined) {
		const isGb = maxSize >= 1024

		statusProps = {
			label: 'Maximum size',
			children: `${isGb ? maxSize / 1024 : maxSize} ${isGb ? 'GB' : 'MB'}`,
		}
	}

	if (!statusProps) return null
	return <Tag as="span" {...statusProps} />
}

type RemoveButtonProps = Pick<Props, 'cover'> & {
	onClick(event: React.MouseEvent<HTMLButtonElement>): void
}

const RemoveButton = ({ cover, onClick }: RemoveButtonProps) => {
	const content = (
		<>
			<span className="sr-only">Remove Media</span>
			<XIcon className="w-4 h-4" />
		</>
	)

	if (cover)
		return (
			<button
				className={classNames(
					'flex items-center justify-center cursor-pointer h-8 w-8 md:h-12 md:w-12 rounded-full bg-white/20 md:bg-translarent hover:bg-white/30 hover:bg-gray-100 text-white/80 md:text-black/60 p-1 md:p-2 m-2 md:m-0 transition'
				)}
				onClick={onClick}
			>
				{content}
			</button>
		)

	return (
		<button className="rounded-full hover:bg-gray-100 text-gray-600 p-2 transition" onClick={onClick}>
			{content}
		</button>
	)
}

type TagProps = { as?: 'div' | 'span'; label?: string; className?: string }

export const Tag = ({ as: Component = 'div', children, label, className }: PropsWithChildren<TagProps>) => {
	return (
		<Component
			className={classNames(
				className ?? 'text-gray-400 bg-gray-50',
				'flex items-center font-medium w-max rounded-full transition text-sm h-6'
			)}
		>
			{label && (
				<label className={classNames('flex items-center rounded-full h-full px-2 shadow-[0_0_0_2px_white]')}>
					{label}
				</label>
			)}
			<Component className="px-2">{children}</Component>
		</Component>
	)
}

export default MediaPicker
