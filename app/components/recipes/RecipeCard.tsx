'use client';

import { useRouter } from 'next/navigation';

interface RecipeCardProps {
  recipe: any;
  currentUser: string | null;
}

export default function RecipeCard({ recipe, currentUser }: RecipeCardProps) {
  const router = useRouter();

  // Fungsi untuk menangani klik pada card
  const handleCardClick = () => {
    router.push(`/recipes/${recipe.id}`);
  };

  return (
    <div
      key={recipe.id}
      onClick={handleCardClick} // Menambahkan fungsi klik pada card
      className="w-full sm:w-[350px] lg:w-[350px] h-[434px] relative bg-white rounded-[30px] cursor-pointer shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl"
    >
      {/* Gambar Resep - Di paling atas */}
      {recipe.image_url && (
        <div className="w-full h-[250px] overflow-hidden rounded-t-[30px]">
          <img
            className="object-cover w-full h-full"
            src={recipe.image_url}
            alt={recipe.name}
          />
        </div>
      )}

      {/* Label "Your Recipe" - di atas gambar */}
      {recipe.user_id === currentUser && (
        <div className="absolute top-4 right-4 w-[110px] h-10 px-1.5 pt-[7.50px] pb-[8.50px] bg-[#3d5300]/75 rounded-lg justify-center items-center inline-flex">
          <div className="justify-center items-center gap-2 inline-flex">
            <div className="text-center text-white text-base font-bold">
              Your Recipe
            </div>
          </div>
        </div>
      )}

      {/* Nama Resep - Teks besar di bawah gambar */}
      <h2 className="text-black text-2xl font-semibold font-['Inter'] px-4 pt-4">
        {recipe.name}
      </h2>

      {/* Pembuat Resep - Nama Pembuat */}
      {recipe.profiles && (
        <p className="text-gray-500 text-sm font-medium font-['Inter'] px-4">
          by @{recipe.profiles.username || `${recipe.profiles.first_name} ${recipe.profiles.last_name}`}
        </p>
      )}

      {/* Deskripsi Resep - Membatasi hanya dua baris */}
      <p className="text-gray-700 px-4 line-clamp-2 text-sm pt-2 pb-4">
        {recipe.description}
      </p>
    </div>
  );
}
