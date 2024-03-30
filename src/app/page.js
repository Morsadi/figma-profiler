import Image from 'next/image';
import styles from './page.module.css';
import FigmaViewer from './comonents/figmaViewer';

export default function Home() {
	return (
		<main className={styles.main}>
			<FigmaViewer fileKey='eG9oxCYlvvYWDraiQUzalz' />
		</main>
	);
}
