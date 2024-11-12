// components/modals/RegisterPageModal.tsx
import { Dispatch, SetStateAction, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface RegisterPageModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  toggleModal: () => void;
}

export default function RegisterPageModal({ isOpen, setIsOpen, toggleModal }: RegisterPageModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });
    if (!error) {
      setIsOpen(false); // Close modal on successful signup
      router.refresh();
    } else {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg bg-white p-10 rounded-3xl shadow-lg">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-4xl">
          &times;
        </button>

        <div className="text-center mb-8">
          <h2 className="text-[#333333] text-4xl font-medium">Sign Up</h2>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-6">
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
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-[#666666] text-base font-normal mt-4">
          Already have an account?{' '}
          <span onClick={toggleModal} className="text-[#111111] font-medium underline cursor-pointer">
            Log in
          </span>
        </div>
      </div>
    </div>
  );
}
