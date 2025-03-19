import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthRoute } from "./components/auth/AuthRoute";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { NotFound } from "./pages/NotFound";
import "./App.css";
import Home from "./pages/Home";
import Main from "./layout/Main";
import AiAssistant from "./pages/AiAssistant";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/signin"
          element={
            <AuthRoute>
              <SignIn />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignUp />
            </AuthRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route element={<Main />}>
          <Route path="/ai-assistant" element={<AiAssistant />} />
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
