'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

export default function EditRecipePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('id');

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) return;

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) {
        console.error('Error fetching recipe:', error.message);
        return;
      }

      if (data) {
        setName(data.name);
        setDescription(data.description);
        setIngredients(data.ingredients.join('\n'));
        setSteps(data.steps.join('\n'));
        setImageUrl(data.image_url);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ingredientsArray = ingredients.split('\n').map((ingredient) => ingredient.trim());
    const stepsArray = steps.split('\n').map((step) => step.trim());

    let newImageUrl = imageUrl;

    // Fetch current user ID for ownership assignment
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      alert('You need to be logged in to update this recipe');
      router.push('/login');
      return;
    }

    if (imageFile) {
      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(`public/${recipeId}/${Date.now()}_${imageFile.name}`, imageFile, {
          cacheControl: '3600',
          upsert: true,
          metadata: { owner: userId } // Ensure that the owner is set
        });

      if (error) {
        console.error('Error uploading new image:', error.message);
        alert('Error uploading new image');
        return;
      }

      newImageUrl = data?.path ? supabase.storage.from('recipe-images').getPublicUrl(data.path).data.publicUrl : imageUrl;
    }

    const { error } = await supabase
      .from('recipes')
      .update({
        name,
        description,
        ingredients: ingredientsArray,
        steps: stepsArray,
        image_url: newImageUrl,
      })
      .eq('id', recipeId);

    if (error) {
      console.error('Error updating recipe:', error.message);
      alert('Error updating recipe');
    } else {
      router.push('/recipes/your-recipe');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Recipe</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Recipe Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Ingredients (one per line):</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="List each ingredient on a new line"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Steps (one per line):</label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="List each step on a new line"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Upload New Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-gray-700 p-2 border border-gray-300 rounded-lg"
            />
            {imageUrl && <img src={imageUrl} alt="Recipe Image" className="mt-4 w-full rounded-lg" />}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-500 focus:outline-none"
          >
            Update Recipe
          </button>
        </form>
      </div>
    </div>
  );
}
