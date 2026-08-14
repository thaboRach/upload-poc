import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

import styles from './App.module.scss';
import FileDetails from '../components/FileDetails/FileDetails';
import type { FileDetail } from '../types';
import RadioGroup from '../components/RadioGroup/RadioGroup';
import { DefaultFFMPEGVersion, FFMPEGVersionOptions } from '../constants';
import type { FFMPEGVersion } from '../types/ffmpegVersion';
import { getFFMPEGVersionConfig } from '../utils';

function App() {
  const ffmpegRef = useRef(new FFmpeg());

  const [audioDetails, setAudioDetails] = useState<FileDetail | null>(null);
  const [processedAudioDetails, setProcessedAudioDetails] = useState<FileDetail | null>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [processingTimeMs, setProcessingTimeMs] = useState<number | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [ffmpegVersion, setFfmpegVersion] = useState<FFMPEGVersion>(DefaultFFMPEGVersion);

  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (processedAudioUrl) {
        URL.revokeObjectURL(processedAudioUrl);
      }
    };
  }, [processedAudioUrl]);

  const loadFfmpeg = async () => {
    const ffmpeg = ffmpegRef.current;

    if (ffmpeg.loaded) {
      return;
    }

    setIsLoadingFfmpeg(true);

    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    try {
      console.info('Loading FFmpeg...');
      const config = await getFFMPEGVersionConfig(ffmpegVersion);
      await ffmpeg.load(config);
    } catch (error) {
      console.error('Error loading FFmpeg:', error);
    } finally {
      setIsLoadingFfmpeg(false);
      console.info('FFmpeg loaded successfully.');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setAudioDetails(null);
      return;
    }

    setAudioDetails({
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
    });
    setOriginalFile(file);
    setProcessedAudioDetails(null);
    setProcessedAudioUrl(null);
    setError(null);
  };

  const handleProcessClick = async () => {
    if (!originalFile) {
      setError('No recording file selected.');
      return;
    }

    setProcessedAudioDetails(null);
    setProcessedAudioUrl(null);

    await loadFfmpeg();

    setIsProcessing(true);
    const processingStartedAt = performance.now();

    const ffmpeg = ffmpegRef.current;

    const outputCandidates = [
      {
        fileName: 'compressed-audio.webm',
        mimeType: 'audio/webm; codecs=opus',
      },
      {
        fileName: 'compressed-audio.ogg',
        mimeType: 'audio/ogg; codecs=opus',
      },
    ];

    try {
      await ffmpeg.writeFile(originalFile.name, await fetchFile(originalFile));

      let processedAudioDetails: FileDetail | null = null;

      for (const candidate of outputCandidates) {
        try {
          const exitCode = await ffmpeg.exec([
            '-y',
            '-i',
            originalFile.name,
            '-map',
            '0:a:0',
            '-vn',
            '-c:a',
            'libopus',
            '-b:a',
            '96k',
            candidate.fileName,
          ]);

          if (exitCode !== 0) {
            throw new Error(`FFmpeg exited with code ${exitCode}.`);
          }

          const output = await ffmpeg.readFile(candidate.fileName);

          if (typeof output !== 'string') {
            const outputBuffer = new ArrayBuffer(output.byteLength);
            new Uint8Array(outputBuffer).set(output);
            const outputUrl = URL.createObjectURL(
              new Blob([outputBuffer], { type: candidate.mimeType }),
            );
            processedAudioDetails = {
              name: candidate.fileName,
              sizeBytes: output.byteLength,
              mimeType: candidate.mimeType,
            };
            setProcessingTimeMs(performance.now() - processingStartedAt);
            setProcessedAudioUrl(outputUrl);
            break;
          }
        } catch (processingError) {
          console.error(`Error processing as ${candidate.mimeType}:`, processingError);
          await ffmpeg.deleteFile(candidate.fileName).catch(() => undefined);
        }
      }

      if (!processedAudioDetails) {
        throw new Error('FFmpeg could not encode the recording as WebM or Ogg Opus audio.');
      }
      setProcessedAudioDetails(processedAudioDetails);
    } catch (processingError) {
      console.error('Error processing recording:', processingError);
      setError(
        processingError instanceof Error
          ? processingError.message
          : 'The recording could not be processed.',
      );
    } finally {
      for (const candidate of outputCandidates) {
        await ffmpeg.deleteFile(candidate.fileName).catch(() => undefined);
      }
      setIsProcessing(false);
    }
  };

  return (
    <main>
      <h1>Recording Upload</h1>

      <section className={styles.uploadSection}>
        <div className={styles.uploadControls}>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileChange}
            disabled={isLoadingFfmpeg || isProcessing}
          />
          <RadioGroup
            options={FFMPEGVersionOptions}
            defaultValue={DefaultFFMPEGVersion}
            onChange={(value) => setFfmpegVersion(value as FFMPEGVersion)}
          />
        </div>

        <div className={styles.audioDetailsContainer}>
          <FileDetails
            title="Original"
            name={audioDetails?.name ?? 'N/A'}
            sizeBytes={audioDetails?.sizeBytes ?? 0}
            mimeType={audioDetails?.mimeType ?? 'N/A'}
          />

          <FileDetails
            title="Processed"
            name={processedAudioDetails?.name ?? 'N/A'}
            sizeBytes={processedAudioDetails?.sizeBytes ?? 0}
            mimeType={processedAudioDetails?.mimeType ?? 'N/A'}
            processingTimeMs={processingTimeMs ?? undefined}
          />
        </div>

        <div className={styles.statusArea} aria-live="polite">
          {isLoadingFfmpeg && <p className={styles.loader}>Loading FFmpeg...</p>}
          {isProcessing && <p className={styles.loader}>Processing recording...</p>}
          {error && <p role="alert">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleProcessClick}
          disabled={isLoadingFfmpeg || isProcessing || !originalFile}
        >
          Process
        </button>
      </section>

      {processedAudioUrl && processedAudioDetails && (
        <a href={processedAudioUrl} download={processedAudioDetails.name}>
          Download compressed file
        </a>
      )}
    </main>
  );
}

export default App;
