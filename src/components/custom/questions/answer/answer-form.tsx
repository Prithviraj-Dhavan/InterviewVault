"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";

export default function AnswerForm({ questionId }: { questionId: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const { mutate } = trpc.answers.create.useMutation({
    onSuccess: () => {
      toast.success("Answered question successfully");
      setIsVisible(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const content = formData.get("content") as string;
    mutate({ questionId, content });
  };

  return (
    isVisible && (
      <form className="flex flex-col gap-4 py-4" onSubmit={handleSubmit}>
        <Textarea
          name="content"
          placeholder="Write your answer here... (You can also use markdown for better formatting)"
        />
        <Button className="self-end" type="submit" variant="secondary">
          Submit
        </Button>
      </form>
    )
  );
}
