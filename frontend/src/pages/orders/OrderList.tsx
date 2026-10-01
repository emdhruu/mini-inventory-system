import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Check,
  X,
  ShoppingCart,
} from "lucide-react";

import {
  cancelOrder,
  confirmOrder,
  getOrders,
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

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | "">("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrders(
        status || undefined
      );

      setOrders(response.data);
    } catch {
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const handleConfirm = async (id: string) => {
    const confirmed = window.confirm(
      "Confirm this order? Stock will be reduced."
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setError("");

      await confirmOrder(id);
      await fetchOrders();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to confirm order.";

      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm(
      "Cancel this order?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setError("");

      await cancelOrder(id);
      await fetchOrders();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to cancel order.";

      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const getCustomerName = (order: Order) => {
    if (typeof order.customer === "string") {
      return order.customer;
    }

    return order.customer.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer orders and inventory
          </p>
        </div>

        <Link
          to="/orders/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Order
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <span className="pl-10 text-sm text-slate-500">
              Filter orders
            </span>
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as OrderStatus | ""
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:ml-auto sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Order
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Products
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <ShoppingCart
                        size={40}
                        className="mb-3 text-slate-300"
                      />

                      <p className="font-medium text-slate-700">
                        No orders found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Create an order to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {getCustomerName(order)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-slate-700">
                          {order.items
                            .map(
                              (item) =>
                                `${item.name} × ${item.quantity}`
                            )
                            .join(", ")}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClasses[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/orders/${order._id}`}
                          title="View order"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Eye size={17} />
                        </Link>

                        {order.status === "pending" && (
                          <button
                            type="button"
                            title="Confirm order"
                            disabled={
                              actionLoading === order._id
                            }
                            onClick={() =>
                              handleConfirm(order._id)
                            }
                            className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check size={17} />
                          </button>
                        )}

                        {order.status !== "cancelled" && (
                          <button
                            type="button"
                            title="Cancel order"
                            disabled={
                              actionLoading === order._id
                            }
                            onClick={() =>
                              handleCancel(order._id)
                            }
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && orders.length > 0 && (
        <p className="text-sm text-slate-500">
          Showing {orders.length} order
          {orders.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export default OrderList;