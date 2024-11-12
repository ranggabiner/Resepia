// components/Navbar.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LogInButton from './LogInButton';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null); // Update user state on login/logout
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="w-full bg-blue-600 text-white py-4 px-8 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link href="/">Resepia</Link>
      </div>

      <div className="flex space-x-4">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/recipes" className="hover:underline">Recipes</Link>
        {user && (
          <Link href={`/profile/${user.id}`} className="hover:underline">Profile</Link>
        )}
      </div>

      <div>
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 py-2 px-4 rounded-lg hover:bg-red-600">
            Logout
          </button>
        ) : (
          <LogInButton />
        )}
      </div>
    </nav>
  );
}
