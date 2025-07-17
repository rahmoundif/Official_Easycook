import type { TypeRecipe } from "@/types/TypeFiles";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function AccueilCategory() {
  const [categoryRecipe, setCategoryRecipe] = useState<TypeRecipe[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/accueil/category`)
      .then((response) => response.json())
      .then((data) => {
        setCategoryRecipe(data);
      });
  }, []);

  const handleCategoryChoosed = (categoryName: string) => {
    localStorage.setItem("selectedCategory", categoryName);
    navigate("/Recettes");
  };

  return (
    <>
      <h2 className="text-center py-12">Recettes par catégories</h2>
      <section className="flex flex-wrap justify-center gap-24 pb-12">
        {categoryRecipe.map((recipe) => (
          <button
            type="button"
            key={recipe.id}
            onClick={() => handleCategoryChoosed(recipe.name)}
            className="relative w-80 h-60 overflow-hidden rounded-xl shadow-md cursor-pointer "
          >
            {/* Image de fond floutée */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-xs "
              style={{ backgroundImage: `url(${recipe.picture})` }}
            />

            {/* Overlay*/}
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <h4 className="text-white text-xl font-bold text-center bg-primary/50 w-full h-8">
                {recipe.name}
              </h4>
            </div>
          </button>
        ))}
      </section>
    </>
  );
}

export default AccueilCategory;
