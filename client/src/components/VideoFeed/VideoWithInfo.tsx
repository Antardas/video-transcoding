import React, { useEffect, useState } from 'react';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import { VideoObj } from '@/types';
import { SERVER_URL } from '@/lib/constant';
import { useParams } from 'react-router-dom';

const VideoWithInfo = () => {
	const [video, setVideo] = useState<VideoObj | null>();
	const { id } = useParams();
	useEffect(() => {
		(async () => {
			const res = await fetch(`${SERVER_URL}/videos/${id}`);
			const data = await res.json();
			setVideo(data.data);
		})();
	}, [id]);
	if (!video) {
		return;
	}
	return (
		<div className="rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 w-[700px] mx-auto px-2">
			<VideoPlayer width={'100%'} src={video.url} />
			<div className="text-start mt-3">
				<h3 className="text-2xl">{video.title}</h3>
				<p>
					{video.description}
				</p>
			</div>
		</div>
	);
};

export default VideoWithInfo;
