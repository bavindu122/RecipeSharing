import { useState } from "react";
import { Home } from "./pages/Home";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import "./App.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainNav } from "./components/MainNav";
import { Children } from "react";
import axios from "axios";

const getAllRecipes = async () => {
  let allRecipes = []
  await axios.get("http://localhost:5000/recipe")
    .then(response => {
      allRecipes = response.data;
    })
    .catch(error => {
      console.error("Error fetching recipes:", error);
    });
  return allRecipes;  
};

const router = createBrowserRouter([
  { path: "/", element: <MainNav />, children: [
    {
      path: "/",
      element: <Home />,loader: getAllRecipes
    },
  ] },
]);

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
