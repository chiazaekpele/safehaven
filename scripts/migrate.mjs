// Applies db/schema.sql to the database in DATABASE_URL.
// Usage: npm run db:migrate   (reads .env.local)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const sql = neon(url);
const statements = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

const [settings] = await sql.query(
  "SELECT campaign_edition, historical_raised_kobo, historical_raised_label, historical_students_label, meal_cost_kobo FROM campaign_settings",
);
console.log(`Applied ${statements.length} statements. Settings:`, settings);
