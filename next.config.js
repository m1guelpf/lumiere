const withTM = require('next-transpile-modules')(['@vime/core', '@vime/react'])

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
	reactStrictMode: true,
	images: {
		dangerouslyAllowSVG: true,
		domains: ['avatar.tobi.sh', 'ipfs.infura.io'],
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
})

module.exports = nextConfig
