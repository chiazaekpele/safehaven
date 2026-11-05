// Runs the real IMPACT_SQL against Neon inside a transaction that is always rolled back,
// so nothing is ever written. Opt-in: npm run test:db
import { Pool } from "@neondatabase/serverless";
import { describe, expect, it } from "vitest";
import { CAMPAIGN_EDITION } from "../lib/config";
import { IMPACT_SQL, impactFromRow } from "../lib/impact";

const enabled = process.env.RUN_DB_TESTS === "1" && !!process.env.DATABASE_URL;

describe.skipIf(!enabled)("impact aggregate (Neon, rolled back)", () => {
  it("counts only successful edition-3 donations", async () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const before = impactFromRow((await client.query(IMPACT_SQL, [CAMPAIGN_EDITION])).rows[0]);
      const base = before.current!.totalKobo;

      await client.query(
        `INSERT INTO donations (reference, amount_kobo, status, campaign_edition) VALUES
          ('SH3-test00000000000000000000000001', 120000,  'successful', 3),
          ('SH3-test00000000000000000000000002', 500000,  'successful', 3),
          ('SH3-test00000000000000000000000003', 1000000, 'pending',    3),
          ('SH3-test00000000000000000000000004', 240000,  'failed',     3),
          ('SH3-test00000000000000000000000005', 999900,  'successful', 2)`,
      );
      const after = impactFromRow((await client.query(IMPACT_SQL, [CAMPAIGN_EDITION])).rows[0]);

      expect(after.current!.totalKobo - base).toBe(620_000);
      expect(after.historicalRaisedLabel).toBe("₦400,000+");
      expect(after.historicalStudentsLabel).toBe("300+");

      // Duplicate reference cannot create a second row.
      await expect(
        client.query(
          "INSERT INTO donations (reference, amount_kobo) VALUES ('SH3-test00000000000000000000000001', 120000)",
        ),
      ).rejects.toThrow(/duplicate key/);
    } finally {
      await client.query("ROLLBACK").catch(() => {});
      client.release();
      await pool.end();
    }
  }, 60_000);
});
