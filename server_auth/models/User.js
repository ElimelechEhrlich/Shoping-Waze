// models/User.js
// ─────────────────────────────────────────────────────────
// Model של המשתמש — כל הפעולות על collection "users".
// עובד ישירות מול MongoDB native driver (ללא Mongoose).
//
// מבנה מסמך משתמש מלא ב-DB:
// {
//   _id           : ObjectId (נוצר אוטומטית)
//   name          : string
//   email         : string (unique, lowercase)
//   password      : string (bcrypt hash — לעולם לא חוזר ל-client)
//   cart          : CartItem[]  (סל קניות)
//   selectedStore : string | null  (סופרמרקט שנבחר לסל)
//   createdAt     : Date
//   updatedAt     : Date
// }
//
// מבנה CartItem:
// {
//   name      : string   — שם המוצר
//   qty       : number   — כמות
//   price     : number   — מחיר (0 = אין מחיר)
//   category  : string   — קטגוריה (dairy, dry, bakery וכו')
//   addedAt   : Date
// }
// ─────────────────────────────────────────────────────────

import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { getDB } from "../db/client.js";

// שם ה-collection ב-MongoDB
const COLLECTION = "users";

// פונקצית עזר — מחזירה את ה-collection
const getCollection = () => getDB().collection(COLLECTION);

/**
 * יוצר index ייחודי על שדה email.
 * נקרא פעם אחת בעת עליית השרת.
 */
export const createIndexes = async () => {
  await getCollection().createIndex({ email: 1 }, { unique: true });
};

/**
 * יוצר משתמש חדש ב-DB.
 * מבצע hash לסיסמה לפני השמירה.
 * מחזיר את המשתמש ללא שדה ה-password.
 *
 * @param {{ name: string, email: string, password: string }} userData
 * @returns {Promise<Object>} המשתמש החדש (ללא סיסמה)
 */
export const createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = {
    name,
    email:         email.toLowerCase().trim(),
    password:      hashedPassword, // נשמר ב-DB בלבד, לא חוזר ל-client
    cart:          [],             // סל קניות ריק לכל משתמש חדש
    selectedStore: null,           // סופרמרקט — יוגדר בעת הקנייה
    // מונה לדירוג אמון — ראה utils/trustScore.js
    reputation:    { receiptsConfirmed: 0, reportsSubmitted: 0 },
    createdAt:     new Date(),
    updatedAt:     new Date(),
  };

  const result = await getCollection().insertOne(newUser);

  // מחזירים את המשתמש ללא הסיסמה
  const { password: _removed, ...userWithoutPassword } = newUser;
  return { ...userWithoutPassword, _id: result.insertedId };
};

/**
 * מחפש משתמש לפי אימייל.
 *
 * @param {string} email
 * @param {boolean} includePassword - האם לכלול את ה-hash (נדרש רק ב-login)
 * @returns {Promise<Object|null>}
 */
export const findByEmail = async (email, includePassword = false) => {
  // projection — מסתיר את password אלא אם צריך
  const projection = includePassword ? {} : { password: 0 };

  return getCollection().findOne(
    { email: email.toLowerCase().trim() },
    { projection }
  );
};

/**
 * מחפש משתמש לפי _id.
 * לא מחזיר את שדה ה-password אף פעם.
 *
 * @param {string} id - מחרוזת של ObjectId
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  return getCollection().findOne(
    { _id: new ObjectId(id) },
    { projection: { password: 0 } }
  );
};

/**
 * משווה סיסמה גולמית מול ה-hash שב-DB.
 *
 * @param {string} plainPassword   - הסיסמה שהמשתמש הכניס
 * @param {string} hashedPassword  - ה-hash מה-DB
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * מעדכן שדות פרופיל של משתמש (שם, צבע אווטר).
 * מחזיר את המשתמש המעודכן ללא סיסמה.
 *
 * @param {string} id          - מחרוזת ObjectId
 * @param {{ name?: string, avatarColor?: string }} fields
 * @returns {Promise<Object|null>}
 */
export const updateUserProfile = async (id, fields) => {
  const allowed = {};
  if (fields.name)        allowed.name        = fields.name.trim();
  if (fields.avatarColor) allowed.avatarColor = fields.avatarColor;
  allowed.updatedAt = new Date();

  const result = await getCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: allowed },
    { returnDocument: "after", projection: { password: 0 } }
  );
  return result ?? null;
};

/**
 * מגדיל מונה reputation (קבלות מאושרות / דיווחים שנשלחו).
 * משתמש ב-$inc על נתיב מקונן — MongoDB יוצר את reputation אם חסר.
 *
 * @param {string} userId
 * @param {"receiptsConfirmed" | "reportsSubmitted"} field
 */
export const incReputation = async (userId, field) => {
  const path =
    field === "reportsSubmitted"
      ? "reputation.reportsSubmitted"
      : "reputation.receiptsConfirmed";
  await getCollection().updateOne(
    { _id: new ObjectId(userId) },
    { $inc: { [path]: 1 }, $set: { updatedAt: new Date() } }
  );
};

/**
 * משתמשים שנוצרו לפני שדה reputation — מסנכרן מונה קבלות מספר רשומות ב-scanHistory
 * (פעם אחת, ב-GET /me).
 */
export const bootstrapReputationIfNeeded = async (user) => {
  if (user?.reputation && typeof user.reputation.receiptsConfirmed === "number") {
    return user;
  }
  const uid = user._id;
  const histCount = await getDB()
    .collection("scanHistory")
    .countDocuments({ userId: uid });

  const rep = {
    receiptsConfirmed: histCount,
    reportsSubmitted:  Number(user?.reputation?.reportsSubmitted) || 0,
  };

  await getCollection().updateOne(
    { _id: uid },
    { $set: { reputation: rep, updatedAt: new Date() } }
  );

  return findById(uid.toString());
};
