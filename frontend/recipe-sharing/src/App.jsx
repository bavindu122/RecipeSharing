import { useState } from "react";
import { Home } from "./pages/Home";
import "./App.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainNav } from "./components/MainNav";
import axios from "axios";
import { RequireAuth } from "./components/RequireAuth";
import { UserProfile } from "./pages/UserProfile";
import { AuthProvider } from "./context/AuthContext";
import { AddNewRecipe } from "./pages/AddNewRecipe";
import { RecipeDetails } from "./pages/RecipeDetails";

const getAllRecipes = async () => {
  let allRecipes = [];
  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  await axios
    .get(`${base}/recipe`)
    .then((response) => {
      allRecipes = response.data;
    })
    .catch((error) => {
      console.error("Error fetching recipes:", error);
    });
  return allRecipes;
};

const getRecipeById = async ({ params }) => {
  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const id = params?.id;
  try {
    const { data } = await axios.get(`${base}/recipe/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainNav />,
    children: [
      {
        path: "/",
        element: <Home />,
        loader: getAllRecipes,
      },
      {
        path: "/profile",
        element: (
          <RequireAuth>
            <UserProfile />
          </RequireAuth>
        ),
      },
      {
        path: "/addNewRecipe",
        element: (
          <RequireAuth>
            <AddNewRecipe />
          </RequireAuth>
        ),
      },
      {
        path: "/recipe/:id",
        element: <RecipeDetails />,
        loader: getRecipeById,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
