'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

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
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-8">
      <h1 className="text-3xl font-bold mb-6">All Recipes</h1>
      
      {/* Search bar for filtering recipes by name */}
      <input
        type="text"
        placeholder="Search recipes by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 p-3 w-full max-w-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
      />

      {filteredRecipes.length === 0 ? (
        <p className="text-gray-600">No recipes found for "{searchQuery}".</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`bg-white rounded-lg shadow-md p-6 flex flex-col items-start ${recipe.user_id === currentUser ? 'border border-indigo-600' : ''}`}
            >
              <h2 className="text-xl font-semibold mb-2">{recipe.name}</h2>
              <p className="text-gray-700 mb-4">{recipe.description}</p>

              {/* Display the recipe image */}
              {recipe.image_url && (
                <div className="w-48 h-48 overflow-hidden mb-4 rounded-lg flex justify-center items-center">
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* Display the creator's name */}
              {recipe.profiles && (
                <p className="text-sm text-gray-500 mb-2">
                  Created by: <span className="font-semibold">{recipe.profiles.username || `${recipe.profiles.first_name} ${recipe.profiles.last_name}`}</span>
                </p>
              )}

              <button
                onClick={() => router.push(`/recipes/${recipe.id}`)}
                className="mt-auto bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-500 focus:outline-none"
              >
                View Recipe
              </button>

              {/* Display 'Your Recipe' tag if the recipe belongs to the logged-in user */}
              {recipe.user_id === currentUser && (
                <span className="mt-2 text-indigo-600 font-semibold">Your Recipe</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
