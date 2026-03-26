// pages/CartPage.jsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCart        from "../hooks/useCart.js";
import useProducts    from "../hooks/useProducts.js";
import useCompare     from "../hooks/useCompare.js";
import useDebounce    from "../hooks/useDebounce.js";
import usePageTitle   from "../hooks/usePageTitle.js";
import { exportCartCSV } from "../utils/exportCart.js";
import ProductList    from "../Comps/Cart/ProductList.jsx";
import CartCategory   from "../Comps/Cart/CartCategory.jsx";
import CartFooter     from "../Comps/Cart/CartFooter.jsx";
import NoPriceModal   from "../Comps/Cart/NoPriceModal.jsx";
import AddProductModal from "../Comps/Cart/AddProductModal.jsx";
import TemplateModal  from "../Comps/Cart/TemplateModal.jsx";
import { SkeletonCard } from "../Comps/Skeleton.jsx";

const SORT_OPTIONS = [
  { value: "added",    label: "ברירת מחדל" },
  { value: "name",     label: "א–ת לפי שם" },
  { value: "category", label: "לפי קטגוריה" },
  { value: "price",    label: "יקר → זול" },
];

const CartPage = () => {
  const navigate = useNavigate();

  const {
    cart, loading: cartLoading, error: cartError,
    fetchCart,
    updateItem, removeItem, clearCart,
    totalItems, totalPrice, missingPrice,
  } = useCart();

  const { products, loading: productsLoading } = useProducts();
  const { compare, loading: compareLoading }   = useCompare();

  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("added");
  const [pending, setPending]         = useState(null);
  const [showClearConfirm, setShowClearConfirm]   = useState(false);
  const [showAddProduct, setShowAddProduct]       = useState(false);
  const [showTemplate, setShowTemplate]           = useState(false);
  const [extraProducts, setExtraProducts]         = useState([]);

  usePageTitle(totalItems > 0 ? `סל הקניות (${totalItems})` : "סל הקניות");

  const debouncedSearch = useDebounce(search, 280);

  // ── מוצר חדש נוצר במאגר ─────────────────────────────────
  const handleProductCreated = (newProduct) => {
    setExtraProducts((prev) => {
      const alreadyIn = prev.some((p) => p.id === newProduct.id) ||
                        products.some((p) => p.id === newProduct.id);
      return alreadyIn ? prev : [newProduct, ...prev];
    });
    setShowAddProduct(false);
  };

  // ── הוספת מוצר לסל ─────────────────────────────────────
  const handleAddProduct = (product) => {
    if (product.price === 0) { setPending(product); return; }
    const existing = cart.find((c) => c.name.toLowerCase() === product.name.toLowerCase());
    updateItem(product.name, { qty: (existing?.qty ?? 0) + 1, price: product.price, category: product.category });
  };

  const handleModalConfirm = (price) => {
    const existing = cart.find((c) => c.name.toLowerCase() === pending.name.toLowerCase());
    updateItem(pending.name, { qty: (existing?.qty ?? 0) + 1, price: price > 0 ? price : 0, category: pending.category });
    setPending(null);
  };

  const handleIncrease = (item) => {
    if (item.price === 0) { setPending(item); return; }
    updateItem(item.name, { qty: item.qty + 1 });
  };

  const handleDecrease = (item) => {
    if (item.qty <= 1) return;
    updateItem(item.name, { qty: item.qty - 1 });
  };

  const handleClearCart = async () => {
    await clearCart();
    setShowClearConfirm(false);
  };

  // ── טעינת תבנית לסל ─────────────────────────────────────
  const handleLoadTemplate = (items) => {
    items.forEach((item) => {
      updateItem(item.name, { qty: item.qty, price: item.price, category: item.category });
    });
  };

  // ── השוואת מחירים ───────────────────────────────────────
  const handleCompare = async () => {
    const data = await compare(cart, null);
    if (data) navigate("/compare", { state: { compareData: data } });
  };

  // ── מיון הסל ────────────────────────────────────────────
  const sortedCart = useMemo(() => {
    const sorted = [...cart];
    if (sortBy === "name")     sorted.sort((a, b) => a.name.localeCompare(b.name, "he"));
    if (sortBy === "category") sorted.sort((a, b) => (a.category || "").localeCompare(b.category || "", "he"));
    if (sortBy === "price")    sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [cart, sortBy]);

  const groupedCart = useMemo(() =>
    sortedCart.reduce((acc, item) => {
      const cat = item.category || "כללי";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {}), [sortedCart]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-24" dir="rtl">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-slate-600 transition">
              <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-slate-900 flex-1">סל הקניות</h1>

            {cart.length > 0 && (
              <>
                {/* תבניות */}
                <button
                  onClick={() => setShowTemplate(true)}
                  title="תבניות סל"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-500
                    hover:text-blue-700 border border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  תבניות
                </button>

                {/* ייצוא CSV */}
                <button
                  onClick={() => exportCartCSV(cart)}
                  title="ייצוא לקובץ CSV"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500
                    hover:text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ייצוא
                </button>

                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500
                    hover:text-red-600 border border-red-200 hover:border-red-300 hover:bg-red-50 rounded-xl transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  רוקן סל
                </button>

                <button
                  onClick={handleCompare}
                  disabled={compareLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600
                    disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                >
                  {compareLoading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />משווה...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>השווה מחירים</>
                  )}
                </button>
              </>
            )}
          </div>

          {/* חיפוש */}
          <div className="relative">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש מוצר..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200
                bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* פאנל שמאל — מוצרים */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                מוצרים להוספה
              </h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600
                  hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300
                  hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                מוצר חדש
              </button>
            </div>
            {productsLoading
              ? <><SkeletonCard rows={4} /><SkeletonCard rows={3} /></>
              : <ProductList
                  products={[...extraProducts, ...products]}
                  search={debouncedSearch}
                  cart={cart}
                  onAdd={handleAddProduct}
                />
            }
          </section>

          {/* פאנל ימין — הסל */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                הסל שלי
                {cart.length > 0 && (
                  <span className="mr-2 text-emerald-500 normal-case tracking-normal">({totalItems} פריטים)</span>
                )}
              </h2>
              {cart.length > 1 && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white
                    text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
            </div>

            {cartLoading && <><SkeletonCard rows={3} /><SkeletonCard rows={2} /></>}

            {!cartLoading && cartError && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center space-y-3">
                <p className="text-3xl">⚠️</p>
                <p className="text-red-600 text-sm font-medium">{cartError}</p>
                <button onClick={fetchCart}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">
                  נסה שוב
                </button>
              </div>
            )}

            {!cartLoading && !cartError && cart.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <p className="text-4xl mb-3">🛒</p>
                <p className="text-slate-400 text-sm">הסל ריק — הוסף מוצרים מהרשימה</p>
              </div>
            )}

            {!cartLoading && !cartError && Object.entries(groupedCart).map(([cat, items]) => (
              <CartCategory
                key={cat}
                category={cat}
                items={items}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={removeItem}
              />
            ))}
          </section>
        </div>
      </main>

      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onCreated={handleProductCreated}
        />
      )}

      {showTemplate && (
        <TemplateModal
          cart={cart}
          onLoad={handleLoadTemplate}
          onClose={() => setShowTemplate(false)}
        />
      )}

      {pending && (
        <NoPriceModal item={pending} onConfirm={handleModalConfirm} onCancel={() => setPending(null)} />
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="text-center mb-5">
              <p className="text-4xl mb-3">🗑️</p>
              <h3 className="font-bold text-slate-800 text-lg">לרוקן את הסל?</h3>
              <p className="text-slate-500 text-sm mt-1">
                כל הפריטים יוסרו מהסל שלך.<br />המוצרים עצמם נשארים במאגר המערכת.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
                ביטול
              </button>
              <button onClick={handleClearCart}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">
                כן, רוקן
              </button>
            </div>
          </div>
        </div>
      )}

      {!cartLoading && cart.length > 0 && (
        <CartFooter totalItems={totalItems} totalPrice={totalPrice} missingPrice={missingPrice} />
      )}
    </div>
  );
};

export default CartPage;
