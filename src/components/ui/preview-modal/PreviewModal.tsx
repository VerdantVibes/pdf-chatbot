import { useState, useEffect, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PreviewHeader } from "@/components/ui/preview-modal/PreviewHeader";
import { PreviewContent } from "@/components/ui/preview-modal/PreviewContent";

export type ViewMode = "side" | "center" | "full";

export interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: ReactNode;
  currentIndex?: number;
  totalItems?: number;
  onNavigate?: (index: number) => void;
  className?: string;
}

export function PreviewModal({
  open,
  onOpenChange,
  content,
  currentIndex = 0,
  totalItems = 1,
  onNavigate,
  className,
}: PreviewModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side");
  const [showControls, setShowControls] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!open) return;

    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      setShowControls(true);

      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetTimer();

    const handleMouseMove = () => resetTimer();
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          onOpenChange(false);
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handlePrevious();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleNext();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, currentIndex, totalItems, onNavigate, isFullScreen]);

  const handlePrevious = useCallback(() => {
    if (onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (onNavigate && currentIndex < totalItems - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, totalItems, onNavigate]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  const getVariants = useCallback(() => {
    const effectiveViewMode = isFullScreen ? "full" : viewMode;

    return {
      initial: {
        opacity: 0,
        ...(effectiveViewMode === "side" && {
          top: 0,
          right: 0,
          left: "auto",
          x: "100%",
          scale: 1,
        }),
        ...(effectiveViewMode === "center" && {
          top: "50%",
          bottom: "50%",
          left: "50%",
          right: "50%",
          x: "-50%",
          y: "-50%",
          scale: 0.7,
        }),
        ...(effectiveViewMode === "full" && {
          top: "50%",
          left: "50%",
          right: "50%",
          bottom: "50%",
          width: "40%",
          height: "40vh",
          x: "-50%",
          y: "-50%",
          scale: 0.9,
        }),
      },
      side: {
        opacity: 1,
        scale: 1,
        width: "50%",
        height: "100vh",
        top: 0,
        right: 0,
        left: "auto",
        x: 0,
        y: 0,
        borderRadius: "0",
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      },
      center: {
        opacity: 1,
        scale: 1,
        width: "50%",
        height: "75vh",
        top: "50%",
        left: "50%",
        right: "auto",
        x: "-50%",
        y: "-50%",
        borderRadius: "0.5rem",
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      },
      full: {
        opacity: 1,
        scale: 1,
        width: "100%",
        height: "100vh",
        top: 0,
        left: 0,
        right: 0,
        x: 0,
        y: 0,
        borderRadius: "0",
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      },
      exit: {
        opacity: 0,
        ...(effectiveViewMode === "side" && {
          x: "100%",
          scale: 1,
        }),
        ...(effectiveViewMode === "center" && {
          scale: 0.7,
        }),
        ...(effectiveViewMode === "full" && {
          scale: 0.9,
          width: "40%",
          height: "40vh",
          top: "50%",
          left: "50%",
          right: "auto",
          x: "-50%",
          y: "-50%",
          borderRadius: "0.5rem",
        }),
        transition: {
          duration: 0.2,
        },
      },
    };
  }, [viewMode, isFullScreen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/80 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (isFullScreen) {
                setIsFullScreen(false);
              } else {
                onOpenChange(false);
              }
            }}
          />

          <motion.div
            className={cn("fixed z-50 border shadow-lg bg-background flex flex-col overflow-hidden", className)}
            initial="initial"
            animate={isFullScreen ? "full" : viewMode}
            exit="exit"
            variants={getVariants()}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className={cn(
                "absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-background via-background to-transparent pt-2 pb-8",
                showControls ? "opacity-100" : "opacity-0"
              )}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: showControls ? 1 : 0, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PreviewHeader
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onClose={() => onOpenChange(false)}
                currentIndex={currentIndex}
                totalItems={totalItems}
                onNavigate={onNavigate || (() => {})}
                isFullScreen={isFullScreen}
                onToggleFullScreen={toggleFullScreen}
              />
            </motion.div>

            <div className="flex-1 overflow-y-auto mt-12 p-4">
              <PreviewContent content={content} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
