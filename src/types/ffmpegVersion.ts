export const ffmpegVersions = ['single', 'multi'] as const;

export type FFMPEGVersion = (typeof ffmpegVersions)[number];
