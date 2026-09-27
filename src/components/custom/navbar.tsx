"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ModeToggle } from "./theme-toggle";

type LinkItem = { name: string; href: string };

const links: LinkItem[] = [
  { name: "Home", href: "/" },
  { name: "Questions", href: "/questions" },
  { name: "Practice", href: "/practice" },
];

const WHITESPACE = /\s+/;

function initials(name?: string | null) {
  if (!name) {
    return "?";
  }
  const parts = name.trim().split(WHITESPACE);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

function UserMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="size-9 animate-pulse rounded-full bg-muted" />;
  }

  if (!session) {
    return (
      <Link href="/sign-in">
        <Button>Sign In</Button>
      </Link>
    );
  }

  const { name, email, image } = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="rounded-full outline-none ring-primary focus-visible:ring-2"
          type="button"
        >
          <Avatar>
            <AvatarImage alt={name ?? "User"} src={image ?? undefined} />
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="font-normal text-muted-foreground text-xs">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between p-4">
      <Link href="/">
        <span className="bg-gradient-to-br from-primary/40 via-foreground to-primary/40 bg-clip-text font-semibold text-shadow text-transparent tracking-tighter md:text-xl">
          Interview Vault
        </span>
      </Link>
      <div className="flex items-center justify-between gap-4">
        {links.map((link) => (
          <Link href={link.href} key={link.href}>
            <span className="font-medium text-foreground hover:text-primary">
              {link.name}
            </span>
          </Link>
        ))}
        <div className="flex items-center justify-between gap-4">
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
