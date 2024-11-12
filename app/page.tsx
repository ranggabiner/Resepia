'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from './components/Navbar';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      <Navbar />  {/* Add Navbar here */}
      <main className="flex flex-col items-center justify-center py-16 px-4 w-full max-w-4xl text-center">
      </main>
    </div>
  );
}
