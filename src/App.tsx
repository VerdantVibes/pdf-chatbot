import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthRoute } from "./components/auth/AuthRoute";
import { SignIn } from "./pages/SignIn";
import { SignUpBeta } from "./pages/SignUpBeta";
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
import { Reports } from "@/pages/Reports";
import { Integrations } from "@/pages/Integrations/Integrations";
import Signals from "./pages/Signals/Signals";
import Notes from "./pages/Notes/Notes";

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
          {/* <Route
            path="/signup"
            element={
              <AuthRoute>
                <SignUp />
              </AuthRoute>
            }
          /> */}
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <SignUpBeta />
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
            path="/signals"
            element={
              <ProtectedRoute>
                <Signals />
              </ProtectedRoute>
            }
          >
          </Route>

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          >
          </Route>

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
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/integrations"
            element={
              <ProtectedRoute>
                <Integrations />
              </ProtectedRoute>
            }
          >
            <Route path="podcasts" element={<Integrations />} />
            <Route path="storage" element={<Integrations />} />
            <Route path="news" element={<Integrations />} />
            <Route index element={<Navigate to="/integrations/podcasts" replace />} />
          </Route>

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
