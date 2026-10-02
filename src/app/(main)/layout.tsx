import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = (await auth.api.getSession({ headers: await headers() })) ?? { user: null };
  
  if (!user) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
