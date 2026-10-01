import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  ShoppingCart,
} from "lucide-react";

import { getCustomers } from "../../api/customer.api";
import { getProducts } from "../../api/product.api";
import { createOrder } from "../../api/order.api";

import type { Customer } from "../../types/customer";
import type { Product } from "../../types/product";
import type {
  CreateOrderItem,
} from "../../types/order";

interface OrderRow extends CreateOrderItem {
  rowId: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const OrderForm = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [customerId, setCustomerId] = useState("");

  const [items, setItems] = useState<OrderRow[]>([
    {
      rowId: Date.now(),
      product: "",
      quantity: 1,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        setError("");

        const [customersResponse, productsResponse] =
          await Promise.all([
            getCustomers(),
            getProducts({ status: "active" }),
          ]);

        setCustomers(customersResponse.data);
        setProducts(productsResponse.data);
      } catch {
        setError(
          "Unable to load customers and products."
        );
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const getProduct = (productId: string) =>
    products.find((product) => product._id === productId);

  const updateItem = (
    rowId: number,
    field: keyof CreateOrderItem,
    value: string | number
  ) => {
    setItems((previous) =>
      previous.map((item) =>
        item.rowId === rowId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      {
        rowId: Date.now() + Math.random(),
        product: "",
        quantity: 1,
      },
    ]);
  };

  const removeItem = (rowId: number) => {
    setItems((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter((item) => item.rowId !== rowId);
    });
  };

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      const product = getProduct(item.product);

      if (!product) return total;

      return total + product.price * item.quantity;
    }, 0);
  }, [items, products]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (items.length === 0) {
      setError("Add at least one product.");
      return;
    }

    const invalidItem = items.find(
      (item) =>
        !item.product ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
    );

    if (invalidItem) {
      setError(
        "Every product must have a valid quantity."
      );
      return;
    }

    // Merge duplicate products before sending to backend.
    const mergedItems = new Map<string, number>();

    for (const item of items) {
      const currentQuantity =
        mergedItems.get(item.product) || 0;

      mergedItems.set(
        item.product,
        currentQuantity + item.quantity
      );
    }

    // Validate total requested quantity against
    // currently available frontend stock.
    for (const [productId, quantity] of mergedItems) {
      const product = getProduct(productId);

      if (!product) {
        setError("One of the selected products is invalid.");
        return;
      }

      if (quantity > product.stock) {
        setError(
          `${product.name} has only ${product.stock} item${
            product.stock !== 1 ? "s" : ""
          } available.`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        customer: customerId,
        items: Array.from(mergedItems.entries()).map(
          ([product, quantity]) => ({
            product,
            quantity,
          })
        ),
      };

      await createOrder(payload);

      navigate("/orders");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to create order.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading order form...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/orders"
          title="Back to orders"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
        >
          <ArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Create Order
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new customer order
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <ShoppingCart size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Customer
              </h2>

              <p className="text-sm text-slate-500">
                Select the customer for this order
              </p>
            </div>
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Customer
          </label>

          <select
            value={customerId}
            onChange={(event) =>
              setCustomerId(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select customer</option>

            {customers.map((customer) => (
              <option
                key={customer._id}
                value={customer._id}
              >
                {customer.name} — {customer.email}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-800">
                Products
              </h2>

              <p className="text-sm text-slate-500">
                Add one or more products to the order
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
            >
              <Plus size={17} />
              Add Product
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const product = getProduct(item.product);

              return (
                <div
                  key={item.rowId}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_160px_140px_44px] md:items-end">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Product {index + 1}
                      </label>

                      <select
                        value={item.product}
                        onChange={(event) =>
                          updateItem(
                            item.rowId,
                            "product",
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">
                          Select product
                        </option>

                        {products.map((product) => (
                          <option
                            key={product._id}
                            value={product._id}
                          >
                            {product.name} — ₹
                            {product.price} — Stock:{" "}
                            {product.stock}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            item.rowId,
                            "quantity",
                            Number(event.target.value)
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Subtotal
                      </label>

                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800">
                        {formatCurrency(
                          product
                            ? product.price * item.quantity
                            : 0
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      title="Remove product"
                      disabled={items.length === 1}
                      onClick={() =>
                        removeItem(item.rowId)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {product && (
                    <p className="mt-3 text-xs text-slate-500">
                      Available stock:{" "}
                      <span className="font-medium text-slate-700">
                        {product.stock}
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Order Total
            </span>

            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Product prices are captured by the backend when
            the order is created.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />

            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OrderForm;