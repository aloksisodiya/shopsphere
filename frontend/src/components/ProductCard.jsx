import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice, onImageError } from "../utils.js";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    add(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="card group flex flex-col overflow-hidden">
      <Link to={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          onError={onImageError}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">{product.category}</span>
        <Link to={`/product/${product.id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-indigo-600">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
          <button onClick={handleAdd} disabled={outOfStock} className="btn-primary px-3 py-1.5">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
