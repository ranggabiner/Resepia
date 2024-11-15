// components/pages/RecipeDetailPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import ChatBot from '../../components/ChatBot'; 
import LoadingCircle from "../../components/LoadingCircle";

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(
    null
  );
  const [userReview, setUserReview] = useState<any | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchRecipeDetails = async () => {
    try {
      setLoading(true);

      // Fetch the current user session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);

      const userId = session?.user?.id;
      setCurrentUser(userId);

      // Fetch the current user's profile
      const { data: userProfileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, username")
        .eq("user_id", userId)
        .limit(1)
        .single();
      if (profileError) throw new Error(profileError.message);
      setCurrentUserProfile(userProfileData);

      // Fetch the recipe data
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select(`*, profiles:user_id (username, first_name, last_name)`)
        .eq("id", id)
        .limit(1);
      if (recipeError || !recipeData || recipeData.length === 0) {
        throw new Error("Recipe not found");
      }
      setRecipe(recipeData[0]);

      // Fetch comments for the recipe
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(`*, profiles (username, first_name, last_name)`)
        .eq("recipe_id", id)
        .order("created_at", { ascending: false });

      if (commentsError) throw new Error(commentsError.message);
      setComments(commentsData || []);

      // Fetch user's review for the recipe
      const { data: userReviewData, error: reviewError } = await supabase
        .from("recipe_ratings")
        .select("*")
        .eq("user_id", userId)
        .eq("recipe_id", id)
        .limit(1);
      if (reviewError) throw new Error(reviewError.message);
      setUserReview(
        userReviewData && userReviewData.length > 0 ? userReviewData[0] : null
      );
    } catch (error) {
      const errorMessage =
        (error as Error).message || "An unexpected error occurred";
      setError(errorMessage);
      console.error("Fetch error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUser) {
      setError("You must be logged in to comment.");
      return;
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        user_id: currentUser,
        recipe_id: id,
        content: newComment,
      })
      .select();

    if (error) {
      setError("Failed to add comment: " + error.message);
      return;
    }

    if (data && Array.isArray(data) && data.length > 0) {
      const newCommentData = {
        ...data[0],
        profiles: currentUserProfile || {
          username: "Unknown",
          first_name: "",
          last_name: "",
        },
      };
      setComments([newCommentData, ...comments]);
    }

    setNewComment("");
  };

  useEffect(() => {
    fetchRecipeDetails();

    const commentSubscription = supabase
      .channel(`public:comments`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `recipe_id=eq.${id}`,
        },
        (payload: { new: any }) => {
          setComments((prevComments) => [payload.new, ...prevComments]);
        }
      )
      .subscribe();

    return () => {
      commentSubscription.unsubscribe().catch((unsubError) => {
        console.error("Error unsubscribing:", unsubError);
      });
    };
  }, [id]);

  if (loading) {
    return <LoadingCircle />; // Menggunakan komponen LoadingCircle
  }

  if (error) return <p>Error: {error}</p>;

  const ingredientsList = Array.isArray(recipe?.ingredients)
    ? recipe.ingredients
    : [];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-4">{recipe?.name}</h1>
      {recipe?.image_url && (
        <img
          src={recipe.image_url}
          alt={`${recipe.name} image`}
          className="w-full h-64 object-cover rounded-md mb-4"
        />
      )}
      <p className="text-gray-600 mb-6">{recipe?.description}</p>

      {/* Recipe Details */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc pl-5 text-gray-700">
          {ingredientsList.map((ingredient: string, index: number) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mt-4 mb-2">Steps</h2>
        <ul className="list-disc pl-5 text-gray-700">
          {Array.isArray(recipe?.steps) &&
            recipe.steps.map((step: string, index: number) => (
              <li key={index}>{step}</li>
            ))}
        </ul>
      </div>

      {/* Button to Rate & Review or Edit Review */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Rate and Review</h2>
        {userReview ? (
          <button
            onClick={() => router.push(`/recipes/${id}/edit-review`)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500"
          >
            Edit Review
          </button>
        ) : (
          <button
            onClick={() => router.push(`/recipes/${id}/rate-review`)}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-500"
          >
            Add Review
          </button>
        )}
      </div>

      {/* Comment Section at the Bottom */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>

        {/* New Comment Input */}
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border rounded-md focus:outline-none"
          ></textarea>
          <button
            onClick={handleAddComment}
            className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500"
          >
            Add Comment
          </button>
        </div>

        {/* Display Comments */}
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-200 py-4">
            <div className="flex items-center space-x-3">
              <p className="font-semibold">
                {comment.profiles?.first_name} {comment.profiles?.last_name}
              </p>
              <span className="text-gray-500">
                {comment.profiles?.username}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2">{comment.content}</p>
          </div>
        ))}
      </div>
             
      {/* Add ChatBot button and component */} 
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors"
      >
        {isChatOpen ? (
          <span className="text-xl">✕</span>
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>
      
      <ChatBot 
      isOpen={isChatOpen} 
      onClose={() => setIsChatOpen(false)}
      recipeContext={{
        name: recipe?.name,
        description: recipe?.description,
        ingredients: recipe?.ingredients,
        steps: recipe?.steps
      }}
    />
      </div>
  );
}
