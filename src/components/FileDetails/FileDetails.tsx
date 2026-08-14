import type { FileDetail } from '../../types';
import { formatProcessingTime } from '../../utils';
import styles from './FileDetails.module.scss';

type FileDetailsProps = Readonly<{ title: string; processingTimeMs?: number } & FileDetail>;

function FileDetails({ title, sizeBytes, mimeType, processingTimeMs }: FileDetailsProps) {
  return (
    <section className={styles.fileDetails}>
      <h2>{title}</h2>

      <div className={styles.lineItem}>
        <p className={styles.label}>Size:</p>
        <p>{(sizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
      </div>

      <div className={styles.lineItem}>
        <p className={styles.label}>Type:</p>
        <p>{mimeType}</p>
      </div>

      {processingTimeMs !== undefined && (
        <div className={styles.lineItem}>
          <p className={styles.label}>Processing Time:</p>
          <p>{formatProcessingTime(processingTimeMs)}</p>
        </div>
      )}
    </section>
  );
}

export default FileDetails;
