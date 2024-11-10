"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function PostRecipePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // For loading state
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // For error message display
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null); // Reset any previous errors

    // Split ingredients and steps into arrays
    const ingredientsArray = ingredients
      .split("\n")
      .map((ingredient) => ingredient.trim());
    const stepsArray = steps.split("\n").map((step) => step.trim());

    // Get user ID from session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    const userRole = session?.user?.role; // Check the role of the authenticated user

    if (!userId || userRole !== "authenticated") {
      setLoading(false);
      setErrorMessage("You need to be logged in to post a recipe");
      return;
    }

    // Upload image to Supabase Storage (if an image is selected)
    let imageUrl = null;
    if (imageFile) {
      const { data, error } = await supabase.storage
        .from("recipe-images")
        .upload(`public/${userId}/${Date.now()}_${imageFile.name}`, imageFile);

      if (error) {
        setLoading(false);
        setErrorMessage(`Error uploading image: ${error.message}`);
        console.error("Error uploading image:", error.message);
        return;
      }

      imageUrl = data?.path
        ? supabase.storage.from("recipe-images").getPublicUrl(data.path).data
            .publicUrl
        : null;
    }

    // Insert the new recipe into the database
    const { error } = await supabase.from("recipes").insert([
      {
        user_id: userId, // Make sure the user_id is correctly set to the logged-in user's ID
        name,
        description,
        ingredients: ingredientsArray,
        steps: stepsArray,
        image_url: imageUrl, // Add image URL if uploaded
      },
    ]);

    if (error) {
      setLoading(false);
      setErrorMessage(`Error posting recipe: ${error.message}`);
      console.error("Error posting recipe:", error.message);
    } else {
      setLoading(false);
      router.push("/"); // Redirect to homepage or recipe list after posting
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Post a New Recipe
        </h1>
        {errorMessage && (
          <p className="text-red-600 text-center mb-4">{errorMessage}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipe Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Recipe Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Ingredients (one per line):
            </label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="List each ingredient on a new line"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Steps (one per line):
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="List each step on a new line"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Image:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageFile(e.target.files ? e.target.files[0] : null)
              }
              className="w-full text-gray-700 p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-500 focus:outline-none"
          >
            {loading ? "Posting Recipe..." : "Post Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}
