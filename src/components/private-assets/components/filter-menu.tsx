import { useState } from "react";
import { ChartBarStacked, Check, ChevronDown, CircleUserRound, FileText, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getPdfAnalysisAuthors, getPdfAnalysisCategories, getPdfAnalysisSectors } from "@/lib/api/pdf-analysis";
import { useQuery } from "@tanstack/react-query";

interface FilterMenuProps {
  onFiltersChange?: (filters: {
    selectedAuthors: string[];
    selectedCategories: string[];
    selectedSectors: string[];
  }) => void;
}

export function FilterMenu({ onFiltersChange }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());

  const { data: authors = [] } = useQuery({
    queryKey: ["authors"],
    queryFn: getPdfAnalysisAuthors,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getPdfAnalysisCategories,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors"],
    queryFn: getPdfAnalysisSectors,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Transform the data into the required format
  const AUTHORS = authors.map((author: string) => ({ value: author, label: author }));
  const CATEGORIES = categories.map((category: string) => ({ value: category, label: category }));
  const SECTORS = sectors.map((sector: string) => ({ value: sector, label: sector }));

  const getSelectedItemsText = (selectedItems: Set<string>, items: Array<{ value: string; label: string }>) => {
    if (selectedItems.size === 0) return null;

    const selectedLabels = Array.from(selectedItems).map(
      (value) => items.find((item) => item.value === value)?.label || value
    );

    if (selectedLabels.length === 1) return selectedLabels[0];

    if (selectedLabels.length > 1) {
      const displayText = selectedLabels.slice(0, 1).join(", ");
      return `${displayText}, +${selectedLabels.length - 1}`;
    }

    return null;
  };

  const applyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({
        selectedAuthors: Array.from(selectedAuthors),
        selectedCategories: Array.from(selectedCategories),
        selectedSectors: Array.from(selectedSectors),
      });
    }
    setOpen(false);
  };

  const clearFilters = () => {
    setSelectedAuthors(new Set());
    setSelectedCategories(new Set());
    setSelectedSectors(new Set());

    if (onFiltersChange) {
      onFiltersChange({
        selectedAuthors: [],
        selectedCategories: [],
        selectedSectors: [],
      });
    }
  };

  const hasActiveFilters = selectedAuthors.size > 0 || selectedCategories.size > 0 || selectedSectors.size > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("pr-4", hasActiveFilters && "bg-accent text-accent-foreground")}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filter
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary w-4 h-4 text-[10px] flex items-center justify-center text-primary-foreground">
              {selectedAuthors.size + selectedCategories.size + selectedSectors.size}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-sm p-4" align="start">
        <h3 className="font-semibold mb-2 text-xs text-gray-800">Filter By:</h3>
        <div className="space-y-1 mb-3">
          <label className="text-sm font-medium">By Author</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between bg-white border-input">
                <div className="flex items-center justify-center gap-2">
                  <CircleUserRound className="h-4 w-4" />
                  <span className="text-muted-foreground">
                    {getSelectedItemsText(selectedAuthors, AUTHORS) || "Choose Author"}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command>
                <CommandInput placeholder="Search authors..." />
                <CommandList>
                  <CommandEmpty>No authors found.</CommandEmpty>
                  <CommandGroup>
                    {AUTHORS.map((author: { value: string; label: string }) => {
                      const isSelected = selectedAuthors.has(author.value);
                      return (
                        <CommandItem
                          key={author.value}
                          onSelect={() => {
                            const newSelectedAuthors = new Set(selectedAuthors);
                            if (isSelected) {
                              newSelectedAuthors.delete(author.value);
                            } else {
                              newSelectedAuthors.add(author.value);
                            }
                            setSelectedAuthors(newSelectedAuthors);
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{author.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1 mb-3">
          <label className="text-sm font-medium">By Category</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between bg-white border-input">
                <div className="flex items-center justify-center gap-2">
                  <ChartBarStacked className="h-4 w-4" />
                  <span className="text-muted-foreground">
                    {getSelectedItemsText(selectedCategories, CATEGORIES) || "Choose Category"}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {CATEGORIES.map((category: { value: string; label: string }) => {
                      const isSelected = selectedCategories.has(category.value);
                      return (
                        <CommandItem
                          key={category.value}
                          onSelect={() => {
                            const newSelectedCategories = new Set(selectedCategories);
                            if (isSelected) {
                              newSelectedCategories.delete(category.value);
                            } else {
                              newSelectedCategories.add(category.value);
                            }
                            setSelectedCategories(newSelectedCategories);
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{category.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1 mb-4">
          <label className="text-sm font-medium">By Sector</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between bg-white border-input">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-muted-foreground">
                    {getSelectedItemsText(selectedSectors, SECTORS) || "Choose Sector"}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command>
                <CommandInput placeholder="Search sectors..." />
                <CommandList>
                  <CommandEmpty>No sectors found.</CommandEmpty>
                  <CommandGroup>
                    {SECTORS.map((sector: { value: string; label: string }) => {
                      const isSelected = selectedSectors.has(sector.value);
                      return (
                        <CommandItem
                          key={sector.value}
                          onSelect={() => {
                            const newSelectedSectors = new Set(selectedSectors);
                            if (isSelected) {
                              newSelectedSectors.delete(sector.value);
                            } else {
                              newSelectedSectors.add(sector.value);
                            }
                            setSelectedSectors(newSelectedSectors);
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{sector.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
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
