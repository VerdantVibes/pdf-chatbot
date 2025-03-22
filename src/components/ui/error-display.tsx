import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface ErrorDisplayProps {
  error?: Error | string | null;
  title?: string;
  description?: string;
  fullScreen?: boolean;
  className?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, title = "Error", description, onRetry }: ErrorDisplayProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : description || "Something went wrong. Please try again.";

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "r") {
      e.preventDefault();
      window.location.reload();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 dark:bg-black/40 backdrop-blur-md transition-all">
      <div
        className="w-full max-w-md transform transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out"
        style={{
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity",
        }}
      >
        <div className="relative mx-5 overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse"></div>

          <div className="px-6 py-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5 mr-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-red-100/70 dark:bg-red-900/20 blur-sm"></div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/60">
                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="flex-1 pt-0.5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed tracking-normal">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-100 dark:bg-gray-800" />

          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3.5 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400 dark:bg-red-500 animate-pulse mr-2"></span>
                Press{" "}
                <kbd className="mx-1 px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                  Ctrl
                </kbd>
                +
                <kbd className="mx-1 px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                  R
                </kbd>{" "}
                to reload
              </p>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRetry || (() => window.location.reload())}
                      className="h-8 px-2 text-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Reload
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh the page</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
