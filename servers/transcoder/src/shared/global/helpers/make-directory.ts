import fs from 'node:fs';
export default function makeDirectory(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	} else {
		console.log(`Directory "${dir}" already exists`);
	}
}
