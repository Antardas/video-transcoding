import React, { useEffect, useRef } from 'react';
import HLS from 'hls.js';
// const url = 'http://video.s3.localhost.localstack.cloud:4566/streams/video_mp4_master.m3u8';
const url = 'http://video.s3.localhost.localstack.cloud:4566/streams/video_mp4_master.m3u8';
const VideoPlayer = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	useEffect(() => {
		const video = videoRef.current;
		if (HLS.isSupported() && video) {
			const hls = new HLS();
			hls.loadSource(url);
			hls.attachMedia(video);
			hls.on(HLS.Events.MANIFEST_PARSED, (event, data) => {
				console.log('manifest loaded, found ', data.levels.length, 'video quality levels');
				video.play();
			});
		} else {
			console.warn('Browser dont support hls');
		}
	}, []);
	return (
		<div>
			<video ref={videoRef} controls></video>
		</div>
	);
};

export default VideoPlayer;
