import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "sonner";
import { LogOut, FileText, Upload, Loader2, User, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast("Logout failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-20 mx-auto">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">PDF Chatbot</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium line-clamp-1">{user?.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {user?.email}
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
              className="ml-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-none shadow-md mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome, {user?.name}</CardTitle>
              <CardDescription>
                Start working with your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full sm:w-auto gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-base mb-4">No documents yet</p>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="container">
          <div className="text-sm text-muted-foreground text-center">
            © 2025 PDF Chatbot
          </div>
        </div>
      </footer>
    </div>
  );
}
