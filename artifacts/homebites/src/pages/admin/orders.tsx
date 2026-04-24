import { useState } from "react";
import {
  useAdminListOrders,
  useAdminUpdateOrderStatus,
  getAdminListOrdersQueryKey,
  getGetAdminStatsQueryKey,
  type Order,
  UpdateOrderStatusRequestStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const STATUSES = Object.values(UpdateOrderStatusRequestStatus);

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

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useAdminListOrders(
    statusFilter === "all" ? undefined : { status: statusFilter },
  );
  const updateStatus = useAdminUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
        qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: "Order updated" });
      },
      onError: (err) =>
        toast({
          title: "Update failed",
          description: String((err as Error).message),
          variant: "destructive",
        }),
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage every order across the store
          </p>
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No orders found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">
                    #{o.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">
                      {o.address.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {o.address.phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {o.items.length} items
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatRupees(o.total)}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs uppercase font-medium">
                      {o.paymentMethod}
                    </div>
                    <div
                      className={`text-xs ${
                        o.paymentStatus === "paid"
                          ? "text-emerald-600"
                          : o.paymentStatus === "failed"
                          ? "text-rose-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {o.paymentStatus}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(v) =>
                        updateStatus.mutate({
                          id: o.id,
                          data: { status: v as never },
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-40">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            STATUS_COLORS[o.status] ?? ""
                          }`}
                        >
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <OrderDetailsDialog order={o} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function OrderDetailsDialog({ order }: { order: Order }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <div className="font-semibold mb-1">Delivery address</div>
            <div className="text-muted-foreground">
              {order.address.fullName}, {order.address.phone}
              <br />
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
              <br />
              {order.address.city}, {order.address.pincode}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Items</div>
            <div className="border border-border rounded-lg divide-y">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.kind} · qty {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatRupees(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRupees(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{formatRupees(order.deliveryFee)}</span>
            </div>
            {order.tip > 0 ? (
              <div className="flex justify-between">
                <span>Tip</span>
                <span>{formatRupees(order.tip)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatRupees(order.total)}</span>
            </div>
          </div>
          {order.notes ? (
            <div>
              <div className="font-semibold mb-1">Customer notes</div>
              <div className="text-muted-foreground italic">"{order.notes}"</div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
