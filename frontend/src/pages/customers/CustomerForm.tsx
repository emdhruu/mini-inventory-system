import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import {
  createCustomer,
  getCustomerById,
  updateCustomer,
} from "../../api/customer.api";

import type { CustomerPayload } from "../../types/customer";

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<CustomerPayload>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [fetching, setFetching] = useState(isEditMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchCustomer = async () => {
      try {
        setFetching(true);
        setError("");

        const response = await getCustomerById(id);
        const customer = response.data;

        setFormData({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address || "",
        });
      } catch {
        setError("Unable to load customer.");
      } finally {
        setFetching(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (
    field: keyof CustomerPayload,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const address = formData.address?.trim() || "";

    if (!name) {
      setError("Customer name is required.");
      return;
    }

    if (!email) {
      setError("Customer email is required.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!phone) {
      setError("Customer phone is required.");
      return;
    }

    try {
      setLoading(true);

      const payload: CustomerPayload = {
        name,
        email,
        phone,
        address,
      };

      if (isEditMode && id) {
        await updateCustomer(id, payload);
      } else {
        await createCustomer(payload);
      }

      navigate("/customers");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to save customer.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading customer...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/customers"
          title="Back to customers"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
        >
          <ArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Edit Customer" : "Add Customer"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? "Update customer information"
              : "Add a new customer"}
          </p>
        </div>
      </div>

      {/* Form */}
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
          {/* Name */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Customer Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                handleChange("name", event.target.value)
              }
              placeholder="Enter customer name"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={(event) =>
                handleChange("email", event.target.value)
              }
              placeholder="customer@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone
            </label>

            <input
              type="tel"
              value={formData.phone}
              onChange={(event) =>
                handleChange("phone", event.target.value)
              }
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>

            <textarea
              rows={4}
              value={formData.address || ""}
              onChange={(event) =>
                handleChange("address", event.target.value)
              }
              placeholder="Enter customer address"
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/customers"
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

            {loading
              ? "Saving..."
              : isEditMode
                ? "Update Customer"
                : "Create Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;