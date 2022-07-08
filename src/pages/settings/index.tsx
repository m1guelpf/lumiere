import { GetStaticProps } from 'next'

const RedirectToChannelPage = () => null

export const getStaticProps: GetStaticProps = async ctx => {
	return {
		redirect: {
			destination: '/settings/channel',
			statusCode: 308,
		},
	}
}

export default RedirectToChannelPage
