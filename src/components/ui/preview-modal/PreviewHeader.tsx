import {
  Check,
  ChevronDown,
  ChevronsRight,
  ChevronUp,
  Maximize,
  Maximize2,
  Minimize2,
  MinusIcon,
  PanelRight,
  SquareSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ViewMode } from "./PreviewModal";

interface PreviewHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onClose: () => void;
  currentIndex: number;
  totalItems: number;
  onNavigate: (index: number) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export function PreviewHeader({
  viewMode,
  onViewModeChange,
  onClose,
  currentIndex,
  totalItems,
  onNavigate,
  isFullScreen,
  onToggleFullScreen,
}: PreviewHeaderProps) {
  const getModeIcon = () => {
    switch (viewMode) {
      case "side":
        return <PanelRight className="h-4 w-4" />;
      case "center":
        return <SquareSquare className="h-4 w-4" />;
      case "full":
        return <Maximize className="h-4 w-4" />;
    }
  };

  const getModeLabel = () => {
    switch (viewMode) {
      case "side":
        return "Side peek";
      case "center":
        return "Center peek";
      case "full":
        return "Full page";
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-2">
      <div className="flex items-center space-x-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-1.5 font-medium" onClick={onClose}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close preview</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-1.5 font-medium" onClick={onToggleFullScreen}>
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullScreen ? "Exit full screen" : "Enter full screen"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="rotate-90 text-gray-300 font-thin text-xs">
          <MinusIcon className="h-3 w-3" />
        </div>

        {!isFullScreen ? (
          <>
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-1.5 text-xs font-medium">
                        <div className="flex items-center gap-1">
                          {getModeIcon()}
                          <span className="hidden sm:inline-block text-xs">{getModeLabel()}</span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Change view mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="start" className="w-40 text-nowrap">
                <DropdownMenuItem onClick={() => onViewModeChange("side")}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <PanelRight className="h-4 w-4" />
                      <span>Side peek</span>
                    </div>
                    {viewMode === "side" && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewModeChange("center")}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <SquareSquare className="h-4 w-4" />
                      <span>Center peek</span>
                    </div>
                    {viewMode === "center" && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewModeChange("full")}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Maximize className="h-4 w-4" />
                      <span>Full page</span>
                    </div>
                    {viewMode === "full" && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="rotate-90 text-gray-300 font-thin text-xs">
              <MinusIcon className="h-3 w-3" />
            </div>
          </>
        ) : null}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-1.5 font-medium"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous item</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-1.5 font-medium"
                onClick={handleNext}
                disabled={currentIndex === totalItems - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next item</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {totalItems > 1 && (
          <div className="ml-2 text-xs text-muted-foreground">
            {currentIndex + 1} / {totalItems}
          </div>
        )}
      </div>
    </div>
  );
}
