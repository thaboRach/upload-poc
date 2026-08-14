import type { FFMPEGVersion } from './types/ffmpegVersion';
import { toBlobURL } from '@ffmpeg/util';
import { FFMPEGCoreBaseUrl, FFMPEGCoreMTBaseUrl } from './constants';

export function formatProcessingTime(processingTimeMs: number) {
  return `${(processingTimeMs / 1000).toFixed(2)} seconds`;
}

export async function getFFMPEGVersionConfig(version: FFMPEGVersion) {
  if (version === 'single') {
    return {
      coreURL: await toBlobURL(`${FFMPEGCoreBaseUrl}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${FFMPEGCoreBaseUrl}/ffmpeg-core.wasm`, 'application/wasm'),
    };
  }

  return {
    coreURL: await toBlobURL(`${FFMPEGCoreMTBaseUrl}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${FFMPEGCoreMTBaseUrl}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(`${FFMPEGCoreMTBaseUrl}/ffmpeg-core.worker.js`, 'text/javascript'),
  };
}
