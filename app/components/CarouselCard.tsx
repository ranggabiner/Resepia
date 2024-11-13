'use client';

export default function CarouselCard() {
  return (
    <div className="w-full bg-[#FFE6E6] py-8">
      {/* Card Container */}
      <div className="max-w-[1000px] mx-auto bg-[#cdffff] rounded-lg shadow-lg flex flex-col lg:flex-row-reverse items-center justify-between space-y-6 lg:space-y-0">
        
        {/* Right Column: Image Container */}
        <div className="w-full lg:w-1/2 h-full overflow-hidden rounded-tr-lg rounded-br-lg">
          <img
            className="w-full h-full object-cover"
            src="/chicken-wings.svg"
            alt="Spicy Chicken Wings"
          />
        </div>

        {/* Left Column: Text and Info Container */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-4 px-4 py-16 relative">
          
          {/* Hot Recipe Label */}
          <div className="bg-[#a4cccc] text-white font-bold w-1/4 text-sm text-center sm:text-base rounded-full py-2 px-4 inline-block">
            Hot Recipe
          </div>

          {/* Text Content Wrapper */}
          <div className="flex flex-col space-y-4 mb-10">
            {/* Recipe Title */}
            <div className="text-black text-4xl sm:text-5xl font-semibold font-['Inter']">
              Spicy Delicious Chicken Wings
            </div>

            {/* Recipe Description */}
            <div className="text-black/60 text-lg sm:text-xl leading-7">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aenean commodo ligula eget dolor.
            </div>

            {/* Username and Category Labels */}
            <div className="flex gap-2">
              <div className="bg-black/5 text-sm sm:text-base rounded-full px-4 py-2 text-black/60">
                @achmf
              </div>
              <div className="bg-black/5 text-sm sm:text-base rounded-full px-4 py-2 text-black/60">
                Chicken
              </div>
            </div>
          </div>

          {/* Button Wrapper (Positioned at Bottom Right) */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-black text-white rounded-full py-3 px-8 text-sm sm:text-base font-semibold cursor-pointer hover:bg-black/80 transition-colors">
              View Recipes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
