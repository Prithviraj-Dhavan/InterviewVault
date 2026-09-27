"use client";

import { Grid, Layers } from "lucide-react";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";

export function LayoutSelector() {
  const [layout, setLayout] = useQueryState("layout");

  return (
    <div className="flex max-w-24 rounded-lg bg-primary/10 px-2 py-1">
      <Button
        className="transition-all duration-300"
        onClick={() => setLayout("grid")}
        variant={layout === "grid" ? "secondary" : "ghost"}
      >
        <Grid />
      </Button>
      <Button
        className="transition-all duration-300"
        onClick={() => setLayout("flex")}
        variant={layout === "flex" ? "secondary" : "ghost"}
      >
        <Layers />
      </Button>
    </div>
  );
}
