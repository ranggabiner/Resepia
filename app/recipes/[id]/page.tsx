'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = useParams(); // Ambil ID resep dari query parameter URL
  const [recipe, setRecipe] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!id) return;

      setLoading(true);

      // Ambil detail resep berdasarkan ID
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles:user_id (
            username,
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        setError('Error fetching recipe details');
        console.error(error);
      } else {
        setRecipe(data);
      }

      setLoading(false);
    };

    fetchRecipeDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!recipe) return <p>Recipe not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6">{recipe.name}</h1>
      <p className="text-gray-700 mb-4">{recipe.description}</p>

      {recipe.image_url && (
        <div className="w-full h-64 overflow-hidden mb-4 rounded-lg flex justify-center items-center">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <p className="text-sm text-gray-500 mb-2">
        Created by: <span className="font-semibold">{recipe.profiles.username || `${recipe.profiles.first_name} ${recipe.profiles.last_name}`}</span>
      </p>

      <div className="mt-4">
        <h2 className="text-2xl font-semibold">Ingredients</h2>
        <ul className="list-disc pl-6">
          {recipe.ingredients?.map((ingredient: string, index: number) => (
            <li key={index} className="text-gray-700">{ingredient}</li>
          ))}
        </ul>
      </div>

      {/* Tampilkan langkah-langkah instruksi */}
      <div className="mt-4">
        <h2 className="text-2xl font-semibold">Instructions</h2>
        {recipe.steps && recipe.steps.length > 0 ? (
          <ol className="list-decimal pl-6">
            {recipe.steps.map((step: string, index: number) => (
              <li key={index} className="text-gray-700">{step}</li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-500">No instructions available.</p>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={() => router.push('/recipes')}
          className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-500 focus:outline-none"
        >
          Back to Recipes
        </button>
      </div>
    </div>
  );
}
