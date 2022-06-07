const withTM = require('next-transpile-modules')(['@vime/core', '@vime/react'])

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
	reactStrictMode: true,
})

module.exports = nextConfig
