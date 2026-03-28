import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes/AppRouter";
import "./styles/global.css";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
