import React from "react";
import { Utensils, ArrowRight } from "lucide-react";

export const TableSelection = ({ t, lang, setLang, table, setTable, handleStartOrder }) => {
  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md space-y-12 text-center">
        <div className="bg-orange-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-orange-100">
          <Utensils size={40} className="text-orange-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">{t.brand}</h1>
          <p className="text-slate-400 font-bold">{t.selectTable}</p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {[...Array(20)].map((_, i) => (
            <button
              key={i}
              onClick={() => setTable(i + 1)}
              className={`h-12 rounded-2xl font-black transition-all ${
                table === i + 1
                  ? "bg-slate-950 text-white scale-110 shadow-xl"
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-3 pt-4 border-t border-dashed">
          {["ar", "tr", "en"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                lang === l
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <button
          disabled={!table}
          onClick={() => handleStartOrder(table)}
          className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-200 disabled:opacity-20 flex items-center justify-center gap-3"
        >
          {t.startOrder} <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
};