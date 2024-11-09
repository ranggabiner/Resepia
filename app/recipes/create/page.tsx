'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function PostRecipePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Split ingredients and steps into arrays by line
    const ingredientsArray = ingredients.split('\n').map(ingredient => ingredient.trim());
    const stepsArray = steps.split('\n').map(step => step.trim());

    // Get the user ID from the current session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      alert('You need to be logged in to post a recipe');
      return;
    }

    // Insert the new recipe into the database
    const { error } = await supabase
      .from('recipes')
      .insert([
        {
          user_id: userId,
          name,
          description,
          ingredients: ingredientsArray,
          steps: stepsArray,
        },
      ]);

    if (error) {
      console.error('Error posting recipe:', error.message);
      alert('Error posting recipe');
    } else {
      // Redirect to homepage or recipe list after posting
      router.push('/');
    }
  };

  return (
    <div>
      <h1>Post a New Recipe</h1>
      <form onSubmit={handleSubmit}>
        {/* Recipe Name */}
        <label>
          Recipe Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        {/* Description */}
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        {/* Ingredients */}
        <label>
          Ingredients (one per line):
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="List each ingredient on a new line"
            required
          />
        </label>

        {/* Steps */}
        <label>
          Steps (one per line):
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="List each step on a new line"
            required
          />
        </label>

        {/* Submit Button */}
        <button type="submit">Post Recipe</button>
      </form>
    </div>
  );
}
