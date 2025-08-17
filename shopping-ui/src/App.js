import React, { useState } from "react";
import axios from "axios";
import useVoiceTyping from "./components/useVoiceTyping";
import UploadImageButton from "./components/UploadImageButton";
import RecommendationList from "./components/RecommendationList";

function App() {
  const [mode, setMode] = useState("shopping"); // "shopping" or "recipe"
  const [inputText, setInputText] = useState("");
  const [recipeInput, setRecipeInput] = useState("");
  const [servings, setServings] = useState(4);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVoiceTextUpdate = (text) => {
    if (mode === "shopping") {
      setInputText(text);
    } else {
      setRecipeInput(text);
    }
  };

  const {
    isListening,
    error: voiceError,
    toggleListening,
  } = useVoiceTyping(handleVoiceTextUpdate);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setInputText("");
    setRecipeInput("");
    setUploadedImage(null);
    setRecipeIngredients([]);
    setRecommendations([]);
    setErrorMsg("");
  };

  const fetchRecipeIngredients = async (recipeName, servingsCount) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/get-recipe-ingredients/",
        {
          recipe_name: recipeName,
          servings: servingsCount,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data && response.data.ingredients) {
        // If it's a string like "pasta|1/2|pound, olive oil|2|tablespoons..."
        const rawIngredients = response.data.ingredients;

        // If backend already sends array, return directly
        if (Array.isArray(rawIngredients)) {
          return rawIngredients;
        }

        // Otherwise parse the string
        return rawIngredients.split(",").map((item) => {
          const parts = item.trim().split("|");
          return {
            name: parts[0] || "",
            quantity: parts[1] || "",
            unit: parts[2] || "",
          };
        });
      }

      return [];
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (mode === "recipe" && recipeInput.trim()) {
        const ingredients = await fetchRecipeIngredients(recipeInput, servings);
        setRecipeIngredients(ingredients);
        console.log("get the recipe ingredient");

        // console.log(recipeIngredients);
      }

      const formData = new FormData();

      if (mode === "recipe") {
        formData.append("mode", "recipe");
        formData.append("recipe_name", recipeInput);
        formData.append("servings", servings);
      } else {
        formData.append("mode", "shopping");
        formData.append("items", inputText);
      }

      if (uploadedImage) {
        formData.append("image", uploadedImage);
      }

      const res = await axios.post("http://127.0.0.1:8000/process/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && Array.isArray(res.data.items)) {
        const withImages = res.data.items.map((item) => ({
          category: item.name,
          items: item.recommendations.map((rec) => ({
            name: rec.name,
            price: rec.price,
            link: rec.link,
            quantity: rec.quantity || null, // For recipe mode
            unit: rec.unit || null, // For recipe mode
          })),
        }));
        setRecommendations(withImages);
      } else {
        setErrorMsg("Invalid response from server.");
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setErrorMsg("Failed to fetch recommendations. Please try again.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const currentInput = mode === "recipe" ? recipeInput : inputText;
  // const setCurrentInput = mode === "recipe" ? setRecipeInput : setInputText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl text-white">
              {mode === "recipe" ? "👨‍🍳" : "🛒"}
            </span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Smart Shopping Assistant
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === "recipe"
              ? "Get ingredient lists with quantities for any recipe"
              : "AI-powered shopping list curator with intelligent recommendations"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => handleModeSwitch("shopping")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                mode === "shopping"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              Shopping Mode
            </button>
            <button
              onClick={() => handleModeSwitch("recipe")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                mode === "recipe"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              Recipe Mode
            </button>
          </div>
        </div>

        {mode === "shopping" ? (
          <div>
            <label
              htmlFor="itemsInput"
              className="block text-gray-700 font-semibold mb-2"
            >
              Enter items or use voice:
            </label>

            <textarea
              id="itemsInput"
              rows="4"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. milk, rice, shampoo, or describe what you need..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4 bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor="recipeInput"
              className="block text-gray-700 font-semibold mb-2"
            >
              Enter recipe name or use voice:
            </label>

            <div className="flex gap-4 mb-4">
              <input
                id="recipeInput"
                type="text"
                value={recipeInput}
                onChange={(e) => setRecipeInput(e.target.value)}
                placeholder="e.g. Chicken Tikka Masala, Chocolate Chip Cookies..."
                className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
              />

              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4">
                <label
                  htmlFor="servings"
                  className="text-gray-700 font-semibold whitespace-nowrap"
                >
                  Servings:
                </label>
                <input
                  id="servings"
                  type="number"
                  min="1"
                  max="20"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                  className="w-16 text-center border-0 bg-transparent focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Voice Listening Status */}
        {isListening && (
          <div className="text-green-600 text-sm mb-2 flex items-center animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Listening... Speak now
          </div>
        )}

        {/* Voice Error */}
        {voiceError && (
          <div className="text-red-600 bg-red-100 border border-red-300 p-2 rounded text-sm mb-4">
            {voiceError}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-4">
          <button
            type="button"
            onClick={toggleListening}
            className={`px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isListening
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            }`}
          >
            {isListening ? "🛑 Stop Listening" : "🎤 Start Speaking"}
          </button>

          {mode === "shopping" && (
            <UploadImageButton setUploadedImage={setUploadedImage} />
          )}

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || (!currentInput.trim() && !uploadedImage)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
          >
            {loading
              ? "🔄 Processing..."
              : mode === "recipe"
              ? "🍳 Get Ingredients"
              : "✨ Get Recommendations"}
          </button>
        </div>

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <div className="relative inline-block mt-4">
            <img
              src={URL.createObjectURL(uploadedImage)}
              alt="Preview"
              className="max-w-xs rounded shadow-md mb-4"
            />
            <button
              onClick={() => setUploadedImage(null)}
              title="Remove image"
              className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded-full hover:bg-opacity-80"
            >
              ❌
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="text-red-600 font-semibold text-center mb-4 p-3 bg-red-100 border border-red-300 rounded">
            {errorMsg}
          </div>
        )}

        {/* Recipe Info Display with Ingredients List */}
        {mode === "recipe" && recipeIngredients.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-orange-800">
                Recipe: {recipeInput}
              </h3>
            </div>
            <p className="text-orange-700 mb-4 text-lg">
              Ingredients for {servings} serving{servings !== 1 ? "s" : ""}:
            </p>

            {/* Ingredients List */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipeIngredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-md border border-orange-200 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200"
                >
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {ingredient.display || ingredient.name}
                  </h4>
                  {(ingredient.quantity || ingredient.unit) && (
                    <p className="text-orange-600 text-xs font-medium mt-1">
                      {ingredient.quantity} {ingredient.unit}
                    </p>
                  )}
                  {ingredient.category && (
                    <span className="inline-block mt-2 text-[10px] px-2 py-1 rounded-full bg-orange-100 text-gray-600">
                      {ingredient.category}
                    </span>
                  )}
                </div>
              ))}
            </div> */}

            {/* Total Count */}
            {/* <div className="mt-4 pt-3 border-t border-orange-200">
              <p className="text-orange-700 font-semibold text-sm">
                Total: {recipeIngredients.length} ingredient
                {recipeIngredients.length !== 1 ? "s" : ""}
              </p>
            </div> */}
          </div>
        )}

        {/* Output List */}
        <RecommendationList recommendations={recommendations} mode={mode} />
      </div>
    </div>
  );
}

export default App;
