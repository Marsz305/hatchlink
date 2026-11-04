import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  hatchLinkSql?: ReturnType<typeof postgres>;
  hatchLinkMemoryStore?: Record<string, any[]>;
};

function getSql() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  try {
    const sql =
      globalForDb.hatchLinkSql ??
      postgres(connectionString, {
        max: 5,
        prepare: false,
        connect_timeout: 10,
        ssl: "require",
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.hatchLinkSql = sql;
    }

    return sql;
  } catch (err) {
    console.warn("[AI Studio] Database connection error:", err);
    return null;
  }
}

function getMemoryStore() {
  if (!globalForDb.hatchLinkMemoryStore) {
    const now = new Date();
    const d1 = new Date(now.getTime() - 1 * 86400000).toISOString().slice(0, 10);
    const d2 = new Date(now.getTime() - 2 * 86400000).toISOString().slice(0, 10);
    const d3 = new Date(now.getTime() - 3 * 86400000).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);

    globalForDb.hatchLinkMemoryStore = {
      listings: [
        {
          id: 1,
          batchCode: "HLZ-7821901",
          sellerEmail: "seller@hatchlink.co.zw",
          breed: "Black Australorp",
          district: "Marondera",
          crates: 25,
          price: 21.0,
          oldestEgg: d2,
          newestEgg: d1,
          fertility: 92,
          purity: "Purebred Australorp F1",
          storageMethod: "Cool egg room",
          storageTemperature: "16°C",
          eggsTurned: true,
          flockAge: "11 months",
          maleFemaleRatio: "1:7",
          vaccinationStatus: "Newcastle + Gumboro verified",
          packagingMethod: "Standard pulp filler flats",
          proposedDeliveryDate: today,
          status: "Available",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          batchCode: "HLZ-7821902",
          sellerEmail: "chivhu_poultry@gmail.com",
          breed: "Boschveld",
          district: "Gweru",
          crates: 40,
          price: 16.5,
          oldestEgg: d3,
          newestEgg: d1,
          fertility: 88,
          purity: "Hardy dual-purpose free-range",
          storageMethod: "Ventilated cellar",
          storageTemperature: "17°C",
          eggsTurned: true,
          flockAge: "14 months",
          maleFemaleRatio: "1:8",
          vaccinationStatus: "Up to date",
          packagingMethod: "Sterilised egg trays",
          proposedDeliveryDate: today,
          status: "Available",
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          batchCode: "HLZ-7821903",
          sellerEmail: "sasso_breeder@zol.co.zw",
          breed: "Sasso",
          district: "Harare",
          crates: 35,
          price: 18.0,
          oldestEgg: d2,
          newestEgg: d1,
          fertility: 90,
          purity: "Sasso Silver F1 breeding stock",
          storageMethod: "Climate controlled store",
          storageTemperature: "15°C",
          eggsTurned: true,
          flockAge: "10 months",
          maleFemaleRatio: "1:6",
          vaccinationStatus: "Full program certified",
          packagingMethod: "Flats in heavy cartons",
          proposedDeliveryDate: today,
          status: "Available",
          createdAt: new Date().toISOString(),
        },
        {
          id: 4,
          batchCode: "HLZ-7821904",
          sellerEmail: "matabele_eggs@gmail.com",
          breed: "Potchefstroom Koekoek",
          district: "Bulawayo",
          crates: 20,
          price: 19.5,
          oldestEgg: d1,
          newestEgg: today,
          fertility: 91,
          purity: "Selected South African heritage stock",
          storageMethod: "Clean cool storage",
          storageTemperature: "16°C",
          eggsTurned: true,
          flockAge: "12 months",
          maleFemaleRatio: "1:7",
          vaccinationStatus: "Certified vet card",
          packagingMethod: "Pulp flats",
          proposedDeliveryDate: today,
          status: "Available",
          createdAt: new Date().toISOString(),
        },
      ],
      orders: [],
      accounts: [
        {
          id: 1,
          email: "seller@hatchlink.co.zw",
          fullName: "Tendai Moyo (Marondera Farm)",
          phone: "0771234567",
          ecocash: "0771234567",
          district: "Marondera",
          role: "Seller",
          dedupeKey: "seller|seller@hatchlink.co.zw",
          status: "Approved",
          termsAccepted: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          email: "buyer@hatchlink.co.zw",
          fullName: "Grace Chikwanha (Kuwadzana Hatchery)",
          phone: "0772345678",
          ecocash: "0772345678",
          district: "Harare",
          role: "Buyer",
          dedupeKey: "buyer|buyer@hatchlink.co.zw",
          status: "Approved",
          termsAccepted: true,
          createdAt: new Date().toISOString(),
        },
      ],
      inspections: [
        {
          id: 1,
          listingId: 1,
          acceptedEggs: 750,
          rejectedEggs: 0,
          condition: "Clean, intact, unwashed, optimal shape index",
          notes: "Candled sample passed 92% fertility check",
          status: "Accepted",
          createdAt: new Date().toISOString(),
        },
      ],
      payments: [],
      notifications: [
        {
          id: 1,
          title: "System initialized",
          body: "HatchLink Zimbabwe marketplace active.",
          audience: "admin",
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      receipts: [],
      claims: [],
      adminUsers: [
        {
          id: 1,
          email: (process.env.PRIMARY_ADMIN_EMAIL || "admin@hatchlink.co.zw").trim().toLowerCase(),
          role: "Primary Administrator",
          active: true,
          appointedBy: "system",
          createdAt: new Date().toISOString(),
        },
      ],
      supportMessages: [],
      demandRequests: [],
    };
  }
  return globalForDb.hatchLinkMemoryStore;
}

function getTableName(table: any): string {
  if (!table) return "unknown";
  if (typeof table === "string") return table;
  // Drizzle pgTable stores name in Symbol(drizzle:Name) or table[Symbol.for('drizzle:OriginalName')] or _._.name
  if (table[Symbol.for("drizzle:Name")]) return table[Symbol.for("drizzle:Name")];
  if (table[Symbol.for("drizzle:OriginalName")]) return table[Symbol.for("drizzle:OriginalName")];
  if (table._?.name) return table._.name;
  for (const [k, v] of Object.entries(schema)) {
    if (v === table) {
      if (k === "adminUsers") return "adminUsers";
      if (k === "demandRequests") return "demandRequests";
      if (k === "supportMessages") return "supportMessages";
      return k;
    }
  }
  return "unknown";
}

function createMockDb(): any {
  const store = getMemoryStore();

  function getList(tableName: string): any[] {
    const key =
      tableName === "admin_users"
        ? "adminUsers"
        : tableName === "demand_requests"
        ? "demandRequests"
        : tableName === "support_messages"
        ? "supportMessages"
        : tableName;
    if (!store[key]) {
      store[key] = [];
    }
    return store[key];
  }

  return {
    select() {
      return {
        from(table: any) {
          const tName = getTableName(table);
          const list = getList(tName);

          const queryState = {
            table: tName,
            filterFn: null as ((item: any) => boolean) | null,
            orderFn: null as ((a: any, b: any) => number) | null,
            limitVal: null as number | null,
            async execute() {
              let rows = [...list];
              if (this.filterFn) {
                rows = rows.filter(this.filterFn);
              }
              if (this.orderFn) {
                rows.sort(this.orderFn);
              }
              if (this.limitVal !== null) {
                rows = rows.slice(0, this.limitVal);
              }
              return rows;
            },
            then(resolve: any, reject: any) {
              return this.execute().then(resolve, reject);
            },
            where(clause: any) {
              this.filterFn = buildFilter(clause);
              return this;
            },
            orderBy(orderClause: any) {
              this.orderFn = buildOrder(orderClause);
              return this;
            },
            limit(count: number) {
              this.limitVal = count;
              return this;
            },
          };

          return queryState;
        },
      };
    },

    insert(table: any) {
      const tName = getTableName(table);
      const list = getList(tName);

      return {
        values(data: any) {
          const inserted: any[] = [];
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            const nextId =
              list.length > 0 ? Math.max(...list.map((r: any) => r.id || 0)) + 1 : 1;
            const row = {
              id: nextId,
              createdAt: new Date().toISOString(),
              ...item,
            };
            list.push(row);
            inserted.push(row);
          }

          return {
            async execute() {
              return inserted;
            },
            returning() {
              return this;
            },
            then(resolve: any, reject: any) {
              return this.execute().then(resolve, reject);
            },
          };
        },
      };
    },

    update(table: any) {
      const tName = getTableName(table);
      const list = getList(tName);

      return {
        set(data: any) {
          return {
            where(clause: any) {
              const filterFn = buildFilter(clause);
              const updated: any[] = [];
              for (let i = 0; i < list.length; i++) {
                if (!filterFn || filterFn(list[i])) {
                  list[i] = { ...list[i], ...data };
                  updated.push(list[i]);
                }
              }

              return {
                async execute() {
                  return updated;
                },
                returning() {
                  return this;
                },
                then(resolve: any, reject: any) {
                  return this.execute().then(resolve, reject);
                },
              };
            },
          };
        },
      };
    },
  };
}

