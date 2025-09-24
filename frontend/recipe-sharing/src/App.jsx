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

const getAllRecipes = async () => {
  let allRecipes = [];
  await axios
    .get("http://localhost:5000/recipe")
    .then((response) => {
      allRecipes = response.data;
    })
    .catch((error) => {
      console.error("Error fetching recipes:", error);
    });
  return allRecipes;
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
