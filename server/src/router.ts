import express from "express";
import security from "./modules/middleware/checkToken";
import securityAdmin from "./modules/middleware/checkTokenAdmin";
const router = express.Router();
import categoryActions from "./modules/category/categoryActions";
import dietActions from "./modules/diet/dietActions";
import ingredientActions from "./modules/ingredient/ingredientActions";
import listActions from "./modules/list/listActions";
import recipeActions from "./modules/recipe/recipeActions";
import unityActions from "./modules/unity/unityActions";
import memberActions from "./modules/user/memberActions";
import ustensilActions from "./modules/ustensil/ustensilActions";


/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
// Mur Middleware Securité-------------------------
router.use("/member", security.checkToken); // middleware pour les routes membres
router.use("/admin", securityAdmin.checkTokenAdmin); // middleware pour les routes admin

//Public Actions
router.get("/unity", unityActions.browse);
router.get("/diet", dietActions.browse);
router.get("/category", categoryActions.browse);
router.get("/recipe/random", recipeActions.random);
router.get("/recipe", recipeActions.browse);
router.get("/recipe/detail/:id", recipeActions.read);
router.get("/recipe/search/:id", recipeActions.search);
router.get("/recipe/category/:id", recipeActions.category);
router.get("/recipe/diet/:id", recipeActions.diet);
router.get("/recipe/time/:id", recipeActions.time);
router.get("/recipe/difficulty/:id", recipeActions.difficulty);
router.get("/accueil/category", recipeActions.accueilCategory);

//ingredient + ustencils + rate

router.get("/ingredient", ingredientActions.browse);
router.get("/ingredients", ingredientActions.browse);
router.get("/ingredients/by-type", ingredientActions.browseWithType);
router.get("/recipe/by-ingredients", recipeActions.byIngredients);
router.get("/ingredient/recipe/:id", ingredientActions.recipeIngredient); //tout les ingrediends, quantité et unite pour une recette(id)
router.get("/ustensil/recipe/:id", ustensilActions.recipeUstensil); //tout les ustensiles pour une recette(id)
router.get("/ustensil", ustensilActions.getAllUstensils);
router.get("/rate/recipe/:id", recipeActions.rate); //pour afficher la note et les commentaires d'une recette

//Authentification

router.post("/signup", memberActions.add, memberActions.login); // le "Add" permet de rajouter le compte et l'action "login" de ce log directement avec un token.
router.post("/login", memberActions.login); //l'action "login" permet de ce log directement avec un token si membre existant.
router.get("/session", memberActions.session); // public session status endpoint without 401
// Allow both POST and GET for logout (GET avoids CSRF requirement if token missing)
router.post("/logout", memberActions.logoutHandler);
router.get("/logout", memberActions.logoutHandler);
//Zone Membre ----------------------
router.patch("/member", memberActions.editMember); // modification du profile membre
router.get("/member/:id/profile", memberActions.readMemberProfile); // pour afficher le profile d'un membre
router.get("/member/:id/favorite", memberActions.readFavorite); // liste des recettes favorites d'un membre
router.get("/member/:id/comments", memberActions.readCommented); //pour afficher les commentaires d'une recette
router.get("/member/:id/registeredlist", memberActions.readRegisteredList);
router.post("/member/:id/list", listActions.addList); //ajouter une liste de courses
router.delete("/member/:id", memberActions.deleteAccount); //supression compte
router.get("/member", memberActions.checkId); // token Check
router.get("/member/:id", memberActions.readFavorite); // liste des recettes favorites d'un membre
router.post("/member/rate/recipe", recipeActions.addRate); //pour ajouter une note sur une recette
router.post("/member/comment/recipe", recipeActions.addComment); //pour ajouter un commentaire sur une recette
router.post("/member/favorite/recipe", recipeActions.updateFavorite); //pour ajouter une recette aux favoris")

//Zone Admin ----------------------

router.get("/admin/member", memberActions.browse);
router.get("/admin/recipes", recipeActions.listRecipesAdmin);
router.delete("/admin/:id", memberActions.deleteMemberAsAdmin);
router.patch("/admin/recipe/:id", recipeActions.update);
router.patch("/admin/:id", memberActions.UpdateAdminStatus); // Change le status d'un membre en (admin:true ou admin:false)
router.post("/admin/recipe", recipeActions.add); //TODO check for issue linked to Ustensil

/* ************************************************************************* */

// Define list-related routes

export default router;
