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
	}, []);
	return (
		<div className="rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 w-[700px] mx-auto px-2">
			<VideoPlayer width={'100%'} url={'https://youtu.be/DhHawiDfS08?list=RDEyJ78139Hc0'} />
			<div className="text-start mt-3">
				<h3 className="text-2xl">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto, ab!
				</h3>
				<p>
					Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatibus delectus
					repellendus deserunt rerum, necessitatibus suscipit est recusandae ad similique
					eveniet perferendis, id quisquam ullam possimus iste sed deleniti. Porro,
					numquam.
				</p>
			</div>
		</div>
	);
};

export default VideoWithInfo;
