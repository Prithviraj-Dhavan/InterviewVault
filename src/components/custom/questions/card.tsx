import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Question } from "@/db/schema/questions";
import { VoteButton, type VoteSummary } from "./vote-button";

type QuestionCardProps = {
  question: Omit<
    Question,
    "isDeleted" | "companyId" | "updatedAt" | "createdAt"
  > & {
    createdAt: string;
    postedByImage: string | null;
    companyName: string | null;
  };
  votes?: VoteSummary;
};

export function QuestionCard({ question, votes }: QuestionCardProps) {
  return (
    <Card className="group transition-transform duration-300 hover:scale-[102%]">
      <CardHeader>
        <h2 className="line-clamp-1 font-semibold text-lg transition-colors duration-300 group-hover:text-primary">
          {question.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
          {question.description}
        </p>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <Badge>{question.companyName ?? "Not Available"}</Badge>
        <VoteButton questionId={question.id} summary={votes} />
        {/*<div className="flex items-center space-x-2">
          {tags.map((tag) => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>*/}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2 rounded-md border px-4 py-2">
          <Avatar>
            <AvatarImage
              alt="posted-by-image"
              src={question.postedByImage || "/placeholder.png"}
            />
            <AvatarFallback>
              {question.postedBy
                ? question.postedBy
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)
                : "?"}
            </AvatarFallback>
          </Avatar>
          <p className="text-muted-foreground text-sm">{question.postedBy}</p>
        </div>
        <Link href={`/questions/${question.id}`}>
          <Button variant="secondary">
            Details <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
