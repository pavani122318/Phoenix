import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LetterProvider } from '@/context/LetterContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Phoenix — A Modern Indian Pigeon Letter Service',
  description: 'Write letters online. We will turn your messages into beautifully customized physical parchment letters, sealed with wax, and delivered on a memorable journey by carrier pigeon or express postal partner.',
  keywords: 'pigeon letter, physical letter service, vintage letters, indian postal, love letters, custom gifts India, paper mail',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-parchment-100 text-phoenix-indigo font-sans">
        <LetterProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </LetterProvider>
      </body>
    </html>
  );
}
