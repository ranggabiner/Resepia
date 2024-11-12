// EditReviewPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import LoadingCircle from "../../../components/LoadingCircle"; // Import LoadingCircle component

export default function EditReviewPage() {
  const router = useRouter();
  const { id } = useParams();
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [existingReview, setExistingReview] = useState<any | null>(null);
  const [validating, setValidating] = useState<boolean>(true); // State untuk validasi

  useEffect(() => {
    const fetchExistingReview = async () => {
      try {
        // Ambil data user yang sedang login
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("You must be logged in to edit a review.");
          setValidating(false); // Validasi selesai
          return;
        }

        // Cek apakah ada review untuk resep ini dari user yang sedang login
        const { data: reviewData, error: reviewError } = await supabase
          .from("recipe_ratings")
          .select("rating, review")
          .eq("user_id", user.id)
          .eq("recipe_id", id)
          .single();

        if (reviewError) {
          setError("Error fetching your review.");
          setValidating(false); // Validasi selesai
          return;
        }

        if (reviewData) {
          setExistingReview(reviewData); // Menyimpan data review yang ada
          setRating(reviewData.rating);
          setReview(reviewData.review);
        } else {
          setError("You haven't reviewed this recipe yet.");
        }

        setValidating(false); // Validasi selesai
      } catch (err) {
        setError("An error occurred while fetching your review.");
        setValidating(false); // Validasi selesai
      }
    };

    fetchExistingReview();
  }, [id]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!rating) {
      setError("Please provide a rating.");
      setLoading(false);
      return;
    }

    if (review.length < 10) {
      setError("Review must be at least 10 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Ambil data user yang sedang login
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in to submit a review.");
        setLoading(false);
        return;
      }

      // Update review jika sudah ada
      const { data, error } = await supabase
        .from("recipe_ratings")
        .update({ rating, review })
        .eq("user_id", user.id)
        .eq("recipe_id", id);

      if (error) {
        setError("Error saving your review.");
        setLoading(false);
        return;
      }

      router.push(`/recipes/${id}`); // Redirect ke halaman resep
    } catch (error) {
      setError("Error saving review.");
      setLoading(false);
    }
  };

  // Jika validasi masih berlangsung, tampilkan komponen LoadingCircle
  if (validating) {
    return <LoadingCircle />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6">Edit Review</h1>

      {error && <p className="text-red-500">{error}</p>}

      {existingReview ? (
        <div>
          <div className="mt-4">
            <label className="text-lg">Rating (1 - 5):</label>
            <select
              value={rating ?? ""}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full mt-2 p-2 border border-gray-300 rounded"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="text-lg">Review:</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded"
              rows={4}
            ></textarea>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Review"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <p>You haven't reviewed this recipe yet.</p>
          <button
            onClick={() => router.push(`/recipes/${id}`)} 
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg"
          >
            Give Your Review
          </button>
        </div>
      )}
    </div>
  );
}
