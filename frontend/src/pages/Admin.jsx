import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import Spinner from "../components/Spinner.jsx";
import { STATUSES, formatDate, formatPrice, onImageError, statusStyles } from "../utils.js";

const emptyForm = { id: null, name: "", description: "", price: "", category: "", imageUrl: "", stock: "" };

export default function Admin() {
  const [tab, setTab] = useState("products");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Admin dashboard</h1>
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {["products", "orders"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "products" ? <ProductsTab /> : <OrdersTab />}
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api("/products", { auth: false })
      .then(setProducts)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const edit = (p) => {
    setForm({ ...p, price: String(p.price), stock: String(p.stock), description: p.description || "", imageUrl: p.imageUrl || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      imageUrl: form.imageUrl,
      stock: Number(form.stock),
    };
    try {
      if (form.id) {
        await api(`/products/${form.id}`, { method: "PUT", body });
        toast.success("Product updated");
      } else {
        await api("/products", { method: "POST", body });
        toast.success("Product created");
      }
      setForm(emptyForm);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api(`/products/${p.id}`, { method: "DELETE" });
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">{form.id ? "Edit product" : "Add product"}</h2>

        <div>
          <label className="label">Name</label>
          <input required value={form.name} onChange={update("name")} className="input" />
        </div>
        <div>
          <label className="label">Category</label>
          <input required value={form.category} onChange={update("category")} className="input" />
        </div>
        <div>
          <label className="label">Price (₹)</label>
          <input required type="number" min="0.01" step="0.01" value={form.price} onChange={update("price")} className="input" />
        </div>
        <div>
          <label className="label">Stock</label>
          <input required type="number" min="0" step="1" value={form.stock} onChange={update("stock")} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Image URL</label>
          <input value={form.imageUrl} onChange={update("imageUrl")} placeholder="https://..." className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea rows={3} value={form.description} onChange={update("description")} className="input" />
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : form.id ? "Save changes" : "Add product"}
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(emptyForm)} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt="" onError={onImageError} className="h-10 w-10 rounded-md bg-slate-100 object-cover" />
                      <span className="font-medium text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className={`px-4 py-3 ${p.stock <= 5 ? "font-medium text-amber-600" : ""}`}>{p.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => edit(p)} className="mr-3 text-indigo-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => remove(p)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/orders")
      .then(setOrders)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id, status) => {
    try {
      const updated = await api(`/orders/${id}/status`, { method: "PATCH", body: { status } });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast.success("Status updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;
  if (orders.length === 0) return <p className="py-12 text-center text-slate-500">No orders yet.</p>;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((o) => (
            <tr key={o.id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">#{o.id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-slate-500">{formatDate(o.createdAt)}</p>
              </td>
              <td className="px-4 py-3">
                <p>{o.userEmail}</p>
                <p className="max-w-xs text-xs text-slate-500">{o.shippingAddress}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {o.items.map((i) => (
                  <p key={i.productId}>
                    {i.name} × {i.quantity}
                  </p>
                ))}
              </td>
              <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
              <td className="px-4 py-3">
                {o.status === "CANCELLED" ? (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles.CANCELLED}`}>CANCELLED</span>
                ) : (
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
