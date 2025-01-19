import React, { useState, useRef } from 'react';
import { IonCard, IonCardHeader, IonCardTitle } from '@ionic/react';
import { FaInfoCircle, FaStar, FaSearch, FaSpinner } from 'react-icons/fa';
import temp from '../assets/temp.svg';
import { Link } from 'react-router-dom';
import customFetch from '../../../utils/customFetch';
import { toast } from 'react-toastify';
import Button from './Button';
import image from '../assets/cgnlg.png';
import drink from '../assets/healthy-drink.png'
import { UILoader } from '../Loaders/ui-loader';

const MainContent = ({ ingredients, isUserLoggedIn }) => {
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [loadingImages, setLoadingImages] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const [showSignupOverlay, setShowSignupOverlay] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  const requestQueue = useRef([]);
  const processingQueue = useRef(false);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    if (input) {
      setSuggestions(
        ingredients
          .filter((ingredient) =>
            ingredient.toLowerCase().includes(input.toLowerCase())
          )
          .slice(0, 10)
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (ingredient) => {
    if (selectedTags.length < 10 && !selectedTags.includes(ingredient)) {
      setSelectedTags([...selectedTags, ingredient]);
      setSearchInput('');
      setSuggestions([]);
    } else {
      toast.error('Select UNIQUE ingredients less than 5');
    }
  };

  const removeTag = (ingredient) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== ingredient));
  };

  const handleSearchClick = async () => {
    if (selectedTags.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    if (!isUserLoggedIn) {
      toast.info('Please sign in or sign up to fetch recipes');
      setShowSignupOverlay(true);
      return;
    }

    setIsLoadingRecipes(true);

    try {
      const response = await customFetch.post('/auth/fetchRecipes', {
        ingredients: selectedTags,
      });
      const fetchedRecipes = response.data.recipes;
      setRecipes(fetchedRecipes);

      fetchedRecipes.forEach((recipe, index) => {
        requestQueue.current.push({ recipeName: recipe.name, index });
      });

      processQueue();

      setResponseMessage('');
    } catch (e) {
      console.error('Failed to fetch recipes:', e.message);
      setResponseMessage('');
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const processQueue = async () => {
    if (processingQueue.current || requestQueue.current.length === 0) return;

    processingQueue.current = true;
    const batch = requestQueue.current.splice(0, 5);

    await Promise.all(
      batch.map(({ recipeName, index }) => generateImage(recipeName, index))
    );

    processingQueue.current = false;

    if (requestQueue.current.length > 0) {
      processQueue();
    }
  };

  const generateImage = async (recipeName, index) => {
    setLoadingImages((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await customFetch.post('/auth/createImage', {
        recipeName,
      });
      setRecipes((prev) => {
        const updatedRecipes = [...prev];
        updatedRecipes[index].image = response.data.generated_image;
        return updatedRecipes;
      });
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoadingImages((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleRecipeClick = (recipe) => {
    if (isUserLoggedIn) {
      setSelectedRecipe(recipe);
    } else {
      setShowSignInModal(true);
    }
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
  };

  const addHistory = async (recipe) => {
    if (!isUserLoggedIn) {
      setShowSignInModal(true);
      return;
    }
    try {
      const { name, steps, ingredients } = recipe;
      const response = await customFetch.post('/auth/history', {
        name,
        steps,
        ingredients,
      });
      toast.success('History updated. \n Refresh to view');
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const starRecipe = async (recipe) => {
    if (!isUserLoggedIn) {
      setShowSignInModal(true);
      return;
    }
    try {
      const { name, steps, ingredients } = recipe;
      const response = await customFetch.post('/auth/starRecipe', {
        name,
        steps,
        ingredients,
      });

      if (response.status === 200) {
        toast.success(`${response.data.message}\nPlease refresh your sidebar`);
        setFavorites((prev) => [...prev, recipe.name]);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      toast.error(
        `${error.response?.data?.warning || 'Failed to star recipe'
        }\nPlease refresh your sidebar`
      );
    }
  };

  return (
    <div className="relative p-4 flex-1 bg-orange-100">
      <div className="relative z-10">
        <div className="mb-4">
          <div className="relative flex flex-wrap items-center border-2 border-orange-900 bg-orange-100 rounded-full p-1">
            {selectedTags.map((tag, index) => (
              <div
                key={index}
                className="bg-orange-300 ml-1 px-2 py-1 rounded-full border border-black mr-2 flex items-center"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-red-600"
                >
                  &times;
                </button>
              </div>
            ))}
            <input
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              placeholder="Search..."
              className="flex-1 py-2 px-4 outline-none bg-transparent"
            />
            <button
              onClick={handleSearchClick}
              className="border-l border-orange-900  icon-button p-2 px-3 mr-0 hover:bg-orange-200 hover:border-2 hover:border-orange-950 hover:rounded-full"
            >
              <FaSearch className="text-3xl text-orange-950 " />
            </button>
          </div>
          {suggestions.length > 0 && (
            <ul className="mt-3 bg-orange-100 w-60 absolute z-10 max-h-72 p-1 overflow-y-auto custom-scrollbar">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="border border-gray-200 hover:border-orange-950 p-1 py-2 bg-gray-300 hover:bg-orange-300 hover:border-2 text-center rounded cursor-pointer"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        {responseMessage && (
          <div className="mt-4">
            <p>{responseMessage}</p>
          </div>
        )}
        {loading ? ( // Show UILoader when loading is true
          <UILoader />) : recipes.length === 0 && (
            <div className="flex flex-col items-center mt-20">
              {isLoadingRecipes ? (
                <UILoader className="text-6xl mt-20 text-orange-900 animate-spin" />
              ) : (
                <>
                  <img src={drink} alt="Choose ingredients" className=" mt-20 w-1/6 h-auto" />
                  <p className="mt-4 text-2xl text-orange-900 font-bold">Choose ingredients to view recipes!</p>
                </>
              )}
            </div>
          )}
        {recipes.length > 0 && (
          <div>
            <div className='bg-orange-200 p-4 flex justify-center hover:bg-orange-900 hover:text-orange-100 hover:cursor-pointer border border-orange-900 rounded-lg text-orange-950'>
              <p>The generated recipes may not contain suitable images as the image generation limit may have expired.</p>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

              {recipes.map((recipe, index) => (
                <IonCard
                  key={index}
                  onClick={() => handleRecipeClick(recipe)}
                  className={`relative border-2 border-orange-900 p-4 ${isUserLoggedIn ? '' : 'blur-lg cursor-not-allowed'
                    } bg-transparent hover:bg-orange-400 shadow-md shadow-black hover:border-4 hover:font-bold hover:text-white backdrop-filter backdrop-blur-md bg-opacity-30 transition-all duration-300 ease-in-out`}
                >
                  <div className="absolute top-2 left-2 ">
                    <button
                      className="bg-orange-950 shadow-black shadow-md text-orange-50 rounded-full p-2 hover:bg-orange-50 hover:text-orange-950 transition duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        starRecipe(recipe);
                      }}
                    >
                      <FaStar />
                    </button>
                  </div>
                  {loadingImages[index] ? (
                    <div className="flex justify-center items-center w-full">
                      <div className="loader">Loading...</div>
                    </div>
                  ) : (
                    <div className="image-container">
                      <img
                        alt="Recipe"
                        src={recipe.image || temp}
                        className="h-60 w-full object-cover rounded-sm border border-orange-950 hover:border-2"
                      />
                    </div>
                  )}
                  <div className="mt-1 border-orange-900">
                    <div className="border-t-4 border-orange-950"></div>
                    <IonCardHeader>
                      <IonCardTitle className="text-xl font-extrabold">
                        {recipe.name}
                      </IonCardTitle>
                    </IonCardHeader>
                  </div>
                </IonCard>
              ))}
            </div>
          </div>
        )}
        {selectedRecipe && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={(e) => {
              closeRecipeModal();
              addHistory(selectedRecipe);
            }}
            role="dialog"
            aria-labelledby="recipe-title"
            aria-modal="true"
          >
            <div
              className="bg-orange-100 p-8 rounded-2xl shadow-black shadow-xl max-w-lg w-full relative h-3/4 overflow-y-auto"
              onClick={(e) => {
                e.stopPropagation();
                addHistory(selectedRecipe);
              }}
            >
              <button
                onClick={closeRecipeModal}
                className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                &times;
              </button>
              <div className="absolute top-2 left-2">
                <button
                  className="bg-orange-950 text-orange-50 rounded-full p-2 shadow-lg hover:bg-orange-50 hover:text-orange-950 transition duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    starRecipe(selectedRecipe);
                  }}
                >
                  <FaStar />
                </button>
              </div>
              <h3 id="recipe-title" className="text-2xl font-bold mb-4">
                {selectedRecipe.name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center bg-orange-300 px-2 py-1 rounded border border-orange-400 hover:border-orange-950 hover:bg-orange-300"
                  >
                    {ingredient}
                  </div>
                ))}
              </div>
              <h4 className="font-bold mb-1 text-xl border-t-4 border-orange-900">
                Steps:
              </h4>
              <div>
                {selectedRecipe.steps.map((step, index) => (
                  <div className="mb-1" key={index}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedRecipe && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={(e) => {
              closeRecipeModal();
              addHistory(selectedRecipe);
            }}
            role="dialog"
            aria-labelledby="recipe-title"
            aria-modal="true"
          >
            <div
              className="bg-orange-100 p-8 rounded-2xl shadow-black shadow-xl max-w-lg w-full relative h-3/4 overflow-y-auto"
              onClick={(e) => { e.stopPropagation(); addHistory(selectedRecipe); }}
            >
              <button
                onClick={closeRecipeModal}
                className="absolute text-3xl top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                &times;
              </button>
              <div className="absolute top-2 left-2">
                <button
                  className="bg-orange-950 text-orange-50 rounded-full p-2 shadow-lg hover:bg-orange-50 hover:text-orange-950 transition duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    starRecipe(selectedRecipe);
                  }}
                >
                  <FaStar />
                </button>
              </div>
              <h3 id="recipe-title" className="text-2xl font-bold mb-4">
                {selectedRecipe.name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center bg-orange-300 px-2 py-1 rounded border border-orange-400 hover:border-orange-950 hover:bg-orange-300"
                  >
                    {ingredient}
                  </div>
                ))}
              </div>
              <h4 className="font-bold mb-1 text-xl border-t-4 border-orange-900">Steps:</h4>
              <div>
                {selectedRecipe.steps.map((step, index) => (
                  <div className="mb-1" key={index}>{step}</div>
                ))}
              </div>
            </div>
          </div>
        )}
        {showSignupOverlay && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setShowSignupOverlay(false)}
          >
            <div
              className="relative max-w-md w-full p-4 bg-amber-50 shadow-black rounded-2xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={image}
                alt="Sign Up"
                className=" w-full h-auto object-cover mb-4 border-b-4 border-orange-900"
              />
              <div className="flex items-start rounded-md mt-10 shadow-md shadow-amber-900 text-amber-700 font-bold bg-amber-100">
                <FaInfoCircle className="text-2xl mt-4 ml-4" />
                <p className="py-4 px-2">
                  Please Sign Up to view the recipes !
                </p>
              </div>
              <div className="flex justify-center gap-8 mt-10">
                <div className="z-0 p-1 rounded-full">
                  <Link to="/login">
                    <Button
                      title="Sign In"
                      containerStyle="hover:font-bold hidden md:block bg-transparent border-orange-900 py-3 hover:scale-110 hover:shadow-md hover:shadow-black transition duration-200 font-bold text-gray-800 hover:bg-orange-200 hover:text-orange-950 rounded-full min-w-[130px]"
                    />
                  </Link>
                </div>
                <div className="z-0  p-1 rounded-full">
                  <Link to="/register">
                    <Button
                      title="Sign Up"
                      containerStyle="hover:font-bold hidden md:block bg-transparent py-3 border-orange-900 hover:scale-110 hover:shadow-md hover:shadow-black transition duration-200 font-bold text-gray-800 hover:bg-orange-200 hover:text-orange-950 rounded-full min-w-[130px]"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
