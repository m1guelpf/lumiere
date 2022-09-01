import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

export const uploadFile = async (file: File, onProgress?: (number) => void): Promise<string> => {
	const formData = new FormData()
	formData.append('data', file, uuidv4())

	return axios
		.post(`https://shuttle-5.estuary.tech/content/add`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESTUARY_KEY}`,
			},
			onUploadProgress: function (progressEvent) {
				const percentCompleted = (progressEvent.loaded / progressEvent.total).toFixed(2)
				onProgress?.(percentCompleted)
			},
		})
		.then(res => res.data.cid)
}

export const uploadJSON = async <T>(data: T): Promise<string> => {
	return uploadFile(new File([JSON.stringify(data)], `${uuidv4()}.json`, { type: 'application/json' }))
}
