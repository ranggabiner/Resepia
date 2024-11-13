'use client';

import { useRouter } from 'next/navigation';

interface RecipeCardProps {
  recipe: any;
  currentUser: string | null;
}

export default function RecipeCard({ recipe, currentUser }: RecipeCardProps) {
  const router = useRouter();

  // Function to handle card click
  const handleCardClick = () => {
    router.push(`/recipes/${recipe.id}`);
  };

  return (
    <div
      key={recipe.id}
      onClick={handleCardClick} // Add click functionality to the card
      className="w-full sm:w-[350px] lg:w-[350px] h-[434px] relative bg-white rounded-[30px] cursor-pointer shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl"
    >
      {/* Recipe Image - Top section */}
      {recipe.image_url && (
        <div className="w-full h-[250px] overflow-hidden rounded-t-[30px]">
          <img
            className="object-cover w-full h-full"
            src={recipe.image_url}
            alt={recipe.name}
          />
        </div>
      )}

      {/* "Your Recipe" Label - above the image */}
      {recipe.user_id === currentUser && (
        <div className="absolute top-4 right-4 w-[110px] h-10 px-1.5 pt-[7.50px] pb-[8.50px] bg-[#cca4a4]/75 rounded-lg justify-center items-center inline-flex">
          <div className="justify-center items-center gap-2 inline-flex">
            <div className="text-center text-white text-base font-bold">
              Your Recipe
            </div>
          </div>
        </div>
      )}

      {/* Recipe Name - Big text below the image */}
      <h2 className="text-black text-2xl font-semibold font-['Inter'] px-4 pt-4">
        {recipe.name}
      </h2>

      {/* Recipe Creator - Creator's Name */}
      {recipe.profiles && (
        <p className="text-gray-500 text-sm font-medium font-['Inter'] px-4">
          by {recipe.profiles.username || `${recipe.profiles.first_name} ${recipe.profiles.last_name}`}
        </p>
      )}

      {/* Recipe Description - Limit to 2 lines with ellipsis */}
      <p className="text-gray-700 px-4 line-clamp-2 text-sm pt-2 pb-4">
        {recipe.description}
      </p>
    </div>
  );
}
