import VideoCard from './VideoCard';

const VideoFeed = () => {
	return (
		<div className="grid grid-cols-3 gap-y-6 gap-x-4">
			{Array.from({ length: 10 }).map((_, index) => (
				<VideoCard
					key={`video${index} `}
					url={
						'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
					}
					title="Just Title"
				/>
			))}
		</div>
	);
};

export default VideoFeed;
