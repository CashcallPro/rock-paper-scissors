import type { AppProps } from 'next/app';
import MainLayout from '../src/components/layout/MainLayout'; // Adjust path if necessary
import '../src/styles/globals.css'; // Assuming you have a global CSS file

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}

export default MyApp;
