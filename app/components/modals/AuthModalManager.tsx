// components/modals/AuthModalManager.tsx
import { useState } from 'react';
import LoginPageModal from './LoginPageModal';
import RegisterPageModal from './RegisterPageModal';

interface AuthModalManagerProps {
  closeModal: () => void;
}

export default function AuthModalManager({ closeModal }: AuthModalManagerProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(true);

  // Toggles between login and register modal views
  const toggleModal = () => setIsLoginOpen(!isLoginOpen);

  return (
    <>
      {isLoginOpen ? (
        <LoginPageModal
          isOpen={true}
          setIsOpen={closeModal}
          toggleModal={toggleModal}
        />
      ) : (
        <RegisterPageModal
          isOpen={true}
          setIsOpen={closeModal}
          toggleModal={toggleModal}
        />
      )}
    </>
  );
}
