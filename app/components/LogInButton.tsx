// components/LogInButton.tsx
import { useState } from "react";
import AuthModalManager from "./modals/AuthModalManager";

export default function LogInButton() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsAuthModalOpen(true)}
        className="h-10 px-[25.50px] pt-[7.50px] pb-[8.50px] bg-[#cca4a4] rounded-lg border-2 border-[#997b7b] justify-center items-center inline-flex cursor-pointer transition-all hover:bg-[#997b7b] hover:border-[#cca4a4]"
      >
        <div className="text-center text-white text-base font-normal">
          Log In
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthModalManager closeModal={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
}
