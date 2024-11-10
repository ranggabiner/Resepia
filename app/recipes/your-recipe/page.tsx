'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function UserRecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserRecipes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        alert('You need to be logged in to view your recipes');
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user recipes:', error.message);
        alert('Error fetching recipes');
        return;
      }

      setRecipes(data || []);
    };

    fetchUserRecipes();
  }, [router]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-8">
      <h1 className="text-3xl font-bold mb-6">My Recipes</h1>
      {recipes.length === 0 ? (
        <p className="text-gray-600">You haven't created any recipes yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start">
              <h2 className="text-xl font-semibold mb-2">{recipe.name}</h2>
              <p className="text-gray-700 mb-4">{recipe.description}</p>

              {/* Wrap the image in a div with controlled width and height */}
              {recipe.image_url && (
                <div className="w-48 h-48 overflow-hidden mb-4 rounded-lg flex justify-center items-center">
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              
              <button
                onClick={() => router.push(`/recipes/your-recipe/edit?id=${recipe.id}`)}
                className="mt-auto bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-500 focus:outline-none"
              >
                Edit Recipe
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
