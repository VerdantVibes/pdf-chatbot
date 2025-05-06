import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthRoute } from "./components/auth/AuthRoute";
import { SignIn } from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivateAssets from "./pages/KnowledgeBase/PrivateAssets";
import { Chat } from "./pages/Chat";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { DocumentViewer } from "./pages/DocumentViewerPage";
import { General } from "./pages/Settings/General";
import { SettingsLayout } from "./pages/Settings/layout";
import { Members } from "./pages/Settings/Members";
import { PlanBilling } from "./pages/Settings/PlanBilling";
import { Security } from "./pages/Settings/Security";
import { Profile } from "./pages/Settings/Profile";
import { KnowledgeBaseLayout } from "./pages/KnowledgeBase/layout";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPasswordSuccess } from "./pages/ResetPasswordSuccess";

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
            path="/forgot-password"
            element={
              <AuthRoute>
                <ForgotPassword />
              </AuthRoute>
            }
          />
          <Route
            path="/reset-password-success"
            element={
              <AuthRoute>
                <ResetPasswordSuccess />
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
            path="/knowledge-base"
            element={
              <ProtectedRoute>
                <KnowledgeBaseLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="general" element={<PrivateAssets />} />
            <Route index element={<Navigate to="/knowledge-base/general" replace />} />
          </Route>

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

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsLayout />
              </ProtectedRoute>
            }
          >
            <Route path="general" element={<General />} />
            <Route index element={<Navigate to="/settings/general" replace />} />
            <Route path="members" element={<Members />} />
            <Route path="profile" element={<Profile />} />
            <Route path="plan-billing" element={<PlanBilling />} />
            <Route path="security" element={<Security />} />
          </Route>

          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
