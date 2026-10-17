import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"}`;

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600">
          Shop<span className="text-slate-900">Sphere</span>
        </Link>

        <nav className="flex items-center gap-5">
          <NavLink to="/" end className={linkClass}>
            Shop
          </NavLink>
          {user && (
            <NavLink to="/orders" className={linkClass}>
              Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}

          <Link to="/cart" className="relative text-slate-600 hover:text-slate-900" aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 4h13M9 20a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:inline">Hi, {user.name.split(" ")[0]}</span>
              <button onClick={handleLogout} className="btn-secondary px-3 py-1.5">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary px-3 py-1.5">
                Log in
              </Link>
              <Link to="/register" className="btn-primary hidden px-3 py-1.5 sm:inline-flex">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
