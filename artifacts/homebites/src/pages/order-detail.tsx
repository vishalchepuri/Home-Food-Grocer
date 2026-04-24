import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CheckCircle2, MapPin, CreditCard, Clock, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0", 10);

  const { data: order, isLoading, error } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return <div className="text-center py-20">Order not found.</div>;
  }

  // If newly placed
  const isNew = order.status === "placed" && (new Date().getTime() - new Date(order.createdAt).getTime() < 5 * 60 * 1000);

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-2xl">
      {isNew && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-2xl text-green-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-green-700">Your order has been received and is being processed.</p>
        </div>
      )}

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-border/50 bg-muted/30">
          <div className="flex flex-wrap justify-between gap-4 items-start mb-4">
            <div>
              <h2 className="font-display font-bold text-xl">Order #{order.id}</h2>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4" /> {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-muted-foreground" /> Items
          </h3>
          <div className="space-y-4 mb-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg bg-muted border overflow-hidden shrink-0">
                  <img src={item.imageUrl} alt={item.name} className={item.kind === "product" ? "object-contain p-1 w-full h-full" : "object-cover w-full h-full"} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.unitPrice}</div>
                </div>
                <div className="font-semibold text-sm">₹{item.quantity * item.unitPrice}</div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" /> Delivery Address
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="font-medium text-foreground">{order.address.fullName}</div>
                <div>{order.address.line1}</div>
                {order.address.line2 && <div>{order.address.line2}</div>}
                <div>{order.address.city}, {order.address.pincode}</div>
                <div>Phone: {order.address.phone}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                <CreditCard className="w-4 h-4 text-muted-foreground" /> Payment Info
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Method: <span className="font-medium text-foreground uppercase">{order.paymentMethod}</span></div>
                <div>Status: <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>{order.paymentStatus}</span></div>
                {order.paymentReference && <div>Ref: {order.paymentReference}</div>}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            {order.tip > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip</span>
                <span>₹{order.tip}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-border font-bold text-lg">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
