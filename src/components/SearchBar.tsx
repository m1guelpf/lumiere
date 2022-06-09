import toast from 'react-hot-toast'
import { FormEventHandler, useState } from 'react'
import { SearchIcon } from '@heroicons/react/outline'

const SearchBar = () => {
	const [query, setQuery] = useState<string>('')

	const search: FormEventHandler<HTMLFormElement> = event => {
		event.preventDefault()

		toast.error('Not implemented yet')
	}

	return (
		<form onSubmit={search} className="relative">
			<input
				type="search"
				className="h-8 p-4 text-sm w-full border border-gray-200 rounded-lg focus:outline-none"
				placeholder="Search"
				value={query}
				onChange={event => setQuery(event.target.value)}
			/>
			<button
				type="submit"
				className="flex items-center border-gray-200 bg-gray-100 hover:bg-red-400 hover:border-red-200 absolute right-0 inset-y-0 border px-6 rounded-r-lg transition group"
			>
				<SearchIcon className="w-4 h-4 text-gray-600 group-hover:text-red-50" />
			</button>
		</form>
	)
}

export default SearchBar
