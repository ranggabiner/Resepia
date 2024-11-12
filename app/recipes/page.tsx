'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import RecipeCard from '../components/recipes/RecipeCard'; // Import komponen RecipeCard
import Navbar from '../components/Navbar'; // Import Navbar komponen

export default function AllRecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]); // State for filtered recipes
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search input
  const router = useRouter();

  useEffect(() => {
    const fetchRecipes = async () => {
      // Get the current session to check the logged-in user's ID
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      setCurrentUser(userId || null);

      // Fetch all recipes along with user information from profiles
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles:user_id (
            username,
            first_name,
            last_name
          )
        `);

      if (error) {
        console.error('Error fetching recipes:', error.message);
        alert('Error fetching recipes');
        return;
      }

      setRecipes(data || []);
      setFilteredRecipes(data || []); // Set initial filtered recipes
      setLoading(false);
    };

    fetchRecipes();
  }, []);

  // Filter recipes based on search query
  useEffect(() => {
    const filtered = recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRecipes(filtered);
  }, [searchQuery, recipes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#faffec] pb-8">
      {/* Include Navbar at the top of the page */}
      <Navbar />
      
      <h1 className="text-3xl font-bold mt-6 mb-3">Simple and Tasty Recipes</h1>
      <h1 className="text-gray-500 text-lg w-3/4 text-center mb-6">Savor easy-to-make dishes that are full of flavor, perfect for every special moment.</h1>

      {/* Search bar for filtering recipes by name */}
      <input
        type="text"
        placeholder="Search recipes by name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-8 p-3 w-full max-w-lg border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d5300]"
      />

      {filteredRecipes.length === 0 ? (
        <p className="text-gray-600">No recipes found for "{searchQuery}".</p>
      ) : (
        // Grid container for cards with spacing between them
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}
