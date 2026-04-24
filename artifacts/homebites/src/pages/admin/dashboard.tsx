import { useGetAdminStats } from "@workspace/api-client-react";
import {
  Receipt,
  IndianRupee,
  ChefHat,
  ShoppingBasket,
  Loader2,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

function formatRupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Unable to load stats
      </div>
    );
  }

  const cards = [
    {
      label: "Total revenue",
      value: formatRupees(data.totalRevenue),
      icon: IndianRupee,
      tone: "bg-orange-100 text-primary",
    },
    {
      label: "Total orders",
      value: data.totalOrders.toLocaleString("en-IN"),
      icon: Receipt,
      tone: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active chefs",
      value: data.totalChefs.toLocaleString("en-IN"),
      icon: ChefHat,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Products listed",
      value: data.totalProducts.toLocaleString("en-IN"),
      icon: ShoppingBasket,
      tone: "bg-purple-100 text-purple-600",
    },
  ];

  const maxRevenue = Math.max(1, ...data.revenueByDay.map((d) => d.revenue));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Snapshot of your store's performance
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-card border border-border rounded-xl p-5 shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.tone}`}
            >
              <c.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-display font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg mb-4">
            Revenue (last 7 days)
          </h2>
          <div className="flex items-end gap-2 h-48">
            {data.revenueByDay.map((d) => {
              const date = new Date(d.day);
              const label = date.toLocaleDateString("en-IN", {
                weekday: "short",
              });
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium text-foreground">
                    {formatRupees(d.revenue)}
                  </div>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 min-h-[4px] transition-all"
                      style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {d.orders} orders
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg mb-4">
            Orders by status
          </h2>
          <div className="space-y-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between"
              >
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    STATUS_COLORS[status] ?? "bg-muted text-foreground"
                  }`}
                >
                  {STATUS_LABELS[status] ?? status}
                </span>
                <span className="font-semibold tabular-nums">{count}</span>
              </div>
            ))}
            {Object.keys(data.ordersByStatus).length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
