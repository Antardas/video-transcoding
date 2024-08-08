import { useEffect, useState } from 'react';
import VideoCard from './VideoCard';
import { WATCH_SERVER_URL } from '@/lib/constant';
import { VideoObj } from '@/types';

const fetchVideos = async (limit: number, offset: number): Promise<AllVideosRes> => {
	const res = await fetch(`${WATCH_SERVER_URL}/videos?limit=${limit}&offset=${offset}`);
	const data = (await res.json()) as AllVideosRes;
	return data;
};
const VideoFeed = () => {
	const [videos, setVideos] = useState<VideoObj[]>([]);
	useEffect(() => {
		(async () => {
			const data: AllVideosRes = await fetchVideos(10, 0);
			if (data.success) {
				setVideos(data.data);
			}
		})();
	}, []);
	return (
		<div className="grid grid-cols-3 gap-y-6 gap-x-4">
			{videos.map((video) => (
				<VideoCard
					key={`video${video.id} `}
					url={video.url}
					title={video.title}
					description={video.description}
					id={video.id}
				/>
			))}
		</div>
	);
};

export default VideoFeed;

type AllVideosRes = {
	success: boolean;
	data: VideoObj[];
};
