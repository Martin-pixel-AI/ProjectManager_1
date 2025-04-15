'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/');
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-lg">Redirecting...</p>
    </div>
  );
}
