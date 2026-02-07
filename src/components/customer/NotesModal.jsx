import React from "react";
import { X } from "lucide-react";

export const NotesModal = ({
  t,
  notesOpen,
  setNotesOpen,
  notesItem,
  notesText,
  setNotesText,
  addToCartWithNote,
  getLocalizedValue
}) => {
  if (!notesOpen || !notesItem) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-slate-900">
            {getLocalizedValue(notesItem, "name")}
          </h3>
          <button
            onClick={() => setNotesOpen(false)}
            className="p-2 bg-slate-50 rounded-2xl text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block text-sm font-black text-slate-700 mb-2">
          {t.notes}
        </label>
        <textarea
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          placeholder={t.notesPlaceholder || "مثال: بدون بصل / صوص زيادة..."}
          className="w-full p-4 rounded-2xl border bg-slate-50 outline-none font-bold text-slate-800 h-28"
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              addToCartWithNote(notesItem, notesText);
              setNotesOpen(false);
            }}
            className="py-4 bg-slate-950 text-white rounded-2xl font-black"
          >
            {t.addToCart}
          </button>

          <button
            onClick={() => {
              addToCartWithNote(notesItem, "");
              setNotesOpen(false);
            }}
            className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-black"
          >
            {t.skip}
          </button>
        </div>
      </div>
    </div>
  );
};