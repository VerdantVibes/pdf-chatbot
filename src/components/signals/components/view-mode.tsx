import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid2X2, Rows3 } from "lucide-react";

interface ViewModeProps {
  onViewChange?: (view: "list" | "grid") => void;
}

export function ViewMode({ onViewChange }: ViewModeProps) {
  const handleViewChange = (value: string) => {
    if (onViewChange) {
      onViewChange(value as "list" | "grid");
    }
  };

  return (
    <Tabs defaultValue="list" onValueChange={handleViewChange} className="w-auto hidden md:block">
      <TabsList className="grid w-auto grid-cols-2 p-1 h-9 bg-gray-100 rounded-lg">
        <TabsTrigger
          value="list"
          className="h-full text-neutral-400 px-2.5 w-auto rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Rows3 className="h-[1.05rem] w-[1.05rem]" />
        </TabsTrigger>
        <TabsTrigger
          value="grid"
          className="h-full text-neutral-400 px-2 w-auto rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Grid2X2 className="h-[1rem] w-[1rem]" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
