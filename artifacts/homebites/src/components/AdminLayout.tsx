import { ReactNode } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { Show } from "@clerk/react";
import {
  LayoutDashboard,
  Receipt,
  ChefHat,
  ShoppingBasket,
  ArrowLeft,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-me";
import { useMutation } from "@tanstack/react-query";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/orders", label: "Orders", icon: Receipt },
  { href: "/chefs", label: "Chefs", icon: ChefHat },
  { href: "/products", label: "Products", icon: ShoppingBasket },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Show
      when="signed-in"
      fallback={
        <Show when="signed-out" fallback={<AdminLoading />}>
          <Redirect to="/sign-in" />
        </Show>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Show>
  );
}

function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

function AdminGate({ children }: { children: ReactNode }) {
  const { data: me, isLoading, refetch } = useMe();

  const bootstrap = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/me/claim-admin`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Bootstrap failed");
      }
      return res.json();
    },
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!me?.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-orange-100 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">
            Admin access required
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your account doesn't have admin privileges yet. If this is the very
            first admin for this app, you can claim it now.
          </p>
          {bootstrap.isError ? (
            <p className="text-sm text-destructive mb-4">
              {(bootstrap.error as Error).message}
            </p>
          ) : null}
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back home
              </Button>
            </Link>
            <Button
              onClick={() => bootstrap.mutate()}
              disabled={bootstrap.isPending}
            >
              {bootstrap.isPending ? "Claiming…" : "Claim admin"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

function AdminShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-[260px_1fr] bg-muted/30">
      <aside className="hidden md:flex flex-col bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold">
              H
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none">
                HomeBites
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Admin portal
              </div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const isActive = item.exact
              ? location === item.href
              : location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to store
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex flex-col min-h-[100dvh]">
        <div className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold">
              H
            </div>
            <span className="font-display font-bold">Admin</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-medium px-2 py-1 text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

