import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, LogOut, Package, Shield, User as UserIcon } from "lucide-react";
import { useMe } from "@/hooks/use-me";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const { isSignedIn } = useAuth();
  return (
    <>
      {!isSignedIn ? (
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
      ) : (
        <SignedInMenu />
      )}
    </>
  );
}

function SignedInMenu() {
  const { user, logout } = useAuth();
  const { data: me } = useMe();

  const initials = (user?.displayName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full h-9 w-9 p-0 bg-primary/10 text-primary font-semibold hover:bg-primary/20"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
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
          <div className="font-semibold">{user?.displayName || "Your account"}</div>
          <div className="text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/orders">
          <DropdownMenuItem>
            <Package className="w-4 h-4 mr-2" />
            My orders
          </DropdownMenuItem>
        </Link>
        <Link href="/favorites">
          <DropdownMenuItem>
            <Heart className="w-4 h-4 mr-2" />
            Favorites
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
        <DropdownMenuItem>
          <UserIcon className="w-4 h-4 mr-2" />
          {user?.email || "Signed in"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            logout()
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
