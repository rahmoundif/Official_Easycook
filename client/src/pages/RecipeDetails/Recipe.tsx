import RecipeCard from "@/components/RecipeCard";
import type { TypeRecipe } from "@/types/TypeFiles";
import { useCallback, useEffect, useState } from "react";
import { TiDeleteOutline } from "react-icons/ti";
import { Link } from "react-router";
import FiltresRecipe from "../../components/FiltresRecipe";

// Composant principal qui affiche la page des recettes
function Recettes() {
  // State pour stocker les recettes à afficher
  const [recipeToMap, setRecipeToMap] = useState<TypeRecipe[]>([]);
  // State pour le mot-clé de recherche (initialisé depuis le localStorage si dispo)
  const [searchWord, setSearchWord] = useState(
    localStorage.getItem("searchWord") || "",
  );

  // States pour les filtres sélectionnés
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    localStorage.getItem("selectedCategory") || null,
  );
  const [selectedRegime, setSelectedRegime] = useState<string | null>(null);
  const [selectedDifficulte, setSelectedDifficulte] = useState<string | null>(
    null,
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination : 9 recettes par page, 3x3 grid
  const RECIPES_PER_PAGE = 9;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(recipeToMap.length / RECIPES_PER_PAGE);
  const startIdx = (page - 1) * RECIPES_PER_PAGE;
  const endIdx = startIdx + RECIPES_PER_PAGE;
  const recipesPage = recipeToMap.slice(startIdx, endIdx);

  // Fonction pour effectuer une recherche par mot-clé
  const handleSearch = useCallback(() => {
    setRecipeToMap([]); // Vide les recettes pendant le chargement
    fetch(`${import.meta.env.VITE_API_URL}/recipe/search/${searchWord}`)
      .then((response) => response.json())
      .then((data) => {
        setRecipeToMap(data); // Met à jour les recettes avec le résultat de la recherche
      });
  }, [searchWord]);

  // Fonction pour charger toutes les recettes (sans filtre)
  const handleAll = useCallback(() => {
    fetch(`${import.meta.env.VITE_API_URL}/recipe`)
      .then((response) => response.json())
      .then((data) => {
        setRecipeToMap(data);
      });
  }, []);

  // useEffect principal pour l'initialisation et la gestion de la recherche
  useEffect(() => {
    const storedSearchWord = localStorage.getItem("searchWord");
    const homeCategory = localStorage.getItem("selectedCategory");

    if (storedSearchWord) {
      // Priorité 1: Si on a un terme de recherche depuis l'accueil
      setSearchWord(storedSearchWord);
      setRecipeToMap([]); // Vide les recettes pendant le chargement
      fetch(`${import.meta.env.VITE_API_URL}/recipe/search/${storedSearchWord}`)
        .then((response) => response.json())
        .then((data) => {
          setRecipeToMap(data); // Affiche seulement les recettes correspondantes
        })
        .catch((error) => {
          console.error("Erreur lors de la recherche:", error);
          // En cas d'erreur, charge toutes les recettes
          handleAll();
        });
      localStorage.removeItem("searchWord");
    } else if (homeCategory) {
      // Priorité 2: Si pas de recherche mais une catégorie sélectionnée
      setSelectedCategory(homeCategory);
      localStorage.removeItem("selectedCategory");
    } else {
      // Priorité 3: Si rien dans localStorage, charge toutes les recettes
      handleAll();
    }
  }, []); // Dépendances vides - s'exécute seulement au montage

  // useEffect pour gérer les filtres (ne s'exécute que si pas de recherche active)
  useEffect(() => {
    // Si on a une recherche active, on n'applique pas les autres filtres
    if (searchWord && localStorage.getItem("searchWord") === null) {
      return;
    }

    // Si aucun filtre n'est sélectionné, on affiche tout
    if (!selectedCategory && !selectedRegime && !selectedDifficulte) {
      handleAll();
      return;
    }

    // Construit l'URL avec les filtres sélectionnés
    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedRegime) params.append("diet", selectedRegime);
    if (selectedDifficulte) params.append("difficulty", selectedDifficulte);

    fetch(`${import.meta.env.VITE_API_URL}/recipe?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setRecipeToMap(data);
      })
      .catch((error) => {
        console.error("Erreur lors du filtrage:", error);
      });
  }, [selectedCategory, selectedRegime, selectedDifficulte, handleAll]);

  return (
    <section className="p-5 max-w-screen-xl mx-auto">
      {/* Barre de recherche */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-3 mb-6">
        <div className="relative">
          <input
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="border-2 border-primary bg-white/40 rounded-full pl-5 pr-4 py-2 md:w-72 shadow focus:outline-none focus:ring-2 focus:ring-primary transition placeholder:text-secondary text-black text-lg"
            name="search"
            id="search"
            type="search"
            placeholder="🔎 Recette, ingrédient..."
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="bg-primary rounded-full px-4 py-2 font-bold text-white shadow-md hover:from-amber-300 hover:to-amber-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Rechercher
        </button>
      </div>

      {/* Filtres desktop */}
      <section className="flex justify-center gap-6 pb-3 max-md:hidden text-secondary">
        {/* Dropdown pour filtrer par catégorie */}
        <FiltresRecipe
          label="Catégorie"
          options={["Petit déjeuner", "Repas", "Dessert"]}
          onSelect={setSelectedCategory}
        />
        {/* Dropdown pour filtrer par régime */}
        <FiltresRecipe
          label="Régime"
          options={["Vegan", "Végétarien", "Sans Gluten"]}
          onSelect={setSelectedRegime}
        />
        {/* Dropdown pour filtrer par difficulté */}
        <FiltresRecipe
          label="Difficulté"
          options={["Facile", "Moyen", "Difficile"]}
          onSelect={setSelectedDifficulte}
        />
        {/* Bouton pour réinitialiser tous les filtres */}
        <button
          type="button"
          className="rounded-full border-2 border-primary bg-primary/90 text-white px-6 py-2 text-lg font-semibold shadow hover:bg-primary hover:scale-105 transition-all duration-150"
          onClick={() => {
            setSearchWord("");
            setSelectedCategory(null);
            setSelectedRegime(null);
            setSelectedDifficulte(null);
            handleAll();
            localStorage.removeItem("selectedCategory");
          }}
        >
          Réinitialiser les filtres
        </button>
      </section>

      {/* Indicateur des filtres sélectionnés */}
      {(searchWord || selectedCategory || selectedRegime || selectedDifficulte) && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {searchWord && (
            <span className="bg-orange-100 text-orange-800 border border-orange-300 rounded-full px-4 py-1 text-sm font-semibold flex items-center gap-2">
              🔍 Recherche : "{searchWord}"
              <button
                type="button"
                className="ml-1 text-orange-800 hover:text-red-600 text-xl focus:outline-none"
                aria-label="Effacer la recherche"
                onClick={() => {
                  setSearchWord("");
                  handleAll();
                }}
              >
                <TiDeleteOutline />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="bg-primary/20 text-primary border border-primary rounded-full px-4 py-1 text-sm font-semibold flex items-center gap-2">
              Catégorie : {selectedCategory}
              <button
                type="button"
                className="ml-1 text-primary hover:text-red-600 text-xl focus:outline-none"
                aria-label="Retirer le filtre catégorie"
                onClick={() => setSelectedCategory(null)}
              >
                <TiDeleteOutline />
              </button>
            </span>
          )}
          {selectedRegime && (
            <span className="bg-green-100 text-green-800 border border-green-300 rounded-full px-4 py-1 text-sm font-semibold flex items-center gap-2">
              Régime : {selectedRegime}
              <button
                type="button"
                className="ml-1 text-green-800 hover:text-red-600 text-xl focus:outline-none"
                aria-label="Retirer le filtre régime"
                onClick={() => setSelectedRegime(null)}
              >
                <TiDeleteOutline />
              </button>
            </span>
          )}
          {selectedDifficulte && (
            <span className="bg-blue-100 text-blue-700 border border-blue-300 rounded-full px-4 py-1 text-sm font-semibold flex items-center gap-2">
              Difficulté : {selectedDifficulte}
              <button
                type="button"
                className="ml-1 text-blue-700 hover:text-red-600 text-xl focus:outline-none"
                aria-label="Retirer le filtre difficulté"
                onClick={() => setSelectedDifficulte(null)}
              >
                <TiDeleteOutline />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Filtres mobile */}
      <section className="md:hidden pb-3 mr-2 text-secondary text-center">
        <button
          type="button"
          className="rounded-full border-2 border-primary bg-primary/90 text-white px-6 py-2 text-xl font-semibold shadow mb-3 w-full mx-2"
          onClick={() => setShowMobileFilters((v) => !v)}
        >
          {showMobileFilters ? "Fermer les filtres" : "Filtres"}
        </button>
        {showMobileFilters && (
          <div className="flex flex-col gap-4 items-center bg-white/90 rounded-2xl p-4 shadow-lg">
            <FiltresRecipe
              label="Catégorie"
              options={["Petit déjeuner", "Repas", "Dessert"]}
              onSelect={setSelectedCategory}
            />
            <FiltresRecipe
              label="Régime"
              options={["Vegan", "Végétarien", "Sans Gluten"]}
              onSelect={setSelectedRegime}
            />
            <FiltresRecipe
              label="Difficulté"
              options={["Facile", "Moyen", "Difficile"]}
              onSelect={setSelectedDifficulte}
            />
            <button
              type="button"
              className="rounded-full border-2 border-primary bg-primary/90 text-white px-6 py-2 text-lg font-semibold shadow"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedRegime(null);
                setSelectedDifficulte(null);
                setShowMobileFilters(false);
                handleAll();
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </section>

      {/* Affichage des cartes de recettes */}
      <div className="w-full max-w-7xl mx-auto px-4 my-8">
        {/* Affiche une page de 9 recettes en responsive (1 colonne mobile, 2 tablette, 3 desktop) */}
        <div className="grid gap-6 justify-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {recipesPage.map((recipe) => (
            <Link
              to={`/Details/${recipe.id}`}
              key={recipe.id}
              onClick={() =>
                localStorage.setItem("recipeId", recipe.id.toString())
              }
              className="hover:no-underline"
            >
              <RecipeCard
                recipe={{
                  id: recipe.id,
                  name: recipe.recipe_name || recipe.name,
                  picture: recipe.picture,
                  description: recipe.description,
                  kcal: recipe.kcal,
                  time_preparation: recipe.time_preparation,
                  difficulty: recipe.difficulty,
                  diet_name: recipe.diet_name,
                  rate: recipe.rate,
                }}
              />
            </Link>
          ))}
        </div>
        {/* Pagination controls en bas */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 my-8">
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-primary text-white font-bold disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </button>
            <span className="text-secondary font-bold text-lg">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-primary text-white font-bold disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Recettes;
