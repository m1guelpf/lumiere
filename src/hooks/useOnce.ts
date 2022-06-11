import { useRef } from 'react'

const useOnce = <T extends Function>(fn: T): [Function, Function] => {
	const ref = useRef<boolean>(false)

	return [
		(...args) => {
			if (ref.current) return
			ref.current = true

			try {
				const result = fn(...args)
				ref.current = true

				return result
			} catch (e) {
				ref.current = false
			}
		},
		() => {
			ref.current = false
		},
	]
}

export default useOnce
