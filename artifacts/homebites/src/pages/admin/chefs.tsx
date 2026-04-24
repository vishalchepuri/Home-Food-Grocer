import { useState } from "react";
import {
  useAdminListChefs,
  useAdminCreateChef,
  useAdminUpdateChef,
  useAdminDeleteChef,
  getAdminListChefsQueryKey,
  getGetAdminStatsQueryKey,
  type Chef,
  type UpsertChefRequest,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const EMPTY: UpsertChefRequest = {
  name: "",
  tagline: "",
  cuisine: "",
  rating: 4.5,
  etaMinutes: 30,
  deliveryFee: 0,
  imageUrl: "",
  location: "",
  priceForTwo: 300,
  isVeg: false,
  featured: false,
};

export default function AdminChefs() {
  const { data, isLoading } = useAdminListChefs();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Chef | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl">Chefs</h1>
          <p className="text-muted-foreground mt-1">
            Add, edit and remove home chefs
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add chef
            </Button>
          </DialogTrigger>
          <ChefFormDialog
            chef={editing}
            onClose={() => {
              setOpen(false);
              setEditing(null);
            }}
          />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((c) => (
            <ChefCard
              key={c.id}
              chef={c}
              onEdit={() => {
                setEditing(c);
                setOpen(true);
              }}
            />
          ))}
          {data && data.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              No chefs yet — add your first one
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ChefCard({ chef, onEdit }: { chef: Chef; onEdit: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const del = useAdminDeleteChef({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getAdminListChefsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: "Chef removed" });
      },
      onError: (err) =>
        toast({
          title: "Could not delete",
          description: (err as Error).message,
          variant: "destructive",
        }),
    },
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div
        className="h-36 bg-cover bg-center"
        style={{ backgroundImage: `url(${chef.imageUrl})` }}
      />
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-1 gap-2">
          <h3 className="font-display font-bold leading-tight">{chef.name}</h3>
          {chef.featured ? (
            <span className="text-[10px] uppercase font-bold bg-orange-100 text-primary px-2 py-0.5 rounded">
              Featured
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {chef.tagline}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
          <span>{chef.cuisine}</span>
          <span>·</span>
          <span>★ {chef.rating}</span>
          <span>·</span>
          <span>{chef.etaMinutes} min</span>
        </div>
        <div className="mt-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onEdit}
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {chef.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the chef from the catalog.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => del.mutate({ id: chef.id })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function ChefFormDialog({
  chef,
  onClose,
}: {
  chef: Chef | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<UpsertChefRequest>(
    chef
      ? {
          name: chef.name,
          tagline: chef.tagline,
          cuisine: chef.cuisine,
          rating: chef.rating,
          etaMinutes: chef.etaMinutes,
          deliveryFee: chef.deliveryFee,
          imageUrl: chef.imageUrl,
          location: chef.location,
          priceForTwo: chef.priceForTwo,
          isVeg: chef.isVeg,
          featured: chef.featured ?? false,
        }
      : EMPTY,
  );

  const onSettled = () => {
    qc.invalidateQueries({ queryKey: getAdminListChefsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    onClose();
  };

  const create = useAdminCreateChef({
    mutation: {
      onSuccess: () => {
        toast({ title: "Chef added" });
        onSettled();
      },
      onError: (err) =>
        toast({
          title: "Failed",
          description: (err as Error).message,
          variant: "destructive",
        }),
    },
  });
  const update = useAdminUpdateChef({
    mutation: {
      onSuccess: () => {
        toast({ title: "Chef updated" });
        onSettled();
      },
      onError: (err) =>
        toast({
          title: "Failed",
          description: (err as Error).message,
          variant: "destructive",
        }),
    },
  });

  const isPending = create.isPending || update.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chef) update.mutate({ id: chef.id, data: form });
    else create.mutate({ data: form });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{chef ? `Edit ${chef.name}` : "Add chef"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <Field label="Name" className="col-span-2">
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Tagline" className="col-span-2">
          <Input
            required
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </Field>
        <Field label="Cuisine">
          <Input
            required
            value={form.cuisine}
            onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </Field>
        <Field label="Image URL" className="col-span-2">
          <Input
            required
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </Field>
        <Field label="Rating (0-5)">
          <Input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: parseFloat(e.target.value) })
            }
          />
        </Field>
        <Field label="ETA (minutes)">
          <Input
            type="number"
            min="0"
            value={form.etaMinutes}
            onChange={(e) =>
              setForm({ ...form, etaMinutes: parseInt(e.target.value, 10) })
            }
          />
        </Field>
        <Field label="Delivery fee (₹)">
          <Input
            type="number"
            min="0"
            value={form.deliveryFee}
            onChange={(e) =>
              setForm({ ...form, deliveryFee: parseInt(e.target.value, 10) })
            }
          />
        </Field>
        <Field label="Price for two (₹)">
          <Input
            type="number"
            min="0"
            value={form.priceForTwo}
            onChange={(e) =>
              setForm({ ...form, priceForTwo: parseInt(e.target.value, 10) })
            }
          />
        </Field>
        <div className="col-span-2 flex items-center gap-6 py-2">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={form.isVeg}
              onCheckedChange={(v) => setForm({ ...form, isVeg: v })}
            />
            Pure veg
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={!!form.featured}
              onCheckedChange={(v) => setForm({ ...form, featured: v })}
            />
            Featured on home
          </label>
        </div>
        <DialogFooter className="col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : chef ? "Save changes" : "Add chef"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
