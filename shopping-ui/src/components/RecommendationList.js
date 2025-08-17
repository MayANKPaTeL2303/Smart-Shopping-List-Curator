import React, { useState } from "react";

const getNumericPrice = (priceString) => {
  const num = parseFloat(priceString.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? Infinity : num;
};

function RecommendationList({ recommendations, mode = "shopping" }) {
  const [sortBy, setSortBy] = useState("asc");
  const [viewMode, setViewMode] = useState("grid");

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const sortedRecommendations = recommendations.map((group) => {
    const sortedItems = [...group.items].sort((a, b) => {
      const priceA = getNumericPrice(a.price);
      const priceB = getNumericPrice(b.price);
      return sortBy === "asc" ? priceA - priceB : priceB - priceA;
    });

    return {
      category: group.category,
      items: sortedItems,
    };
  });

  const handleAddToCart = (item) => {
    // You can replace this with your cart logic
    alert(`🛒 Added "${item.name}" to cart!`);
  };

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {mode === "recipe" ? "🥘 Recipe Ingredients" : "✨ Smart Recommendations"}
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === "recipe" 
              ? "Curated ingredients with quantities for your recipe"
              : "Curated products based on your shopping list"
            }
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="asc">Price: Low → High</option>
              <option value="desc">Price: High → Low</option>
            </select>
          </div>

          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="border-2 border-indigo-200 text-indigo-600 rounded-lg px-4 py-2 text-sm hover:bg-indigo-500 hover:text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            {viewMode === "grid" ? "📋 List View" : "🔲 Grid View"}
          </button>
        </div>
      </div>

      {sortedRecommendations.map((group, idx) => (
        <div key={idx} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
            <h3 className="text-2xl font-bold text-gray-800">
              {group.category}
            </h3>
          </div>

          <div className={`${
            viewMode === "grid" 
              ? "flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scroll-smooth"
              : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {group.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className={`bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-indigo-200 ${
                  viewMode === "grid" ? "min-w-[240px] w-[240px] flex-shrink-0" : "w-full"
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-grow">
                    {mode === "recipe" && (item.quantity || item.unit) && (
                      <div className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block">
                        {item.quantity && item.unit ? `${item.quantity} ${item.unit}` : 
                         item.quantity ? `${item.quantity}` : 
                         item.unit ? item.unit : ''}
                      </div>
                    )}
                    
                    <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{item.name}</h4>
                    
                    {item.brand && (
                      <p className="text-sm text-indigo-600 font-medium mb-2">{item.brand}</p>
                    )}
                    
                    {item.price && (
                      <p className="text-2xl font-bold text-emerald-600 mb-3">{item.price}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-yellow-400 text-sm">
                        {renderStars(item.rating || Math.floor(Math.random() * 2) + 4)}
                      </div>
                      <span className="text-gray-500 text-xs">
                        ({Math.floor(Math.random() * 90) + 10})
                      </span>
                    </div>
                    
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full"
                  >
                    {mode === "recipe" ? "🛒 Add Ingredient" : "🛒 Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {mode === "recipe" && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Shopping Tips for Recipe Mode</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Check your pantry for items you might already have</li>
                <li>• Consider buying in bulk for frequently used ingredients</li>
                <li>• Look for store brands to save money on basic ingredients</li>
                <li>• Fresh ingredients like herbs can often be substituted with dried versions</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderStars(rating = 4) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    );
  }
  return stars;
}

export default RecommendationList;