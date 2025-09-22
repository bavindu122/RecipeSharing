import { useState } from "react";
import { Home } from "./pages/Home";
import "./App.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainNav } from "./components/MainNav";
import axios from "axios";

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
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
