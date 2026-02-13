import React from "react";
import { ShoppingCart, Plus, ChevronRight } from "lucide-react";

export const Menu = ({
  t,
  lang,
  table,
  setView,
  cart = [],
  setIsCartOpen,
  categories = [],
  activeCategory = "All",
  setActiveCategory = () => {},
  filteredItems = [],
  getLocalizedValue = (item, key) => item?.[key] ?? "",
  computedOutOfStock = {},
  setNotesItem,
  setNotesText,
  setNotesOpen,
}) => {
  const safeCart = Array.isArray(cart) ? cart : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeItems = Array.isArray(filteredItems) ? filteredItems : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-32" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur-md border-b px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
            {table}
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">{t.table}</h2>
            <button
              onClick={() => setView("selection")}
              className="text-[10px] text-orange-600 font-bold uppercase tracking-widest flex items-center gap-1"
            >
              {t.changeTable} <ChevronRight size={10} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-4 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-100 active:scale-90 transition-all"
        >
          <ShoppingCart size={24} />
          {safeCart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-slate-950 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black border-4 border-white animate-bounce">
              {safeCart.length}
            </span>
          )}
        </button>
      </header>

      <div className="p-4 sticky top-[89px] z-50 bg-slate-50/80 backdrop-blur-md border-b overflow-x-auto flex gap-3 no-scrollbar">
        {safeCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-full whitespace-nowrap text-sm font-black transition-all shadow-sm ${
              activeCategory === cat
                ? "bg-orange-600 text-white shadow-orange-200"
                : "bg-white text-slate-400"
            }`}
          >
            {cat === "All"
              ? t.all
              : lang === "ar"
              ? cat
              : getLocalizedValue(safeItems.find((i) => i.categoryAr === cat), "category") || cat}
          </button>
        ))}
      </div>

      {/* . FULL WIDTH: شلنا max-w-7xl mx-auto */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {safeItems.map((item) => {
          const isOut = !!computedOutOfStock?.[item.id];

          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-[2.5rem] flex gap-5 border border-white shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative overflow-hidden rounded-[1.8rem] w-32 h-32 shrink-0 bg-slate-100">
                {item.isOffer && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-700">
                      🔥 عرض
                    </span>
                  </div>
                )}

                {isOut && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-700">
                      {t.outOfStock}
                    </span>
                  </div>
                )}

                <img
                  src={item.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>

              <div className="flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-black text-slate-900 text-xl leading-tight">
                    {getLocalizedValue(item, "name")}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mt-1">
                    {getLocalizedValue(item, "desc")}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  {item.isOffer ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-400 line-through font-bold">
                        {item.oldPrice} TL
                      </span>
                      <span className="text-2xl font-black text-orange-600">
                        {item.price} <small className="text-[10px] font-bold">TL</small>
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-orange-600">
                      {item.price} <small className="text-[10px] font-bold">TL</small>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      if (isOut) return;
                      setNotesItem(item);
                      setNotesText("");
                      setNotesOpen(true);
                    }}
                    disabled={isOut}
                    className={`p-3.5 rounded-2xl shadow-lg active:scale-90 transition-all ${
                      isOut
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-slate-950 text-white"
                    }`}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};
