import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboard.api";
import type { DashboardData } from "../types/dashboard";
import { Boxes, IndianRupee, Package, ShoppingCart } from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboard();
        setData(response.data);
      } catch {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    {
    label: "Total Products",
    value: data?.totalProducts ?? 0,
    icon: Package,
    },
    {
    label: "Total Orders",
    value: data?.totalOrders ?? 0,
    icon: ShoppingCart,
    },
    {
    label: "Total Stock",
    value: data?.totalStock ?? 0,
    icon: Boxes,
    },
    {
    label: "Total Sales",
    value: formatCurrency(data?.totalSales ?? 0),
    icon: IndianRupee,
    },
    ];

    if (loading) {
        return <p className="text-slate-500">Loading dashboard...</p>;
    }

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your inventory and orders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg`}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
              </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        )})}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Recent Orders</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {data?.recentOrders.map((order) => {
                const customer =
                  typeof order.customer === "string"
                    ? order.customer
                    : order.customer?.name ?? "Unknown";

                return (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-800">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{customer}</td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          order.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                );
              })}

              {!data?.recentOrders.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;