'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = useParams(); // Ambil ID resep dari query parameter URL
  const [recipe, setRecipe] = useState<any | null>(null);
  const [existingReview, setExistingReview] = useState<any | null>(null); // Untuk data rating dan review yang sudah ada
  const [loading, setLoading] = useState(true); // Untuk menandakan bahwa data sedang dimuat
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState<boolean>(true); // Menambahkan status validasi

  // Ambil detail resep dan cek review pengguna
  const fetchRecipeDetails = async () => {
    if (!id) {
      setError("Recipe ID is missing");
      setLoading(false);
      setValidating(false); // Validasi selesai
      return;
    }

    setLoading(true);

    try {
      // Ambil detail resep berdasarkan ID
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select(`*, profiles:user_id (username, first_name, last_name)`)
        .eq("id", id)
        .single();

      if (recipeError) {
        throw new Error("Error fetching recipe details: " + recipeError.message);
      }

      setRecipe(recipeData);

      // Cek apakah sudah ada rating dan review oleh pengguna
      const { data: reviewData, error: reviewError } = await supabase
        .from("recipe_ratings")
        .select("rating, review")
        .eq("recipe_id", id)
        .single();  // Ambil hanya satu data review

      if (reviewError) {
        setExistingReview(null); // Tidak ada review
      } else {
        setExistingReview(reviewData);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
      setValidating(false); // Validasi selesai
    }
  };

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  // Jika masih dalam proses validasi atau loading, tampilkan loading spinner
  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Check if ingredients is a string and split it if possible
  const ingredientsList = Array.isArray(recipe?.ingredients)
    ? recipe?.ingredients
    : typeof recipe?.ingredients === 'string'
    ? recipe?.ingredients.split("\n")
    : [];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6">{recipe?.name}</h1>
      <p className="text-gray-600">{recipe?.description}</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc pl-5">
          {ingredientsList.map((ingredient: string, index: number) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      {/* Rating and Review Section */}
      {existingReview ? (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Your Review</h3>
          <p><strong>Rating: </strong>{existingReview?.rating}</p>
          <p><strong>Review: </strong>{existingReview?.review}</p>
          <button
            onClick={() => router.push(`/recipes/${id}/edit-review`)}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md"
          >
            Edit Review
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <button
            onClick={() => router.push(`/recipes/${id}/rate-review`)}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md"
          >
            Rate and Review
          </button>
        </div>
      )}
    </div>
  );
}
