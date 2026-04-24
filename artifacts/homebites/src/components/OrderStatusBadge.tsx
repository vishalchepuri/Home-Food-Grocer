import { OrderStatus } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  placed: { label: "Order Placed", className: "bg-blue-100 text-blue-800 border-blue-200" },
  preparing: { label: "Preparing", className: "bg-orange-100 text-orange-800 border-orange-200" },
  out_for_delivery: { label: "Out for Delivery", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  return (
    <Badge variant="outline" className={cn(config.className, "font-semibold", className)}>
      {config.label}
    </Badge>
  );
}
