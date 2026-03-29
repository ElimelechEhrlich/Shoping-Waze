// utils/trustScore.js
// ─────────────────────────────────────────────────────────
// חישוב "דירוג אמון" (Trust) מהמונחים reputation.receiptsConfirmed
// ו-reputation.reportsSubmitted.
//
// עקרון: ציון חיובי בלבד — מבוסס על פעולות מאומתות (אישור קבלה בהיסטוריה)
// ודיווחים שמועברים לשרת (משוב / מחיר שגוי וכו'). אין דירוג שלילי
// ממשתמשים אחרים בשלב זה — מפחית ניצול לרעה ומפשט את המוצר.
// ─────────────────────────────────────────────────────────

/**
 * @param {object} user — מסמך משתמש (או כל אובייקט עם reputation)
 * @returns {{ score: number, level: string, levelLabel: string, stars: number, receiptsConfirmed: number, reportsSubmitted: number }}
 */
export function computeTrust(user) {
  const rep = user?.reputation || {};
  const receipts = Number(rep.receiptsConfirmed) || 0;
  const reports    = Number(rep.reportsSubmitted) || 0;

  // נוסחה: בסיס קטן + קבלות מאושרות + דיווחים (תורמים יותר — משוב פעיל)
  const raw = 8 + receipts * 5 + reports * 12;
  const score = Math.min(100, Math.floor(raw));

  let level = "new";
  let levelLabel = "מתחיל";
  if (score >= 85) {
    level = "expert";
    levelLabel = "מוביל קהילה";
  } else if (score >= 60) {
    level = "trusted";
    levelLabel = "תורם אמין";
  } else if (score >= 35) {
    level = "active";
    levelLabel = "פעיל";
  } else if (score >= 18) {
    level = "rising";
    levelLabel = "עולה";
  }

  const stars = Math.min(5, Math.max(1, Math.round(score / 20)));

  return {
    score,
    level,
    levelLabel,
    stars,
    receiptsConfirmed: receipts,
    reportsSubmitted:  reports,
  };
}

/**
 * מסיר סיסמה ומוסיף trust לתגובת API.
 */
export function toPublicUser(user) {
  if (!user) return null;
  const { password: _p, googleSub: _g, ...rest } = user;
  return { ...rest, trust: computeTrust(rest) };
}
