'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = useParams(); // Recipe ID from URL params
  const [recipe, setRecipe] = useState<any | null>(null);
  const [existingReview, setExistingReview] = useState<any | null>(null); // User's own review, if it exists
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null); // Logged-in user ID
  const [copySuccess, setCopySuccess] = useState<string | null>(null); // To show feedback for copy action

  // Fetch the logged-in user's session and recipe details
  const fetchRecipeDetails = async () => {
    try {
      setLoading(true);

      // Fetch session data to identify the logged-in user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) {
        setError("User is not logged in");
        setLoading(false);
        return;
      }
      setCurrentUser(userId);

      // Fetch the recipe details by recipe ID
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select(`*, profiles:user_id (username, first_name, last_name)`)
        .eq("id", id)
        .single();

      if (recipeError) {
        throw new Error("Error fetching recipe details: " + recipeError.message);
      }

      setRecipe(recipeData);

      // Fetch the user's own review for this recipe
      const { data: userReview, error: reviewError } = await supabase
        .from("recipe_ratings")
        .select("rating, review")
        .eq("recipe_id", id)
        .eq("user_id", userId) // Filter by logged-in user ID
        .single(); // Expect only one review per user per recipe

      if (reviewError) {
        setExistingReview(null); // No review by this user
      } else {
        setExistingReview(userReview); // Set the user's review, if it exists
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Function to copy the recipe link to the clipboard
  const copyLinkToClipboard = () => {
    const recipeUrl = `${window.location.origin}/recipes/${id}`;
    navigator.clipboard.writeText(recipeUrl).then(() => {
      setCopySuccess("Link copied to clipboard!");
      setTimeout(() => setCopySuccess(null), 3000); // Clear success message after 3 seconds
    }).catch((err) => {
      console.error("Failed to copy link: ", err);
      setCopySuccess("Failed to copy link.");
    });
  };

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;

  // Split ingredients if stored as a single string
  const ingredientsList = Array.isArray(recipe?.ingredients)
    ? recipe?.ingredients
    : typeof recipe?.ingredients === 'string'
    ? recipe?.ingredients.split("\n")
    : [];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6">{recipe?.name}</h1>
      <p className="text-gray-600">{recipe?.description}</p>

      {/* Copy Link Button */}
      <div className="mt-4 flex items-center space-x-2">
        <button
          onClick={copyLinkToClipboard}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500 focus:outline-none"
        >
          Copy Link
        </button>
        {copySuccess && <span className="text-green-600">{copySuccess}</span>}
      </div>

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
