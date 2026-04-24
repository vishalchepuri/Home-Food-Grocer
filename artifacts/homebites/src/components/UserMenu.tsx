import { Link } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Package, Shield, User as UserIcon } from "lucide-react";
import { useMe } from "@/hooks/use-me";

export function UserMenu() {
  return (
    <>
      <Show when="signed-out">
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="font-medium">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="font-semibold">
              Sign up
            </Button>
          </Link>
        </div>
      </Show>
      <Show when="signed-in">
        <SignedInMenu />
      </Show>
    </>
  );
}

function SignedInMenu() {
  const { user } = useUser();
  const clerk = useClerk();
  const { data: me } = useMe();

  const initials =
    (user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? "U").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full h-9 w-9 p-0 bg-primary/10 text-primary font-semibold hover:bg-primary/20"
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={initials}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="font-semibold">{user?.fullName || "Your account"}</div>
          <div className="text-xs text-muted-foreground truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/orders">
          <DropdownMenuItem>
            <Package className="w-4 h-4 mr-2" />
            My orders
          </DropdownMenuItem>
        </Link>
        {me?.isAdmin ? (
          <Link href="/admin">
            <DropdownMenuItem>
              <Shield className="w-4 h-4 mr-2" />
              Admin portal
            </DropdownMenuItem>
          </Link>
        ) : null}
        <DropdownMenuItem onClick={() => clerk.openUserProfile()}>
          <UserIcon className="w-4 h-4 mr-2" />
          Manage account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            clerk.signOut({ redirectUrl: import.meta.env.BASE_URL })
          }
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
