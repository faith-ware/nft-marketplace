import Head from 'next/head';
import { useAppContext } from '../context/state';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Faith Arts</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='main'>
        <p>Hello there!</p>
      </div>
    </div>
  )
}