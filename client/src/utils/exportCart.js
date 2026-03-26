// utils/exportCart.js
// ייצוא סל קניות ל-CSV ו-הדפסה
// ─────────────────────────────────────────────────────────

export const exportCartCSV = (cart, filename = "סל_קניות") => {
  if (!cart?.length) return;

  const BOM   = "\uFEFF"; // תומך בעברית ב-Excel
  const lines = [
    ["מוצר", "קטגוריה", "כמות", "מחיר יחידה", "סה\"כ"].join(","),
    ...cart.map((item) => [
      `"${item.name}"`,
      `"${item.category || "כללי"}"`,
      item.qty,
      item.price > 0 ? item.price.toFixed(2) : "",
      item.price > 0 ? (item.price * item.qty).toFixed(2) : "",
    ].join(",")),
  ];

  // שורת סיכום
  const total = cart.reduce((s, i) => s + (i.price > 0 ? i.price * i.qty : 0), 0);
  lines.push(`"סה\"כ",,,,${total.toFixed(2)}`);

  const blob = new Blob([BOM + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `${filename}_${new Date().toLocaleDateString("he-IL").replace(/\./g, "-")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
