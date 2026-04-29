import { useState } from "react";
import {
  useAdminListProducts,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminDeleteProduct,
  useListCategories,
  getAdminListProductsQueryKey,
  getGetAdminStatsQueryKey,
  type Product,
  type UpsertProductRequest,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/lib/storage";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type LocationProduct = Product & { location?: string };
type LocationProductForm = UpsertProductRequest & { location: string };

const EMPTY: UpsertProductRequest = {
  name: "",
  description: "",
  price: 0,
  mrp: 0,
  unit: "",
  imageUrl: "",
  categoryId: 1,
  inStock: true,
  essential: false,
};

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminListProducts();
  const { data: categories } = useListCategories();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocationProduct | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [newLocation, setNewLocation] = useState("");
  const [customLocations, setCustomLocations] = useState<string[]>([]);

  const catName = (id: number) =>
    categories?.find((c) => c.id === id)?.name ?? `#${id}`;
  const locationProducts = (products ?? []) as LocationProduct[];
  const locations = Array.from(
    new Set([
      ...locationProducts.map((product) => product.location ?? "Hyderabad"),
      ...customLocations,
    ]),
  ).sort((a, b) => a.localeCompare(b));
  const visibleProducts =
    selectedLocation === "all"
      ? locationProducts
      : locationProducts.filter(
          (product) => (product.location ?? "Hyderabad") === selectedLocation,
        );

  const addLocation = () => {
    const trimmed = newLocation.trim();
    if (!trimmed) return;
    setCustomLocations((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed],
    );
    setSelectedLocation(trimmed);
    setNewLocation("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage grocery items and essentials
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
              Add product
            </Button>
          </DialogTrigger>
          <ProductFormDialog
            product={editing}
            categories={categories ?? []}
            locations={locations}
            defaultLocation={
              selectedLocation === "all" ? locations[0] : selectedLocation
            }
            onClose={() => {
              setOpen(false);
              setEditing(null);
            }}
          />
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Active location
            </Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Add new location
            </Label>
            <div className="flex gap-2">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Warangal, Hyderabad, Bangalore..."
              />
              <Button type="button" onClick={addLocation}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No products in this location yet. Add the first one.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  category={catName(p.categoryId)}
                  onEdit={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function ProductRow({
  product,
  category,
  onEdit,
}: {
  product: LocationProduct;
  category: string;
  onEdit: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const del = useAdminDeleteProduct({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: "Product removed" });
      },
      onError: (err) =>
        toast({
          title: "Failed",
          description: (err as Error).message,
          variant: "destructive",
        }),
    },
  });

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg bg-muted bg-cover bg-center flex-shrink-0"
            style={{ backgroundImage: `url(${product.imageUrl})` }}
          />
          <div>
            <div className="font-medium text-sm">{product.name}</div>
            <div className="text-xs text-muted-foreground">
              {product.unit} · {product.location ?? "Hyderabad"}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm">{category}</TableCell>
      <TableCell>
        <div className="font-semibold">₹{product.price}</div>
        {product.mrp > product.price ? (
          <div className="text-xs text-muted-foreground line-through">
            ₹{product.mrp}
          </div>
        ) : null}
      </TableCell>
      <TableCell>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            product.inStock
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {product.inStock ? "In stock" : "Out"}
        </span>
      </TableCell>
      <TableCell>
        {product.essential ? (
          <span className="text-[10px] uppercase font-bold bg-orange-100 text-primary px-2 py-0.5 rounded">
            Essential
          </span>
        ) : null}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the product.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => del.mutate({ id: product.id })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProductFormDialog({
  product,
  categories,
  locations,
  defaultLocation,
  onClose,
}: {
  product: LocationProduct | null;
  categories: { id: number; name: string }[];
  locations: string[];
  defaultLocation?: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<LocationProductForm>(
    product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          mrp: product.mrp,
          unit: product.unit,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          inStock: product.inStock,
          essential: product.essential ?? false,
          location: product.location ?? defaultLocation ?? "Hyderabad",
        }
      : {
          ...EMPTY,
          categoryId: categories[0]?.id ?? 1,
          location: defaultLocation ?? "Hyderabad",
        },
  );
  const [isUploading, setIsUploading] = useState(false);

  const onSettled = () => {
    qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    onClose();
  };

  const create = useAdminCreateProduct({
    mutation: {
      onSuccess: () => {
        toast({ title: "Product added" });
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
  const update = useAdminUpdateProduct({
    mutation: {
      onSuccess: () => {
        toast({ title: "Product updated" });
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

  const isPending = create.isPending || update.isPending || isUploading;

  const uploadProductImage = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file, "products");
      setForm((current) => ({ ...current, imageUrl }));
      toast({ title: "Image uploaded" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) update.mutate({ id: product.id, data: form });
    else create.mutate({ data: form });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {product ? `Edit ${product.name}` : "Add product"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <Field label="Name" className="col-span-2">
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Description" className="col-span-2">
          <Textarea
            required
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </Field>
        <Field label="Price (₹)">
          <Input
            type="number"
            min="0"
            required
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: parseInt(e.target.value, 10) })
            }
          />
        </Field>
        <Field label="MRP (₹)">
          <Input
            type="number"
            min="0"
            required
            value={form.mrp}
            onChange={(e) =>
              setForm({ ...form, mrp: parseInt(e.target.value, 10) })
            }
          />
        </Field>
        <Field label="Unit (e.g. 1kg, 500g)">
          <Input
            required
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Select
            value={form.location}
            onValueChange={(location) => setForm({ ...form, location })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Category">
          <Select
            value={String(form.categoryId)}
            onValueChange={(v) =>
              setForm({ ...form, categoryId: parseInt(v, 10) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Image" className="col-span-2">
          {form.imageUrl ? (
            <img
              src={form.imageUrl}
              alt=""
              className="mb-3 h-32 w-full rounded-lg object-cover"
            />
          ) : null}
          <Input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={(e) => void uploadProductImage(e.target.files?.[0])}
          />
          <Input
            required
            type="url"
            className="mt-2"
            placeholder="Firebase Storage download URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </Field>
        <div className="col-span-2 flex items-center gap-6 py-2">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={!!form.inStock}
              onCheckedChange={(v) => setForm({ ...form, inStock: v })}
            />
            In stock
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={!!form.essential}
              onCheckedChange={(v) => setForm({ ...form, essential: v })}
            />
            Daily essential
          </label>
        </div>
        <DialogFooter className="col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : product ? "Save changes" : "Add product"}
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
