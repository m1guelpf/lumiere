const withTM = require('next-transpile-modules')(['@vime/core', '@vime/react'])

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
	reactStrictMode: true,
	images: {
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	experimental: {
		newNextLinkBehavior: true,
		images: {
			remotePatterns: [{ protocol: 'https', hostname: '**' }],
		},
	},
	async redirects() {
		return [{ source: '/settings', destination: '/settings/channel', permanent: true }]
	},
})

module.exports = nextConfig
