import { create } from 'ipfs-http-client'
import { ImportCandidate } from 'ipfs-core-types/src/utils'

const client = create({
	host: 'ipfs.infura.io',
	port: 5001,
	protocol: 'https',
	headers: {
		Authorization: `Basic ${Buffer.from(
			`${process.env.NEXT_PUBLIC_IPFS_ID}:${process.env.NEXT_PUBLIC_IPFS_PASSWORD}`
		).toString('base64')}`,
	},
})

const uploadToIPFS = async <T extends ImportCandidate>(data: T, onProgress?: (number) => void): Promise<string> => {
	const result = await client.add(data, { progress: onProgress })

	return result.path
}

export const uploadJSON = async <T>(data: T): Promise<string> => {
	return uploadToIPFS(JSON.stringify(data))
}

export const uploadFile = async (data: File, onProgress?: (number) => void): Promise<string> => {
	return uploadToIPFS(
		data,
		onProgress ? (progress: number) => onProgress((progress / data.size).toFixed(2)) : undefined
	)
}
