import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import postgres from "postgres";

function loadEnvLocal() {
  const path = resolve(".env.local");
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const sourcePath = process.argv[2];

if (!sourcePath || !process.env.DATABASE_URL) {
  throw new Error(
    "Usage: node scripts/migrate-d1-to-postgres.mjs ./hatchlink-backup/hatchlink-source.sqlite",
  );
}

const tables = [
  "accounts",
  "listings",
  "orders",
  "inspections",
  "payments",
  "notifications",
  "receipts",
  "claims",
  "admin_users",
  "support_messages",
  "demand_requests",
];

const booleanColumns = {
  accounts: ["terms_accepted"],
  listings: ["eggs_turned"],
  receipts: ["buyer_confirmed"],
  admin_users: ["active"],
};

const source = new DatabaseSync(sourcePath, { readOnly: true });
const target = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
});

try {
  const report = {};

  await target.begin(async (tx) => {
    for (const table of tables) {
      const [{ count }] = await tx.unsafe(
        `SELECT COUNT(*)::int AS count FROM "${table}"`,
      );
      if (count > 0) {
        throw new Error(
          `Destination table "${table}" already has ${count} row(s). Stop and reconcile before importing.`,
        );
      }
    }

    for (const table of tables) {
      const rows = source.prepare(`SELECT * FROM "${table}"`).all();

      for (const row of rows) {
        const columns = Object.keys(row);

        if (!columns.length) continue;

        const values = columns.map((column) => {
          const value = row[column];

          if (
            (booleanColumns[table] || []).includes(column) &&
            value !== null
          ) {
            return Boolean(value);
          }

          return value;
        });

        const quotedColumns = columns
          .map((column) => `"${column}"`)
          .join(", ");

        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

        await tx.unsafe(
          `INSERT INTO "${table}" (${quotedColumns}) VALUES (${placeholders})`,
          values,
        );
      }

      report[table] = rows.length;
    }
  });

  // Align generated IDs with the imported records.
  for (const table of tables) {
    await target.unsafe(`
      SELECT setval(
        pg_get_serial_sequence('${table}', 'id'),
        COALESCE(MAX(id), 1),
        COUNT(*) > 0
      )
      FROM "${table}"
    `);
  }

  console.log("Migration completed. Imported row counts:");
  console.table(
    Object.entries(report).map(([table, rows]) => ({ table, rows })),
  );
} catch (error) {
  console.error("Migration failed. Investigate before retrying.", error);
  process.exitCode = 1;
} finally {
  source.close();
  await target.end();
}
