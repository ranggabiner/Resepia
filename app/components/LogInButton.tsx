// components/LogInButton.tsx
import { useState } from 'react';
import AuthModalManager from './modals/AuthModalManager';

export default function LogInButton() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsAuthModalOpen(true)}
        className="w-[98px] h-10 px-[25.50px] pt-[7.50px] pb-[8.50px] bg-[#111111] rounded-lg border border-[#111111] justify-center items-center inline-flex cursor-pointer hover:bg-gray-800">
        <div className="text-center text-white text-base font-normal">Log In</div>
      </div>

      {isAuthModalOpen && (
        <AuthModalManager closeModal={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
}
