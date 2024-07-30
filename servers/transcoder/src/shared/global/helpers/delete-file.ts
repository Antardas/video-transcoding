import fs from 'node:fs/promises';

export default async function deleteFile(path: string): Promise<boolean> {
	try {
		await fs.unlink(path);
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}
