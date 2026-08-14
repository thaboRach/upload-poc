import type { FFMPEGVersion } from './types/ffmpegVersion';

export const FFMPEGCoreBaseUrl = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
export const FFMPEGCoreMTBaseUrl = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm';

export const FFMPEGVersionOptions = [
  { label: 'Single Thread', value: 'single' },
  { label: 'Multi Thread', value: 'multi' },
];

export const DefaultFFMPEGVersion: FFMPEGVersion = 'multi';
