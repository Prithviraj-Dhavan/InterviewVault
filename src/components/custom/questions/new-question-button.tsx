"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export function NewQuestionButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (!session) {
      router.push("/sign-in");
    } else {
      router.push("/questions/new");
    }
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      New
    </Button>
  );
}
