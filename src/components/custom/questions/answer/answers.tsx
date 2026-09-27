"use client";

import { useState } from "react";
import { Streamdown } from "streamdown";
import { Loading } from "@/components/custom/loading";
import { UserProfile } from "@/components/custom/user/profile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { trpc } from "@/trpc/client";
import AnswerForm from "./answer-form";
import { Evaluation } from "./evaluation";

type AnswersProp = {
  question: {
    id: string;
    title: string;
    description: string;
  };
};
export default function Answers({ question }: AnswersProp) {
  const { data: res, status } = trpc.answers.get.useQuery({
    questionId: question.id,
  });
  const [visible, setVisible] = useState(false);

  if (status === "pending") {
    return <Loading />;
  }

  if (status === "error" || !res) {
    return (
      <div className="flex h-96 items-center justify-center text-rose-400 text-xl tracking-tighter selection:bg-rose-100 selection:text-rose-700 md:text-3xl lg:text-4xl">
        Something went wrong
      </div>
    );
  }

  return (
    <>
      <div className="border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="mr-2 font-semibold text-lg md:text-xl">
            Answers By Community
          </h3>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600"
            onClick={() => setVisible((prev) => !prev)}
          >
            Answer
          </Button>
        </div>
      </div>
      <div className="min-h-24 border-y px-4 py-3">
        {visible && <AnswerForm questionId={question.id} />}
        {res.data.length === 0 ? (
          <div className="flex h-96 items-center justify-center text-emerald-400 text-xl tracking-tighter selection:bg-emerald-100 selection:text-emerald-700 md:text-3xl lg:text-4xl">
            No answers yet maybe you can help
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {res.data.map((answer) => (
              <Card key={answer.id}>
                <CardHeader>
                  <UserProfile
                    className="max-w-72"
                    userImage={answer.userImage}
                    userName={answer.userName}
                  />
                </CardHeader>
                <CardContent>
                  <Streamdown>{answer.content}</Streamdown>
                </CardContent>
                <CardFooter className="flex">
                  <Accordion
                    className="w-full rounded-md border px-4 py-1"
                    collapsible
                    type="single"
                  >
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-[0.9rem]">
                        AI Evaluation
                      </AccordionTrigger>
                      <AccordionContent>
                        <Evaluation answer={answer} question={question} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
