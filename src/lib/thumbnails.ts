const importFileandPreview = (file: File, revoke?: boolean): Promise<string> => {
	return new Promise(resolve => {
		let preview = URL.createObjectURL(file)

		if (revoke) URL.revokeObjectURL(preview)
		setTimeout(() => resolve(preview), 100)
	})
}

export const generateVideoThumbnails = async (videoFile: File, numberOfThumbnails: number): Promise<string[]> => {
	let fractions: number[] = []
	if (!videoFile.type?.includes('video')) throw 'not a valid video file'

	const duration = await getVideoDurationFromVideoFile(videoFile)
	for (let i = 0; i <= duration; i += duration / numberOfThumbnails) fractions.push(Math.floor(i))

	return await Promise.all(
		fractions.map((time, index) => getVideoThumbnail(videoFile, index >= fractions.length - 1 ? time - 2 : time))
	)
}

const getVideoThumbnail = async (file: File | string, videoTimeInSeconds: number): Promise<string> => {
	if (!file) throw 'file not valid'

	if ((file as File)?.type?.match('video')) {
		return getVideoCover(await importFileandPreview(file as File), videoTimeInSeconds)
	}

	return getVideoCover(file as string, videoTimeInSeconds)
}

const getVideoCover = async (urlOfFIle: string, seekTo = 0.0): Promise<string> => {
	return new Promise((resolve, reject) => {
		try {
			const videoPlayer = document.createElement('video')
			videoPlayer.setAttribute('src', urlOfFIle)
			videoPlayer.crossOrigin = 'Anonymous'
			videoPlayer.load()
			videoPlayer.addEventListener('error', ex => reject(`error when loading video file ${ex}`))

			videoPlayer.addEventListener('loadedmetadata', () => {
				if (videoPlayer.duration < seekTo) return reject('video is too short.')

				// delay seeking or else 'seeked' event won't fire on Safari
				setTimeout(() => (videoPlayer.currentTime = seekTo), 200)

				videoPlayer.addEventListener('seeked', () => {
					const canvas = document.createElement('canvas')
					canvas.width = videoPlayer.videoWidth
					canvas.height = videoPlayer.videoHeight

					const ctx = canvas.getContext('2d')
					ctx!.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height)

					ctx!.canvas.toBlob(
						blob => {
							var reader = new FileReader()
							reader.readAsDataURL(blob as Blob)
							reader.onloadend = function () {
								var base64data = reader.result
								resolve(base64data as string)
							}
						},
						'image/jpeg',
						1
					)
				})
			})
		} catch (error) {
			reject(error)
		}
	})
}

export const getVideoDurationFromVideoFile = async (videoFile: File | string): Promise<number> => {
	if (!videoFile) throw 'Cannot generate video duration for this video file.'

	if ((videoFile as File)?.type?.match('video')) {
		return generateVideoDurationFromUrl(await importFileandPreview(videoFile as File))
	}

	return generateVideoDurationFromUrl(videoFile as string)
}

const generateVideoDurationFromUrl = (url: string): Promise<number> => {
	return new Promise(resolve => {
		let video = document.createElement('video')

		video.addEventListener('loadeddata', () => {
			resolve(video.duration)
			video.remove()
			URL.revokeObjectURL(url)
		})

		video.preload = 'metadata'
		video.src = url
		video.muted = true
		video.autoplay = true
		video.crossOrigin = 'anonymous'
		video.playsInline = true
		video.className = 'hidden'
		document.body.appendChild(video)
	})
}
