import type { RequestHandler } from "express";

// Import access to data
import ingredientsRepository from "./ingredientsRepository";

// The B of BREAD - Browse (Read All) operation
const browse: RequestHandler = async (req, res, next) => {
  try {
    // Fetch all items
    const recipies = await ingredientsRepository.readAll();

    // Respond with the items in JSON format
    res.json(recipies);
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

const recipeIngredient: RequestHandler = async (req, res, next) => {
  try {
    // Fetch a specific item based on the provided ID
    const recipiesId = Number(req.params.id);
    const recipe = await ingredientsRepository.recipeIngredient(recipiesId);

    // If the item is not found, respond with HTTP 404 (Not Found)
    // Otherwise, respond with the item in JSON format
    if (recipe == null) {
      res.sendStatus(404);
    } else {
      res.json(recipe);
    }
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

const browseWithType: RequestHandler = async (req, res, next) => {
  try {
    const ingredients = await ingredientsRepository.readAllWithType();
    
    // Ensure we always return an array, even if empty
    res.json(ingredients || []);
  } catch (err) {
    console.error('Error in browseWithType:', err);
    
    // Return empty array on error to prevent client crashes
    res.status(500).json({
      error: 'Failed to fetch ingredients',
      data: []
    });
  }
};

export default { browse, browseWithType, recipeIngredient };
