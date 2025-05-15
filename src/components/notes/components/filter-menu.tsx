import { useState, useEffect } from "react";
import { ChartBarStacked, ChevronDown, CircleUserRound, FileText, Filter, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface FilterMenuProps {
  onFiltersChange?: (filters: {
    selectedFilterA: string[];
    selectedFilterB: string[];
    selectedFilterC: string[];
  }) => void;
  initialFilters?: {
    selectedFilterA: string[];
    selectedFilterB: string[];
    selectedFilterC: string[];
  };
}

export function FilterMenu({ onFiltersChange, initialFilters }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [selectedFilterA, setSelectedFilterA] = useState<Set<string>>(new Set(initialFilters?.selectedFilterA || []));
  const [selectedFilterB, setSelectedFilterB] = useState<Set<string>>(new Set(initialFilters?.selectedFilterB || []));
  const [selectedFilterC, setSelectedFilterC] = useState<Set<string>>(new Set(initialFilters?.selectedFilterC || []));

  const [appliedFilterA, setAppliedFilterA] = useState<Set<string>>(new Set(initialFilters?.selectedFilterA || []));
  const [appliedFilterB, setAppliedFilterB] = useState<Set<string>>(new Set(initialFilters?.selectedFilterB || []));
  const [appliedFilterC, setAppliedFilterC] = useState<Set<string>>(new Set(initialFilters?.selectedFilterC || []));

  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.selectedFilterA) {
        setSelectedFilterA(new Set(initialFilters.selectedFilterA));
        setAppliedFilterA(new Set(initialFilters.selectedFilterA));
      }
      if (initialFilters.selectedFilterB) {
        setSelectedFilterB(new Set(initialFilters.selectedFilterB));
        setAppliedFilterB(new Set(initialFilters.selectedFilterB));
      }
      if (initialFilters.selectedFilterC) {
        setSelectedFilterC(new Set(initialFilters.selectedFilterC));
        setAppliedFilterC(new Set(initialFilters.selectedFilterC));
      }
    }
  }, [initialFilters]);

  const applyFilters = () => {
    setAppliedFilterA(new Set(selectedFilterA));
    setAppliedFilterB(new Set(selectedFilterB));
    setAppliedFilterC(new Set(selectedFilterC));

    if (onFiltersChange) {
      onFiltersChange({
        selectedFilterA: Array.from(selectedFilterA),
        selectedFilterB: Array.from(selectedFilterB),
        selectedFilterC: Array.from(selectedFilterC),
      });
    }
    setOpen(false);
  };

  const clearFilters = () => {
    setSelectedFilterA(new Set());
    setSelectedFilterB(new Set());
    setSelectedFilterC(new Set());

    setAppliedFilterA(new Set());
    setAppliedFilterB(new Set());
    setAppliedFilterC(new Set());

    if (onFiltersChange) {
      onFiltersChange({
        selectedFilterA: [],
        selectedFilterB: [],
        selectedFilterC: [],
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className={cn("pr-4")}>
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <div className="flex flex-wrap gap-2">
            {Array.from(appliedFilterA).map((filterA) => (
              <Badge
                key={`filterA-${filterA}`}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 h-8 bg-neutral-100 hover:bg-neutral-100 text-neutral-800"
              >
                <Tag className="h-4 w-4 text-neutral-800 mr-1" />
                {filterA}
                <X
                  className="h-3.5 w-3.5 cursor-pointer ml-1 text-neutral-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Remove from both applied and selected sets
                    const newAppliedFilterA = new Set(appliedFilterA);
                    newAppliedFilterA.delete(filterA);
                    setAppliedFilterA(newAppliedFilterA);

                    const newSelectedFilterA = new Set(selectedFilterA);
                    newSelectedFilterA.delete(filterA);
                    setSelectedFilterA(newSelectedFilterA);

                    if (onFiltersChange) {
                      onFiltersChange({
                        selectedFilterA: Array.from(newAppliedFilterA),
                        selectedFilterB: Array.from(appliedFilterB),
                        selectedFilterC: Array.from(appliedFilterC),
                      });
                    }
                  }}
                />
              </Badge>
            ))}
            {Array.from(appliedFilterB).map((filterB) => (
              <Badge
                key={`filterB-${filterB}`}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 h-8 bg-neutral-100 hover:bg-neutral-100 text-neutral-800"
              >
                <Tag className="h-4 w-4 text-neutral-800 mr-1" />
                {filterB}
                <X
                  className="h-3.5 w-3.5 cursor-pointer ml-1 text-neutral-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newAppliedFilterB = new Set(appliedFilterB);
                    newAppliedFilterB.delete(filterB);
                    setAppliedFilterB(newAppliedFilterB);

                    const newSelectedFilterB = new Set(selectedFilterB);
                    newSelectedFilterB.delete(filterB);
                    setSelectedFilterB(newSelectedFilterB);

                    if (onFiltersChange) {
                      onFiltersChange({
                        selectedFilterA: Array.from(appliedFilterA),
                        selectedFilterB: Array.from(newAppliedFilterB),
                        selectedFilterC: Array.from(appliedFilterC),
                      });
                    }
                  }}
                />
              </Badge>
            ))}
            {Array.from(appliedFilterC).map((filterC) => (
              <Badge
                key={`filterC-${filterC}`}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 h-8 bg-neutral-100 hover:bg-neutral-100 text-neutral-800"
              >
                <Tag className="h-4 w-4 text-neutral-800 mr-1" />
                {filterC}
                <X
                  className="h-3.5 w-3.5 cursor-pointer ml-1 text-neutral-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newAppliedFilterC = new Set(appliedFilterC);
                    newAppliedFilterC.delete(filterC);
                    setAppliedFilterC(newAppliedFilterC);

                    const newSelectedFilterC = new Set(selectedFilterC);
                    newSelectedFilterC.delete(filterC);
                    setSelectedFilterC(newSelectedFilterC);

                    if (onFiltersChange) {
                      onFiltersChange({
                        selectedFilterA: Array.from(appliedFilterA),
                        selectedFilterB: Array.from(appliedFilterB),
                        selectedFilterC: Array.from(newAppliedFilterC),
                      });
                    }
                  }}
                />
              </Badge>
            ))}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="max-w-sm p-4" align="start">
        <h3 className="font-semibold mb-2 text-xs text-neutral-800">Filter By:</h3>
        <div className="space-y-1 mb-3">
          <label className="text-sm font-medium">By Filter A</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between bg-white border-input">
                <div className="flex items-center justify-center gap-2">
                  <CircleUserRound className="h-4 w-4" />
                  <span className="text-muted-foreground">{"Choose Filter A"}</span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command>
                <CommandInput placeholder="Search authors..." />
                <CommandList>
                  <CommandEmpty>No Filter A options found.</CommandEmpty>
                  <CommandGroup></CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1 mb-3">
          <label className="text-sm font-medium">By Filter B</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between bg-white border-input">
                <div className="flex items-center justify-center gap-2">
                  <ChartBarStacked className="h-4 w-4" />
                  <span className="text-muted-foreground">{"Choose Filter B"}</span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No Filter B options found.</CommandEmpty>
                  <CommandGroup></CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1 mb-4">
          <label className="text-sm font-medium">By Filter C</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between bg-white border-input">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-muted-foreground">{"Choose Filter C"}</span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command>
                <CommandInput placeholder="Search sectors..." />
                <CommandList>
                  <CommandEmpty>No Filter C options found.</CommandEmpty>
                  <CommandGroup></CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="px-3" onClick={clearFilters}>
            Clear Selection
          </Button>
          <Button size="sm" className="bg-black text-white hover:bg-black/90 px-4" onClick={applyFilters}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
