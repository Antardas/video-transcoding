import path from "node:path";

export const VIDEO_FOLDER = path.join(process.cwd(), "videos")
export const VIDEO_SUBTITLE_FOLDER = path.join(process.cwd(), "subtitles");
export const COMMON_SUBTITLE_FILE = path.join(VIDEO_SUBTITLE_FOLDER, "subtitle");
export const COMMON_SUBTITLE_FILE_WITH_EXT = path.join(VIDEO_SUBTITLE_FOLDER, "subtitle.srt");