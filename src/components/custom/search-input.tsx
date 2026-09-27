"use client";

import { SearchIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import type { ChangeEvent } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
export function SearchInput() {
  const [search, setSearch] = useQueryState("search");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value === "" ? null : e.target.value);
  };

  return (
    <InputGroup>
      <InputGroupInput
        onChange={handleChange}
        placeholder="Search..."
        value={search || ""}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
