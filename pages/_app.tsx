import type { AppProps } from 'next/app';
import '../styles/globals.css';

/**
 * Custom App component to initialize pages. This file applies global CSS
 * and renders each page component passed by Next.js.
 */
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
