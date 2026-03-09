import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import RunPipeline from "./pages/dashboard/pipeline/RunPipeline";
import TemplateLibrary from "./pages/dashboard/pipeline/TemplateLibrary";
import WorkflowList from "./pages/dashboard/workflows/WorkflowList";
import WorkflowDetail from "./pages/dashboard/workflows/WorkflowDetail";
import TemplatesPage from "./pages/dashboard/templates";
import AIServicesPage from "./pages/dashboard/ai-services";
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
          { path: "workflows", element: <WorkflowList /> },
          { path: "run-pipeline", element: <RunPipeline /> },
          { path: "template-library", element: <TemplateLibrary /> },
          { path: "templates", element: <TemplatesPage /> },
          { path: "ai-services", element: <AIServicesPage /> },
        ],
      },
      {
        path: "workflows/:workflowId",
        element: <WorkflowDetail />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
