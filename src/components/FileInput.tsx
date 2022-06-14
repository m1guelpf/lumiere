import { validateAccept } from '@/lib/files'
import {
	AllHTMLAttributes,
	forwardRef,
	MouseEvent,
	ReactNode,
	Ref,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'

type State = {
	droppable?: boolean
	file?: File
	focused?: boolean
	name?: string
	previewUrl?: string
	type?: string
}

const initialState: State = {}

type NativeInputProps = AllHTMLAttributes<HTMLInputElement>
export type Props = {
	accept?: NativeInputProps['accept']
	autoFocus?: NativeInputProps['autoFocus']
	children: (
		context: State & {
			reset(event: MouseEvent<HTMLElement>): void
		}
	) => ReactNode
	defaultValue?: { name?: string; type: string; url: string }
	disabled?: NativeInputProps['disabled']
	error?: boolean | React.ReactNode
	id?: NativeInputProps['id']
	/** Size in megabytes */
	maxSize?: number
	name?: string
	required?: NativeInputProps['required']
	tabIndex?: NativeInputProps['tabIndex']
	onBlur?: NativeInputProps['onBlur']
	onError?(error: string): void
	onChange?(file: File): void
	onFocus?: NativeInputProps['onFocus']
	onReset?(): void
	className?: string
}

// eslint-disable-next-line react/display-name
const FileInput = forwardRef(
	(
		{
			accept,
			autoFocus,
			children,
			defaultValue,
			disabled,
			error,
			className = '',
			maxSize,
			name,
			required,
			tabIndex,
			onBlur,
			onChange,
			onError,
			onFocus,
			onReset,
		}: Props,
		ref: Ref<HTMLDivElement>
	) => {
		const defaultRef = useRef<HTMLInputElement>(null)
		const inputRef = (ref as React.RefObject<HTMLInputElement>) || defaultRef
		const [state, setState] = useState<State>(initialState)

		const hasError = error ? true : undefined

		const handleFile = useCallback(
			(file: File, event?: React.ChangeEvent | React.DragEvent) => {
				// Disallow file larger than max
				if (maxSize && file.size > maxSize * 1_000_000) {
					event?.preventDefault()

					if (onError) {
						onError(`File is ${(file.size / 1_000_000).toFixed(2)} MB. Must be smaller than ${maxSize} MB`)
					}

					return
				}

				setState(x => ({ ...x, file, name: file.name, type: file.type }))

				onChange && onChange(file)
			},
			[maxSize, onChange, onError]
		)

		const handleChange = useCallback(
			(event: React.ChangeEvent<HTMLInputElement>) => {
				const files = event.target.files
				if (!files?.length) return

				handleFile(files[0], event)
			},
			[handleFile]
		)

		const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
			event.preventDefault()

			setState(x => ({ ...x, droppable: true }))
		}, [])

		const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
			event.preventDefault()

			setState(x => ({ ...x, droppable: false }))
		}, [])

		const handleDrop = useCallback(
			(event: React.DragEvent<HTMLLabelElement>) => {
				event.preventDefault()

				setState(x => ({ ...x, droppable: false }))

				let file: File | null
				if (event.dataTransfer.items) {
					const files = event.dataTransfer.items
					if (files?.[0].kind !== 'file') return

					file = files[0].getAsFile()
					if (!file) return
				} else {
					const files = event.dataTransfer.files
					if (!files?.length) return

					file = files[0]
				}

				if (!validateAccept(file.type, accept)) {
					onError && onError(`File type ${file.type} is not allowed.`)

					return
				}

				handleFile(file, event)
			},
			[handleFile, accept, onError]
		)

		const handleFocus = useCallback(
			(event: React.FocusEvent<HTMLInputElement>) => {
				setState(x => ({ ...x, focused: true }))

				onFocus && onFocus(event)
			},
			[onFocus]
		)

		const handleBlur = useCallback(
			(event: React.FocusEvent<HTMLInputElement>) => {
				setState(x => ({ ...x, focused: false }))

				onBlur && onBlur(event)
			},
			[onBlur]
		)

		const reset = useCallback(
			(event: React.MouseEvent<HTMLInputElement>) => {
				event.preventDefault()

				setState(initialState)
				if (inputRef.current) inputRef.current.value = ''

				onReset && onReset()
			},
			[inputRef, onReset]
		)

		useEffect(() => {
			if (!defaultValue) return

			setState({ previewUrl: defaultValue.url, name: defaultValue.name, type: defaultValue.type })
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [])

		useEffect(() => {
			if (!state.file) return

			const previewUrl = URL.createObjectURL(state.file)
			setState(x => ({ ...x, previewUrl }))

			return () => URL.revokeObjectURL(previewUrl)
		}, [state.file])

		return (
			<div ref={ref} className={className}>
				<label className="h-full" onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
					<input
						className="sr-only"
						accept={accept}
						aria-invalid={hasError}
						autoFocus={autoFocus}
						disabled={disabled}
						name={name}
						ref={inputRef}
						required={required}
						tabIndex={tabIndex}
						type="file"
						onBlur={handleBlur}
						onChange={handleChange}
						onFocus={handleFocus}
					/>
					{children({ ...state, reset })}
				</label>
			</div>
		)
	}
)

export default FileInput
