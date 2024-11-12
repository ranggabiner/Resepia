import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 

interface LoginPageModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  toggleModal: () => void;
}

export default function LoginPageModal({ isOpen, setIsOpen, toggleModal }: LoginPageModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsOpen(false); // Close modal on successful login
        router.push(`/recipes`);
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, setIsOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setError(error?.message || null);
    setLoading(false);
  };

  // Google login handler
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setError(error.message);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg bg-white p-10 rounded-3xl shadow-lg">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <Image src="/close_24dp.svg" alt="Close icon" width={24} height={24} /> {/* Gunakan SVG icon */}
        </button>

        <div className="text-center mb-8">
          <h2 className="text-[#333333] text-4xl font-medium">Log in</h2>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="text-[#666666] text-base font-normal mb-2 block">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-[#666666]/30 px-4 text-[#333333]"
            />
          </div>

          <div>
            <label className="text-[#666666] text-base font-normal mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-[#666666]/30 px-4 text-[#333333]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-14 bg-[#111111] text-white text-xl font-medium rounded-3xl hover:bg-[#333333] transition">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="my-6 flex items-center justify-between">
          <hr className="w-1/3 border-[#666666]/25" />
          <span className="text-[#666666]/60 text-lg font-normal">OR</span>
          <hr className="w-1/3 border-[#666666]/25" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full h-14 mb-4 flex items-center justify-center bg-white border border-[#333333] rounded-3xl text-lg font-normal text-[#333333] hover:bg-gray-100 transition">
          Continue with Google
        </button>

        <div className="text-center text-[#666666] text-base font-normal">
          Don’t have an account?{' '}
          <span onClick={toggleModal} className="text-[#111111] font-medium underline cursor-pointer">
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}
