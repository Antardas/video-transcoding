import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { SERVER_URL } from '@/lib/constant';
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
	title: z.string().min(2, {
		message: 'Title must be at least 2 characters.',
	}),
	description: z.string().min(2, {
		message: 'description should me minimum 10 character',
	}),
	file: z.instanceof(File, {
		message: 'Video File is Required',
	}),
});

const initializeVideoUpload = async (file: File) => {
	const formData = new FormData();
	formData.append('fileName', file.name);
	try {
		const res = await fetch(`${SERVER_URL}/upload/initialize`, {
			method: 'post',
			headers: {
				Accept: 'application/json',
				// "Content-Type": "multipart/form-data",
			},
			body: formData,
		});
		const data = await res.json();
		return data.uploadID;
	} catch (error) {
		console.log(error);
	}
};

async function uploadChunk(values: z.infer<typeof formSchema>, uploadId: string) {
	try {
		const chunkSize = 5 * 1024 * 1024;
		const totalChunk = Math.ceil(values.file.size / chunkSize);

		let start = 0;
		const chunkPromises = Array.from({ length: totalChunk }).map((_, index) => {
			const formData = new FormData();
			formData.append('fileName', values.file.name);
			formData.append('totalChunk', `${totalChunk}`);
			const chunk = values.file.slice(start, start + chunkSize);
			start += chunkSize;
			formData.append('chunk', chunk);
			formData.append('chunkIndex', `${index}`);
			formData.append('uploadId', uploadId);
			return fetch(`${SERVER_URL}/upload`, {
				method: 'post',
				headers: {
					Accept: 'application/json',
					// "Content-Type": "multipart/form-data",
				},
				body: formData,
			});
		});
		console.log(chunkPromises);

		await Promise.all(chunkPromises);
		return {
			chunkSize,
			totalChunk,
		};
	} catch (error) {
		console.log(error);
		throw error;
	}
}
const updateFilename = (filename: string): string => {
	// Split the filename into the name and extension parts
	const fileParts = filename.split('.');
	const extension = fileParts.pop();
	const name = fileParts.join('.');

	// Replace spaces or underscores with hyphens in the name part
	const updatedName = name.replace(/[\s_]+/g, '-');

	// Combine the updated name with the original extension
	return `${updatedName}.${extension}`;
};

const Upload = () => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			description: '',
			file: undefined,
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		const updatedFile = new File([values.file], updateFilename(values.file.name));
		values.file = updatedFile;
		const uploadId = await initializeVideoUpload(updatedFile);
		console.log(updatedFile);
		const { totalChunk } = await uploadChunk(values, uploadId);

		await fetch(`${SERVER_URL}/upload/complete`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				fileName: updatedFile.name,
				uploadId,
				totalChunk,
				title: values.title,
				description: values.description,
			}),
		});
		console.log('Upload Complete');
	}
	return (
		<div className="border border-slate-500 rounded flex p-2">
			<div className="w-2/5 border-r border-slate-500 pr-2">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem className="flex flex-col items-start mb-4">
									<FormLabel className="mb-2">Title</FormLabel>
									<FormControl>
										<Input placeholder="video title" {...field} />
									</FormControl>

									<FormMessage className="text-red-600 ml-3" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="flex flex-col items-start mb-4">
									<FormLabel className="mb-2">Description</FormLabel>
									<FormControl>
										<Textarea placeholder="video description" {...field} />
									</FormControl>

									<FormMessage className="text-red-600 ml-3" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="file"
							render={({ field }) => (
								<FormItem className="flex flex-col items-start mb-2">
									<FormLabel className="mb-2">Video</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept=".mp4, .webm, .ogg, .avi, .mov, .wmv, .flv, .mkv, .m4v"
											onChange={(e) => {
												const file: File | null = e.target.files
													? e.target.files[0]
													: null;
												if (!file) return;
												field.onChange(file);
											}}
										/>
									</FormControl>

									<FormMessage className="text-red-600 ml-3" />
								</FormItem>
							)}
						/>
						<Button type="submit" className="bg-slate-900 text-white">
							Submit
						</Button>
					</form>
				</Form>
			</div>
			<div className="w-3/5 overflow-hidden ">
				<div className='ml-2'>
					{form.getValues('file') ? (
						<VideoPlayer
							width={'100%'}
							height={'auto'}
							className="rounded-md"
							src={URL.createObjectURL(form.getValues('file'))}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default Upload;
