import { Card, CardContent, CardFooter } from '@/components/ui/card';

type Props = {
	url: string;
	title: string;
};
const VideoCard = ({ url }: Props) => {
	return (
		<div>
			<Card className="">
				<CardContent className="rounded-md overflow-hidden px-0 py-0">
					<video src={url} controls></video>
				</CardContent>
				<CardFooter className="flex justify-between px-3 pt-3 pb-1">
					<div className="text-start flex-1">
						<h5 className="mr-1">
							How to Deploy container in ECR and orchestrate with ECS
						</h5>
					</div>
					<div className="w-[6rem]">{`1.8K`} Views</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default VideoCard;
