"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { createQuestion } from "@/actions/questions";
import { CompanySelect } from "@/components/custom/questions/select/company";
import { RoleSelect } from "@/components/custom/questions/select/role";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PostQuestionPage() {
  const [state, action, isPending] = useActionState(createQuestion, null);
  const router = useRouter();

  // Redirect once the server action has finished successfully.
  // (Checking `state` right after calling action() would still see the old value.)
  useEffect(() => {
    if (state?.status === "success") {
      router.push(`/questions/${state.data.id}`);
    }
  }, [state, router]);
  return (
    <div className="relative mx-auto flex h-full items-center justify-center border-x lg:w-5xl">
      <div className="-col-start-1 absolute left-[-20] row-span-full row-start-1 hidden h-full w-20 border-x border-x-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block md:block dark:[--pattern-fg:var(--color-white)]/10" />
      <div className="absolute right-[-20] col-start-1 row-span-full row-start-1 hidden h-full w-20 border-x border-x-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10" />
      <form action={action} className="mx-auto max-w-3xl rounded-lg border p-6">
        <FieldSet className="sm:min-w-xl">
          <FieldLegend>Post a Question</FieldLegend>
          <FieldDescription>
            Share the question with the community.
          </FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                autoComplete="off"
                defaultValue={state?.prevState?.title || ""}
                id="title"
                name="title"
                placeholder="What does the http statusCode 418 means ?"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                autoComplete="off"
                defaultValue={state?.prevState?.description || ""}
                id="description"
                name="description"
                placeholder="Describe the question in detail"
                required
              />
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field>
              <RoleSelect />
              <CompanySelect />
            </Field>
          </FieldGroup>
        </FieldSet>
        {state?.status === "failed" && (
          <p className="mt-4 text-red-500 text-sm" role="alert">
            {state.message}
          </p>
        )}
        <Button
          aria-disabled={isPending}
          className="mt-4 w-full"
          disabled={isPending}
          type="submit"
        >
          Post
        </Button>
      </form>
    </div>
  );
}
