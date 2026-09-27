import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function UserProfile({
  userName,
  userImage,
  className,
}: {
  userName: string | null;
  userImage: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-sm items-center gap-3 overflow-hidden rounded-md border px-2 py-2",
        className
      )}
    >
      <Avatar>
        <AvatarImage
          alt={userName || "Deleted User"}
          src={userImage || "/placeholder.png"}
        />
        <AvatarFallback>{altName(userName || "")}</AvatarFallback>
      </Avatar>
      <p>{userName || "Deleted User"}</p>
    </div>
  );
}

function altName(userName: string) {
  return userName
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}
