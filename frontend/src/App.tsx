import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RunPipeline from "./pages/pipeline/RunPipeline";
import TemplateLibrary from "./pages/pipeline/TemplateLibrary";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <Layout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "run-pipeline", element: <RunPipeline /> },
          { path: "template-library", element: <TemplateLibrary /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
