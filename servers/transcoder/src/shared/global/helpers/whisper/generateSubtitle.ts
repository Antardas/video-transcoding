import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { exec, spawn } from 'child_process';
import path from 'path';
import fs from 'node:fs';
import { VIDEO_FOLDER } from '../CONSTANT';
console.log(ffmpegInstaller);

// generate subtitle with whisper officially supported python package
const generateSubtitleRaw = async (
	audioFilePath: string,
	model = 'medium',
	language = '',
	task = ''
) => {
	console.time('Subtitle');
	console.log('Started generating subtitle');
	const modelOption = `--model ${model}`;
	const languageOption = language ? `--language ${language}` : '';
	const taskOption = task ? `--task ${task}` : '';
	const outputDirectory = VIDEO_FOLDER;
	const command = `whisper ${audioFilePath} ${modelOption} ${languageOption} ${taskOption} --fp16 False --output_format srt --output_dir ${outputDirectory} --translate`;

	const [executable, ...args] = command.split(' ');
	const newArgs = args.filter((s) => s !== '');

	const child = spawn(executable, newArgs);

	child.stdout.on('data', (data: string) => {
		console.log(`stdout: ${data}`);
	});

	child.stderr.on('data', (data: string) => {
		console.error(`stderr: ${data}`);
	});

	child.on('error', (error: Error) => {
		console.error(`Error: ${error.message}`);
	});

	child.on('close', (code: number) => {
		console.timeEnd('Subtitle');
		console.log(`Child process exited with code ${code}`);
	});
};

const generateSubtitleWithMakeFile = async (
	audioFilePath: string,
	outFile: string,
	progress: (percentage: string) => void
): Promise<boolean> => {
	/* 
	clone the repo
	git clone https://github.com/ggerganov/whisper.cpp.git
	run the bash script here base.en is model name
	bash ./models/download-ggml-model.sh base.en 
	run `make -j`
	copy the `main` and models/ggml-base.en.bin file here
	here is more details: https://github.com/ggerganov/whisper.cpp/tree/master/models
	 */

	if (!audioFilePath.endsWith('.wav')) {
		console.log('Please provide the only wave file');
		return false;
	}

	const regex = /^ggml-.*\.bin$/;
	const listOfFile = fs.readdirSync(__dirname);

	let modelExist = false;
	let mainFileExists = false;
	for (const file of listOfFile) {
		if (regex.test(file)) {
			modelExist = true;
			continue;
		}
		if (file === 'main') {
			mainFileExists = true;
			continue;
		}
	}
	console.log(modelExist, mainFileExists);

	if (!modelExist || !mainFileExists) {
		console.error(
			'Model or make file not found. Please make sure to download the model file and put it in the same directory as this script.'
		);
		console.log(`
		clone the repo
			git clone https://github.com/ggerganov/whisper.cpp.git
		run the bash script here base.en is model name
			bash ./models/download-ggml-model.sh base.en 
		run
			"make -j"
		copy the "make" and models/ggml-base.en.bin file here
		here is more details: https://github.com/ggerganov/whisper.cpp/tree/master/models
	`);
		return false;
	}

	console.time('Subtitle');
	console.log('Started generating subtitle');

	const mainPath = path.join(__dirname, 'main');
	const modelPath = path.join(__dirname, 'ggml-base.bin');
	const command = `./main -m ${modelPath} -f ${audioFilePath} -of ${outFile} -osrt -pp`;

	const [_executable, ...args] = command.split(' ');
	const newArgs = args.filter((s) => s !== '');

	const child = spawn(mainPath, newArgs);
	const percentageRegex = /progress\s*=\s*(\d+)%/;

	return await new Promise<boolean>((resolve, reject) => {
		child.stdout.on('data', (data: string) => {
			console.log(`stdout: ${data}`);
		});

		child.stderr.on('data', (data: string) => {
			const match = data.toString().match(percentageRegex);
			if (match) {
				let percentage = match[1];
				if (percentage === '101') {
					percentage = '100'
				}
				progress(percentage);
				console.log(percentage);
			}
			// console.error(`stderr: ${data}`);
		});

		child.on('error', (error: Error) => {
			console.error(`Error: ${error.message}`);
			reject(error);
		});

		child.on('close', (code: number) => {
			console.timeEnd('Subtitle');
			console.log(`Child process exited with code ${code}`);
			// progress('100');
			resolve(code === 0); // 0 means successful completion of the process. 1 means error. 2 means termination due to signal. 127 means command not found. 126 means permission denied. 128+n means signal n was received. 130 means killed by termination signal. 137 means program received a fatal signal like SIGKILL or SIGSEGV. 139 means program received a fatal signal like SIG
		});
	});
};
export const generateSubtitle = async (
	audioFilePath: string,
	subOutFile: string,
	progress: (percentage: string) => void
): Promise<boolean> => {
	return await generateSubtitleWithMakeFile(audioFilePath, subOutFile, progress);
};
