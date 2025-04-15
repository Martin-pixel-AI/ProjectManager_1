'use client';

import { Inter } from 'next/font/google';
import AuthProvider from '@/components/layout/AuthProvider';
import { Layout } from '@/components/layout/Layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
} 