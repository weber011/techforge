'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/govt');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#064e3b] flex items-center justify-center text-white font-sans">
      <div className="text-sm font-bold animate-pulse">
        Redirecting to Government Command Center (/govt)...
      </div>
    </div>
  );
}
