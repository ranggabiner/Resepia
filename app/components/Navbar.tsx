import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import LogInButton from "./LogInButton";
import LoginPageModal from "./modals/LoginPageModal"; // Import LoginPageModal

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // State for modal

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null); // Update user state on login/logout
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleNavigation = (e: React.MouseEvent, route: string) => {
    if (!user && (route === "/recipes" || route === "/subscription")) {
      e.preventDefault(); // Prevent navigation
      setIsAuthModalOpen(true); // Open login modal
    }
  };

  return (
    <>
      <nav className="w-full bg-[#3d5300] text-white py-4 px-8 flex justify-between items-center">
        <div className="text-2xl font-bold">
          <Link href="/">Resepia</Link>
        </div>

        <div className="flex space-x-4">
          <Link
            href="/recipes"
            className="hover:underline"
            onClick={(e) => handleNavigation(e, "/recipes")}
          >
            Recipes
          </Link>
          <Link
            href="/"
            className="hover:underline"
            onClick={(e) => handleNavigation(e, "/contact")}
          >
            Contact
          </Link>
          <Link
            href="/recipes"
            className="hover:underline"
            onClick={(e) => handleNavigation(e, "/about")}
          >
            About
          </Link>
          {/* Add Subscription link if needed */}
          <Link
            href="/subscription"
            className="hover:underline"
            onClick={(e) => handleNavigation(e, "/subscription")}
          >
            Subscription
          </Link>

          {user && (
            <Link href={`/profile/${user.id}`} className="hover:underline">
              Profile
            </Link>
          )}
        </div>

        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 py-2 px-4 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <LogInButton />
          )}
        </div>
      </nav>

      {/* Show Login modal if needed */}
      {isAuthModalOpen && (
        <LoginPageModal
          isOpen={isAuthModalOpen}
          setIsOpen={setIsAuthModalOpen}
          toggleModal={() => setIsAuthModalOpen(false)}
        />
      )}
    </>
  );
}
