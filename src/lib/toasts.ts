import toast, { DefaultToastOptions, Renderable, resolveValue, ValueOrFunction } from 'react-hot-toast'

export function toastOn<T>(
	fn: () => Promise<T>,
	msgs: {
		loading: Renderable
		success: ValueOrFunction<Renderable, T>
		error: ValueOrFunction<Renderable, any>
	},
	opts?: DefaultToastOptions | undefined
): Promise<T> {
	const id = toast.loading(msgs.loading, { ...opts, ...opts?.loading })
	const promise = fn()

	promise
		.then(async p => {
			toast.success(resolveValue(msgs.success, p), { id, ...opts, ...opts?.success })

			return p
		})
		.catch(e => {
			console.log(e)
			toast.error(resolveValue(msgs.error, e), { id, ...opts, ...opts?.error })
		})

	return promise
}
