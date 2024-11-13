"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import LoadingCircle from "../../../components/LoadingCircle"; // Import LoadingCircle component

export default function RateReviewPage() {
  const router = useRouter();
  const { id } = useParams(); // Ambil ID resep dari URL
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>(""); 
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [existingReview, setExistingReview] = useState<any | null>(null); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(true); // Menandakan proses validasi sedang berjalan

  useEffect(() => {
    const checkReview = async () => {
      // Pertama, pastikan user login
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("You must be logged in to rate and review.");
        setValidating(false); // Validasi selesai
        return;
      }

      setCurrentUser(session.user);

      // Cek apakah sudah ada review dari user untuk resep ini
      const { data: reviewData, error: reviewError } = await supabase
        .from("recipe_ratings")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("recipe_id", id)
        .single();

      if (reviewError) {
        setExistingReview(null); // Tidak ada review
      } else {
        setExistingReview(reviewData); // Jika sudah ada review
      }

      setValidating(false); // Validasi selesai
    };

    checkReview();
  }, [id]);

  // Jika sedang dalam proses validasi, tampilkan loading menggunakan komponen LoadingCircle
  if (validating) {
    return <LoadingCircle />;
  }

  // Jika sudah ada review, tampilkan pesan
  if (existingReview) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
        <h1 className="text-3xl font-bold mb-6">You have already reviewed this recipe</h1>
        <p className="text-lg text-gray-600">You have already submitted a review for this recipe.</p>
        <div className="mt-4">
          <button
            onClick={() => router.push(`/recipes/${id}`)} 
            className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-500"
          >
            Edit Review
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Validasi rating dan review
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
      const { data, error } = await supabase
        .from("recipe_ratings")
        .upsert({
          user_id: currentUser.id,
          recipe_id: id,
          rating,
          review,
        });

      if (error) {
        setError("Error saving review.");
        setLoading(false);
        return;
      }

      // Tidak perlu redirect, cukup tampilkan pesan sukses jika diperlukan
      setError("Review successfully submitted.");
      setLoading(false);
    } catch (error) {
      setError("Error saving rating and review.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6">Rate and Review Recipe</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Form untuk memberikan review */}
      <div className="mt-4">
        <label className="text-lg">Rating (1 - 5):</label>
        <select
          value={rating ?? ""}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full mt-2 p-2 border border-gray-300 rounded"
        >
          <option value="" disabled>Select Rating</option>
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
          {loading ? "Submitting..." : "Submit Rating and Review"}
        </button>
      </div>
    </div>
  );
}
