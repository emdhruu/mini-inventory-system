import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock3,
  Package,
  X,
  User,
  CalendarDays,
  Hash,
} from "lucide-react";

import {
  cancelOrder,
  confirmOrder,
  getOrderById,
} from "../../api/order.api";

import type {
  Order,
  OrderStatus,
} from "../../types/order";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await getOrderById(id);

      setOrder(response.data);
    } catch {
      setError("Unable to load order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleConfirm = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      "Confirm this order? Stock will be reduced."
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await confirmOrder(order._id);

      setOrder(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to confirm order.";

      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await cancelOrder(order._id);

      setOrder(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to cancel order.";

      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading order...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Orders
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error || "Order not found."}
        </div>
      </div>
    );
  }

  const customer =
    typeof order.customer === "string"
      ? null
      : order.customer;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            title="Back to orders"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Order #{order._id.slice(-6).toUpperCase()}
              </h1>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClasses[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Order details and product information
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {order.status === "pending" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={17} />
              Confirm
            </button>
          )}

          {order.status !== "cancelled" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={17} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <User size={20} />
            </div>

            <h2 className="font-semibold text-slate-800">
              Customer
            </h2>
          </div>

          {customer ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">
                  Name
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {customer.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Email
                </p>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {customer.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {customer.phone}
                </p>
              </div>

              {customer.address && (
                <div>
                  <p className="text-xs text-slate-400">
                    Address
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {customer.address}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Customer information unavailable.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 font-semibold text-slate-800">
            Order Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Hash
                size={18}
                className="mt-0.5 text-slate-400"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Order ID
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-700">
                  {order._id}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays
                size={18}
                className="mt-0.5 text-slate-400"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Created
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {new Date(
                    order.createdAt
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock3
                size={18}
                className="mt-0.5 text-slate-400"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Updated
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {new Date(
                    order.updatedAt
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Package size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Order Items
              </h2>

              <p className="text-sm text-slate-500">
                {order.items.length} product
                {order.items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subtotal
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, index) => (
                <tr key={`${item.sku}-${index}`}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">
                      {item.name}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {item.sku}
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-slate-600">
                    {formatCurrency(item.price)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="border-t border-slate-200 bg-slate-50">
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-5 text-right text-sm font-medium text-slate-600"
                >
                  Total
                </td>

                <td className="px-6 py-5 text-right text-lg font-bold text-slate-900">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;