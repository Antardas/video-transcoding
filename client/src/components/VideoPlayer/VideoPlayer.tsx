import React, { useRef } from 'react';
import ReactPlayer, { ReactPlayerProps } from 'react-player/lazy';
// const url = 'http://video.s3.localhost.localstack.cloud:4566/streams/video_mp4_master.m3u8';
// const url = 'http://video.s3.localhost.localstack.cloud:4566/Bangladesh-protesters-call-for-end-to-‘mafia-state’-they-say-prime-minister-created.mp4';

//http://video.s3.localhost.localstack.cloud:4566/streams/Bangladesh-protesters-call-for-end-to-‘mafia-state’-they-say-prime-minister-created_mp4_master.m3u8
const modifyUrl = (originalUrl: string) => {
	try {
		// Create a URL object from the original URL
		const url = new URL(originalUrl);

		// Extract the pathname (the part after the host)
		const pathname = url.pathname;

		// Extract the filename from the pathname
		const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

		// Replace the file extension and add the prefix
		const modifiedFilename = filename
			.replace('.mp4', '_mp4_master.m3u8')
			.replace('‘', '')
			.replace('’', '');

		// Construct the new pathname
		const newPathname = `/streams/${modifiedFilename}`;

		// Update the URL's pathname
		url.pathname = newPathname;

		// Return the modified URL as a string
		return url.toString();
	} catch (error) {
		console.error('Invalid URL:', error);
		return '';
	}
};

const VideoPlayer: React.FC<ReactPlayerProps> = ({ src, ...props }) => {
	const videoRef = useRef<ReactPlayer>(null);
	console.log(src);

	return (
		<div>
			{/* <video ref={videoRef} controls></video> */}
			<ReactPlayer
				ref={videoRef}
				url={modifyUrl(src)}
				controls
				config={{
					file: {
						attributes: {
							crossOrigin: 'anonymous',
						},
					},
				}}
				{...props}
			/>
		</div>
	);
};

export default VideoPlayer;
