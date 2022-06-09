import Layout from '@/components/Layout'
import Link from 'next/link'

const Error404 = () => {
	return (
		<Layout>
			<div className="flex-1 flex flex-col items-center justify-center space-y-10">
				<p className="text-5xl font-bold text-center">404 - Page Not Found</p>
				<Link href="/">
					<a className="flex items-center space-x-2 border border-red-500 text-red-500 rounded px-3 py-1">
						Go home
					</a>
				</Link>
			</div>
		</Layout>
	)
}

export default Error404
