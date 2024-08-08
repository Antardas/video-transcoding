import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { VideoObj } from '@/types';
import VideoPlayer from '../VideoPlayer/VideoPlayer';

const VideoCard = ({ url, title }: VideoObj) => {
	return (
		<div>
			<Card className="">
				<CardContent className="rounded-md overflow-hidden px-0 py-0">
					<VideoPlayer width={'100%'} height={'auto'} src={url} controls />
				</CardContent>
				<CardFooter className="flex justify-between px-3 pt-3 pb-1">
					<div className="text-start flex-1">
						<h5 className="mr-1">{title}</h5>
					</div>
					<div className="w-[6rem]">{`1.8K`} Views</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default VideoCard;
