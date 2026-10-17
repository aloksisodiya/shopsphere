import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/client";
import Spinner from "../components/Spinner.jsx";
import { formatDate, formatPrice, onImageError, statusStyles } from "../utils.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/orders/my")
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      const updated = await api(`/orders/${id}/cancel`, { method: "POST" });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">No orders yet</h1>
        <p className="mt-2 text-slate-500">When you place an order, it will show up here.</p>
        <Link to="/" className="btn-primary mt-6">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Your orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">Order #{order.id.slice(-6).toUpperCase()}</p>
                <p className="text-slate-500">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
                  {order.status}
                </span>
                <span className="font-bold">{formatPrice(order.total)}</span>
              </div>
            </div>

            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 px-5 py-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    onError={onImageError}
                    className="h-14 w-14 rounded-lg bg-slate-100 object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-slate-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-sm">
              <p className="text-slate-500">
                <span className="font-medium text-slate-700">Ship to:</span> {order.shippingAddress}
              </p>
              {order.status === "PLACED" && (
                <button onClick={() => cancel(order.id)} className="text-red-600 hover:underline">
                  Cancel order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
