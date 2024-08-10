import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type CompletedNum = (num: number) => void;
export const promiseAllProgress = (promises: Array<Promise<Response>>, cb: CompletedNum) => {
	let completed = 0;
	return new Promise((resolve, reject) => {
		promises.forEach((promise) => {
			promise
				.then(() => {
					console.log(completed, 'completed');
					
					completed +=1;
					cb(completed);
					if (completed === promises.length) {
						resolve(true);
					}
				})
				.catch((err) => {
					reject(err);
				});
		});
	});
};
