import Link from 'next/link'

const Error404 = () => {
	return (
		<div className="flex-1 flex flex-col items-center justify-center">
			<div className="text-center">
				<p className="text-sm font-semibold text-red-600 uppercase tracking-wide">404 error</p>
				<h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
					Page not found.
				</h1>
				<p className="mt-2 text-base text-gray-500">Sorry, we couldn’t find the page you’re looking for.</p>
				<div className="mt-6">
					<Link href="/" className="text-base font-medium text-red-600 hover:text-red-500">
						Go back home<span aria-hidden="true"> &rarr;</span>
					</Link>
				</div>
			</div>
		</div>
	)
}

export default Error404
