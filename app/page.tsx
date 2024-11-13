'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from './components/Navbar';
import Hero from './components/CarouselCard';
import Carousel from './components/Carousel';
import CarouselCard from './components/CarouselCard';

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
    <div className="min-h-screen flex flex-col items-center bg-[#FFE6E6]">
      <Navbar />  {/* Add Navbar here */}
      <Carousel interval={5000}>
        <CarouselCard />
        <CarouselCard />
        <CarouselCard />
      </Carousel>
    </div>
  );
}
