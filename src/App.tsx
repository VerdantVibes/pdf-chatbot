import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthRoute } from "./components/auth/AuthRoute";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivateAssets from "./pages/PrivateAssets";
import { Chat } from "./pages/Chat";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { DocumentViewer } from "./pages/DocumentViewerPage";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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

          <Route
            path="/private-assets"
            element={
              <ProtectedRoute>
                <PrivateAssets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/document/:id"
            element={
              <ProtectedRoute>
                <DocumentViewer />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
