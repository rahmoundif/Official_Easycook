import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "sonner";

interface FavoriteType {
  recipe_id: number;
  name: string;
  picture: string;
  is_favorite: boolean;
  difficulty: string;
  diet_name: string;
}

function MemberFavoriteList() {
  const { idUserOnline } = useUser();
  const [favorites, setFavorites] = useState<FavoriteType[]>([]);

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_URL}/member/${idUserOnline}/favorite`,
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<FavoriteType[]>;
      })
      .then((data) => {
        setFavorites(data);
      })
      .catch((err) => {
        console.error("Error fetching favorites:", err);
      });
  }, [idUserOnline]);

  function handleToggleFavorite(recipeId: number, current: boolean) {
    // Optimistic update - immediately remove from UI
    if (current) {
      // If it's currently a favorite and we're removing it, remove from list
      setFavorites((prev) => prev.filter((fav) => fav.recipe_id !== recipeId));
    }

    fetch(`${import.meta.env.VITE_API_URL}/member/favorite/recipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        recipeId,
        userId: idUserOnline,
        is_favorite: !current,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update favorite');
        return res.json();
      })
      .then(() => {
        toast.success(current ? "Favori retiré" : "Ajouté aux favoris", {
          style: { background: "#452a00", color: "#fde9cc" },
        });
      })
      .catch((error) => {
        console.error('Error updating favorite:', error);
        // Revert optimistic update on error
        if (current) {
          // Re-add the item back to the list if the API call failed
          setFavorites((prev) => [...prev, favorites.find((fav) => fav.recipe_id === recipeId)!]);
        }
        toast.error("Erreur lors de la mise à jour", {
          style: { background: "#452a00", color: "#fde9cc" },
        });
      });
  }

  return (
    <section className=" flex flex-col mt-5 ml-3 md:justify-around md:flex-wrap">
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-secondary mb-2">Aucun favori</h3>
          <p className="text-gray-600">Vous n'avez pas encore ajouté de recettes à vos favoris.</p>
        </div>
      ) : (
        favorites.map((fav) => (
          <div
            key={fav.recipe_id}
            className="mb-5 bg-[#f9e7cf] shadow-lg rounded-2xl p-4 border-2 border-[#e6d9be] flex flex-col items-center min-w-[260px] max-w-xs"
          >
            <h4 className="font-bold text-lg text-secondary mb-2 text-center">
              {fav.name} {fav.is_favorite}
            </h4>

            <img
              src={fav.picture}
              alt={fav.name}
              className="w-32 h-32 object-cover rounded-xl mb-3"
            />
            <div className="flex flex-wrap gap-2 justify-center text-xs text-secondary mb-2">
              {fav.difficulty && (
                <span className="bg-[#ffe2b7] rounded px-2 py-1">
                  👨🏻‍🍳 {fav.difficulty}
                </span>
              )}
              {fav.diet_name && (
                <span className="bg-[#ffe2b7] rounded px-2 py-1">
                  {fav.diet_name}
                </span>
              )}
              <button
                onClick={() =>
                  handleToggleFavorite(fav.recipe_id, fav.is_favorite)
                }
                type="button"
              >
                {fav.is_favorite ? (
                  <FaHeart size={20} color="red" />
                ) : (
                  <FaRegHeart size={20} color="red" />
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}

export default MemberFavoriteList;