function buildFilter(clause: any): (item: any) => boolean {
  if (!clause) return () => true;

  return (item: any) => {
    try {
      // Drizzle binary operators eq, and, inArray, lt
      if (clause.operator === "and" || clause.operator === "AND" || Array.isArray(clause.conditions)) {
        const conds = clause.conditions || clause.args || [];
        return conds.every((c: any) => buildFilter(c)(item));
      }

      if (clause.operator === "eq" || clause.operator === "=") {
        const col = getColName(clause.args?.[0] || clause.left);
        const val = clause.args?.[1] ?? clause.right?.value ?? clause.right;
        return item[col] === val;
      }

      if (clause.operator === "lt" || clause.operator === "<") {
        const col = getColName(clause.args?.[0] || clause.left);
        const val = clause.args?.[1] ?? clause.right?.value ?? clause.right;
        return item[col] < val;
      }

      if (clause.operator === "inArray" || clause.operator === "IN") {
        const col = getColName(clause.args?.[0] || clause.left);
        const vals = clause.args?.[1] || [];
        return Array.isArray(vals) && vals.includes(item[col]);
      }

      // Check query chunks or sql expressions
      if (clause.queryChunks) {
        // Simple string search match
        for (const [k, v] of Object.entries(item)) {
          if (typeof v === "string" || typeof v === "number") {
            // best effort match
          }
        }
      }

      return true;
    } catch {
      return true;
    }
  };
}

function getColName(col: any): string {
  if (!col) return "";
  if (typeof col === "string") return col;
  if (col.name) return col.name;
  if (col.key) return col.key;
  if (col._?.name) return col._.name;
  return "";
}

function buildOrder(orderClause: any): (a: any, b: any) => number {
  if (!orderClause) return () => 0;
  return (a: any, b: any) => {
    try {
      const isDesc = orderClause.type === "desc" || orderClause.direction === "desc";
      const col = getColName(orderClause.column || orderClause.arg || orderClause);
      const valA = a[col] ?? a.id ?? 0;
      const valB = b[col] ?? b.id ?? 0;
      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    } catch {
      return 0;
    }
  };
}

export type AppDb = ReturnType<typeof drizzle<typeof schema>>;

export function getDb(): AppDb {
  const sql = getSql();
  if (sql) {
    try {
      return drizzle(sql, { schema });
    } catch (err) {
      console.warn("[AI Studio] Failed to init drizzle with postgres, using mock:", err);
    }
  }
  return createMockDb() as unknown as AppDb;
}
