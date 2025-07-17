import type { TypeRecipe } from "@/types/TypeFiles";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function OurSelection() {
  const [randomRecipe, setRandomRecipe] = useState<TypeRecipe[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/recipe/random`)
      .then((response) => response.json())
      .then((data) => {
        setRandomRecipe(data);
      });
  }, []);

  const renderStars = (rate: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rate) {
        stars.push(<span key={i}>⭐</span>);
      }
    }
    return stars;
  };

  const handleRecipeChoosed = (id: number) => {
    localStorage.setItem("recipeId", id.toString());
    navigate("/Details");
  };

  return (
    <>
      <section className="flex flex-row justify-center items-center gap-4 py-12">
        <img className="h-20 w-20" src="/cook-pointeur.png" alt="" />
        <h2>Notre sélection</h2>
      </section>
      <section className="flex flex-wrap justify-center gap-10 min-md:gap-25 pb-12">
        {randomRecipe.map((recipe) => (
          <button
            onClick={() => handleRecipeChoosed(recipe.id)}
            type="button"
            key={recipe.id}
            className="text-secondary flex-shrink-0 w-64 mx-5 bg-background shadow-md shadow-secondary/20 rounded-3xl cursor-pointer"
          >
            <img src={recipe.picture} alt="" className="  h-60 w-60 m-auto " />
            <div className="my-2 ">{recipe.name}</div>
            <div className="flex flex-row my-2 justify-center">
              <div className="mr-10 ">{recipe.time_preparation} min</div>
              <div>{renderStars(recipe.rate)}</div>
            </div>
          </button>
        ))}
      </section>
    </>
  );
}

export default OurSelection;
