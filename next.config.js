const withTM = require('next-transpile-modules')(['@vime/core', '@vime/react'])

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
	reactStrictMode: true,
	images: {
		dangerouslyAllowSVG: true,
		domains: ['avatar.tobi.sh', 'lumiere.infura-ipfs.io', 'lens.infura-ipfs.io', 'avatars.dicebear.com'],
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	experimental: {
		newNextLinkBehavior: true,
	},
	async redirects() {
		return [{ source: '/settings', destination: '/settings/channel', permanent: true }]
	},
})

module.exports = nextConfig
