import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useDeviceId } from "@/hooks/use-device-id";
import { Link } from "wouter";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { ChevronRight, Package, Calendar } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { format } from "date-fns";

export default function OrdersPage() {
  const deviceId = useDeviceId();
  const { data: orders, isLoading } = useListOrders(
    { deviceId },
    { query: { enabled: !!deviceId, queryKey: getListOrdersQueryKey({ deviceId }) } }
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-3xl">
      <h1 className="font-display font-bold text-3xl mb-8">Your Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : orders?.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border">
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No orders yet"
            description="You haven't placed any orders. Start exploring local chefs and groceries!"
            actionLabel="Start Shopping"
            actionHref="/"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-colors cursor-pointer shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                    </div>
                    <div className="font-semibold text-lg">Order #{order.id}</div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                
                <div className="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="shrink-0 w-12 h-12 bg-muted rounded-lg overflow-hidden border border-border">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {order.items.length > 0 && (
                    <div className="text-sm text-muted-foreground ml-2 font-medium">
                      {order.items.length} items
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border/50">
                  <div className="font-bold">₹{order.total}</div>
                  <div className="flex items-center text-sm font-medium text-primary group-hover:underline">
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
