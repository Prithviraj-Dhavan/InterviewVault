"use client";

import { useQueryState } from "nuqs";
import { FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Value = { id: string; name: string };
type QuestionSelectProps = {
  title: string;
  data:
    | {
        status: "success";
        message: string;
        data: Value[];
      }
    | { status: "failed"; message: string }
    | undefined;
  status: "pending" | "success" | "error";
};

export function QuestionsSelect({ title, data, status }: QuestionSelectProps) {
  const [value, setValue] = useQueryState(title.toLowerCase());

  let values: Value[] = [];

  if (data && data.status === "success") {
    values = data.data;
  }

  return (
    <>
      <Select
        disabled={status !== "success"}
        name={title.toLowerCase()}
        onValueChange={(val) => setValue(val === "all" ? null : val)}
        value={value || "all"}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={`Select a ${title}`} />
        </SelectTrigger>
        <SelectContent className="w-full sm:max-w-xl">
          <SelectGroup>
            <SelectLabel>{title}</SelectLabel>
            <SelectItem value="all">All</SelectItem>
            {values.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {status === "error" ||
        (data?.status === "failed" && (
          <FieldError errors={[{ message: data.message }]} />
        ))}
    </>
  );
}
