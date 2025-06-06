import './globals.css'
import 'react-toastify/dist/ReactToastify.css';
import { Inter } from 'next/font/google'
import SupabaseProvider from '@/context/supabase-context'
import { CommonProvider } from '@/context/common-context'
import MyToastContainer from '@/components/MyToastContainer'
import { PaddleLoader } from '@/components/PaddleLoader';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'go sea template',
  description: 'a simple  template make you life easy!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PaddleLoader />
        <SupabaseProvider>
          <CommonProvider>
            {children}
          </CommonProvider>
        </SupabaseProvider>
        <MyToastContainer />
      </body>
    </html>
  )
}
