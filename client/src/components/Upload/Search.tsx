import React, { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ArrowUpRight, Search as SearchIcon } from 'lucide-react';
import { LoaderIcon } from 'lucide-react';
import { VideoObj } from '@/types';
import { SERVER_URL } from '@/lib/constant';
import { Link } from 'react-router-dom';

const Search: React.FC = () => {
	const [searchText, setSearchText] = useState<string>('');
	const [openPopover, setOpenPopover] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [videos, setVideos] = useState<VideoObj[]>([]);
	useEffect(() => {
		if (searchText.length >= 3) {
			setLoading(true);
			setOpenPopover(true);
			// TODO: api call

			(async () => {
				try {
					const res = await fetch(`${SERVER_URL}/videos/search?query=${searchText}`);
					const data = await res.json();
					setVideos(data.data);
				} catch (error) {
					console.error(error);
				} finally {
					setLoading(false);
				}
			})();
		}
	}, [searchText]);
	return (
		<Popover open={openPopover}>
			<PopoverTrigger>
				<div className="relative md:w-[200px] lg:w-[400px]">
					<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						onChange={(e) => setSearchText(e.target.value)}
						type="search"
						placeholder="Search..."
						className="w-full rounded-lg bg-background pl-8 "
					/>
				</div>
			</PopoverTrigger>
			<PopoverContent className="md:w-[200px] lg:w-[400px] min-h-52">
				{videos.length > 0
					? videos.map((video) => (
							<Link to={`/videos/${video.id}`}>
								<div className="text-blue-400 flex gap-x-2" key={video.id}>
									<span>{video.title}</span>
									<span>
										<ArrowUpRight />
									</span>
								</div>
							</Link>
					  ))
					: null}

				{!videos.length && !loading ? (
					<span>Videos not exist with your search term</span>
				) : null}
				{loading ? (
					<div className="w-full flex justify-center items-center h-full">
						<LoaderIcon className="animate-spin" />{' '}
					</div>
				) : null}
			</PopoverContent>
		</Popover>
	);
};

export default Search;
