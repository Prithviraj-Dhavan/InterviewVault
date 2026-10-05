"use client";

import { LogOut, Shield, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "../ui/avatar";
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
  { name: "Dashboard", href: "/dashboard" },
  { name: "Questions", href: "/questions" },
  { name: "Practice", href: "/practice" },
];

const WHITESPACE = /\s+/;

function initials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(WHITESPACE);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
    return (first + last).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return "?";
}

function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 40%)`;
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

  const { name, email } = session.user;
  const identifier = name || email || "?";
  const bgColor = getAvatarColor(identifier);
  const initialsText = initials(name, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="rounded-full outline-none ring-primary focus-visible:ring-2"
          type="button"
        >
          <Avatar>
            <AvatarFallback
              style={{ backgroundColor: bgColor, color: "white", fontWeight: 500 }}
            >
              {initialsText}
            </AvatarFallback>
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
          <LogOut className="size-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavLinks() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, [session]);

  const baseLinks: LinkItem[] = [
    { name: "Questions", href: "/questions" },
  ];

  // While loading admin state, show a generic dashboard link
  const finalLinks = [
    {
      name: isAdmin ? "Admin Console" : "Dashboard",
      href: isAdmin ? "/admin" : "/dashboard",
    },
    ...baseLinks,
    {
      name: isAdmin ? "Interviews" : "Practice",
      href: "/practice",
    }
  ];

  return (
    <>
      {finalLinks.map((link) => (
        <Link href={link.href} key={link.href}>
          <span className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            {link.name === "Admin Console" && <Shield className="h-3.5 w-3.5 text-primary" />}
            {link.name}
          </span>
        </Link>
      ))}
    </>
  );
}

function MobileMenu() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, [session]);

  const baseLinks: LinkItem[] = [
    { name: "Questions", href: "/questions" },
  ];

  const finalLinks = [
    {
      name: isAdmin ? "Admin Console" : "Dashboard",
      href: isAdmin ? "/admin" : "/dashboard",
    },
    ...baseLinks,
    {
      name: isAdmin ? "Interviews" : "Practice",
      href: "/practice",
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {finalLinks.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href} className="w-full flex items-center gap-2 cursor-pointer">
              {link.name === "Admin Console" && <Shield className="h-4 w-4 text-primary" />}
              {link.name}
            </Link>
          </DropdownMenuItem>
        ))}
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
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex items-center gap-4 mr-2">
          <NavLinks />
        </div>
        <div className="flex md:hidden">
          <MobileMenu />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
