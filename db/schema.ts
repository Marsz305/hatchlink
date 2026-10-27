import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  serial,
  text,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP::text`);

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  batchCode: text("batch_code").notNull().unique(),
  sellerEmail: text("seller_email"),
  breed: text("breed").notNull(),
  district: text("district").notNull(),
  crates: integer("crates").notNull(),
  price: real("price").notNull(),
  oldestEgg: text("oldest_egg").notNull(),
  newestEgg: text("newest_egg").notNull(),
  fertility: integer("fertility"),
  purity: text("purity").notNull(),
  storageMethod: text("storage_method"),
  storageTemperature: text("storage_temperature"),
  eggsTurned: boolean("eggs_turned"),
  flockAge: text("flock_age"),
  maleFemaleRatio: text("male_female_ratio"),
  vaccinationStatus: text("vaccination_status"),
  packagingMethod: text("packaging_method"),
  proposedDeliveryDate: text("proposed_delivery_date"),
  status: text("status").notNull().default("Under review"),
  createdAt: createdAt(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  buyerEmail: text("buyer_email"),
  listingId: integer("listing_id").notNull(),
  breed: text("breed").notNull(),
  crates: integer("crates").notNull(),
  total: real("total").notNull(),
  status: text("status").notNull().default("Awaiting EcoCash"),
  collectionDate: text("collection_date"),
  settlementDate: text("settlement_date"),
  createdAt: createdAt(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  email: text("email"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  ecocash: text("ecocash").notNull(),
  district: text("district").notNull(),
  role: text("role").notNull(),
  dedupeKey: text("dedupe_key").unique(),
  status: text("status").notNull().default("Pending approval"),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  createdAt: createdAt(),
});

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  acceptedEggs: integer("accepted_eggs").notNull(),
  rejectedEggs: integer("rejected_eggs").notNull(),
  condition: text("condition").notNull(),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull(),
  createdAt: createdAt(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  reference: text("reference").notNull().unique(),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull().default("Awaiting verification"),
  createdAt: createdAt(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audience: text("audience").notNull().default("admin"),
  readAt: text("read_at"),
  createdAt: createdAt(),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  receiptCode: text("receipt_code").notNull().unique(),
  batchCode: text("batch_code").notNull(),
  crates: integer("crates").notNull(),
  eggs: integer("eggs").notNull(),
  officer: text("officer").notNull(),
  collectionCode: text("collection_code"),
  transportMethod: text("transport_method"),
  collectedAt: text("collected_at").notNull(),
  buyerConfirmed: boolean("buyer_confirmed").notNull().default(true),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  category: text("category").notNull(),
  details: text("details").notNull(),
  remedy: text("remedy").notNull(),
  status: text("status").notNull().default("Evidence review"),
  dueDate: text("due_date").notNull(),
  createdAt: createdAt(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("Administrator"),
  active: boolean("active").notNull().default(true),
  appointedBy: text("appointed_by").notNull(),
  createdAt: createdAt(),
});

export const supportMessages = pgTable(
  "support_messages",
  {
    id: serial("id").primaryKey(),
    participantEmail: text("participant_email").notNull(),
    participantRole: text("participant_role").notNull(),
    senderRole: text("sender_role").notNull(),
    senderName: text("sender_name").notNull(),
    body: text("body").notNull(),
    readAt: text("read_at"),
    createdAt: createdAt(),
  },
  (table) => [
    index("idx_support_messages_participant").on(
      table.participantEmail,
      table.participantRole,
    ),
  ],
);

export const demandRequests = pgTable(
  "demand_requests",
  {
    id: serial("id").primaryKey(),
    buyerEmail: text("buyer_email").notNull(),
    breed: text("breed").notNull(),
    crates: integer("crates").notNull(),
    neededBy: text("needed_by").notNull(),
    preferredDistrict: text("preferred_district"),
    notes: text("notes").notNull().default(""),
    status: text("status").notNull().default("Submitted"),
    createdAt: createdAt(),
  },
  (table) => [index("idx_demand_requests_buyer").on(table.buyerEmail)],
);
