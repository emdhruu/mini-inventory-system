import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { createProduct, getProductById, updateProduct } from "../../api/product.api";
import type { ProductPayload, ProductStatus } from "../../types/product";

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<ProductPayload>({
    name: "",
    sku: "",
    price: 0,
    stock: 0,
    category: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setFetching(true);
        setError("");

        const response = await getProductById(id);

        const product = response.data;

        setFormData({
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
          category: product.category,
          status: product.status,
        });
      } catch {
        setError("Unable to load product.");
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (
    field: keyof ProductPayload,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!formData.category.trim()) {
      setError("Category is required.");
      return;
    }

    if (formData.price < 0) {
      setError("Price cannot be negative.");
      return;
    }

    if (formData.stock < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateProduct(id, {
          ...formData,
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          category: formData.category.trim(),
        });
      } else {
        await createProduct({
          ...formData,
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          category: formData.category.trim(),
        });
      }

      navigate("/products");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to save product.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading product...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/products"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          title="Back to products"
        >
          <ArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? "Update product information"
              : "Add a new product to your inventory"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Product Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              placeholder="Enter product name"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              SKU
            </label>

            <input
              type="text"
              value={formData.sku}
              onChange={(e) =>
                handleChange("sku", e.target.value)
              }
              placeholder="e.g. WM-001"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>

            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                handleChange("category", e.target.value)
              }
              placeholder="e.g. Electronics"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Price (₹)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                handleChange(
                  "price",
                  Number(e.target.value)
                )
              }
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Stock
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={formData.stock}
              onChange={(e) =>
                handleChange(
                  "stock",
                  Number(e.target.value)
                )
              }
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={formData.status}
              onChange={(e) =>
                handleChange(
                  "status",
                  e.target.value as ProductStatus
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link to="/products" className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            <Save size={18} />

            {loading
              ? "Saving..."
              : isEditMode
                ? "Update Product"
                : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;