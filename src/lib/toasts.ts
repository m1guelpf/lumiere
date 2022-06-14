import toast, { DefaultToastOptions, Renderable, ValueOrFunction } from 'react-hot-toast'

export function toastOn<T>(
	fn: () => Promise<T>,
	msgs: {
		loading: Renderable
		success: ValueOrFunction<Renderable, T>
		error: ValueOrFunction<Renderable, any>
	},
	opts?: DefaultToastOptions | undefined
): Promise<T> {
	return toast.promise<T>(fn(), msgs, opts)
}
