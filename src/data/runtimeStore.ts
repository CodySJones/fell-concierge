import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { AdminUser, AppState, ClientBundle } from "../types.ts";
import { designProfiles } from "./designProfiles.ts";
import { initialState } from "./seed.ts";

const storageRoot = process.env.STORAGE_ROOT ? resolve(process.env.STORAGE_ROOT) : process.cwd();
const dataDir = join(storageRoot, "data");
const dbFile = join(dataDir, "fell-concierge.db");
const legacyRuntimeFile = join(dataDir, "runtime-db.json");

const jsonColumns = new Set([
  "unresolved_questions",
  "recommended_topics",
  "style_cues",
  "approved_vendors",
  "palette_material_direction",
  "avoid_notes",
  "triggers",
  "guardrails",
  "briefing"
]);

const ensureDataDir = () => {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
};

const openDb = () => {
  ensureDataDir();
  const db = new DatabaseSync(dbFile);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      project_address TEXT NOT NULL,
      source TEXT NOT NULL,
      current_state TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      room_type TEXT NOT NULL,
      scope_notes TEXT NOT NULL,
      budget_range TEXT NOT NULL,
      contractor_status TEXT NOT NULL,
      timeline TEXT NOT NULL,
      scan_status TEXT NOT NULL,
      measurements_status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS design_profile_results (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      primary_profile TEXT NOT NULL,
      primary_confidence REAL NOT NULL,
      secondary_profile TEXT,
      secondary_confidence REAL,
      rationale TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      product_type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      purchased_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deliverables (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      deliverable_type TEXT NOT NULL,
      status TEXT NOT NULL,
      generated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS product_selections (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      category TEXT NOT NULL,
      vendor TEXT NOT NULL,
      product_name TEXT NOT NULL,
      sku TEXT NOT NULL,
      finish TEXT NOT NULL,
      selection_status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sample_box_items (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      category TEXT NOT NULL,
      vendor TEXT NOT NULL,
      item_name TEXT NOT NULL,
      notes TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS consult_briefs (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      summary TEXT NOT NULL,
      unresolved_questions TEXT NOT NULL,
      recommended_topics TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS offer_recommendations (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      recommended_offer TEXT NOT NULL,
      rationale TEXT NOT NULL,
      eligible INTEGER NOT NULL,
      generated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS email_deliveries (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      template_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      to_email TEXT NOT NULL,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_message_id TEXT,
      error_message TEXT,
      sent_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS intake_uploads (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      intake_type TEXT NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      byte_size REAL NOT NULL,
      uploaded_at TEXT NOT NULL,
      note TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS design_profiles (
      name TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      style_cues TEXT NOT NULL,
      approved_vendors TEXT NOT NULL,
      palette_material_direction TEXT NOT NULL,
      avoid_notes TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agent_skills (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      triggers TEXT NOT NULL,
      guardrails TEXT NOT NULL,
      active INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agent_memories (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      source_run_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      client_id TEXT NOT NULL,
      status TEXT NOT NULL,
      briefing TEXT NOT NULL,
      error_message TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS agent_heartbeats (
      id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      status TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      last_run_id TEXT,
      last_error TEXT
    );
  `);
  return db;
};

const clearAppTables = (db: DatabaseSync) => {
  db.exec(`
    DELETE FROM clients;
    DELETE FROM projects;
    DELETE FROM design_profile_results;
    DELETE FROM purchases;
    DELETE FROM deliverables;
    DELETE FROM product_selections;
    DELETE FROM sample_box_items;
    DELETE FROM consult_briefs;
    DELETE FROM offer_recommendations;
    DELETE FROM email_deliveries;
    DELETE FROM intake_uploads;
    DELETE FROM design_profiles;
    DELETE FROM agent_skills;
    DELETE FROM agent_memories;
    DELETE FROM agent_runs;
    DELETE FROM agent_heartbeats;
  `);
};

const insertRows = <T extends Record<string, unknown>>(db: DatabaseSync, table: string, rows: T[]) => {
  if (rows.length === 0) {
    return;
  }

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => "?").join(", ");
  const statement = db.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`);

  for (const row of rows) {
    const values = columns.map((column) => {
      const value = row[column];
      if (jsonColumns.has(column)) {
        return JSON.stringify(value ?? []);
      }
      if (typeof value === "boolean") {
        return value ? 1 : 0;
      }
      return value ?? null;
    });
    statement.run(...values);
  }
};

const hydrateRows = <T>(rows: Record<string, unknown>[]): T[] =>
  rows.map((row) => {
    const hydrated = { ...row } as Record<string, unknown>;
    for (const [key, value] of Object.entries(hydrated)) {
      if (jsonColumns.has(key) && typeof value === "string") {
        hydrated[key] = JSON.parse(value);
      }
      if (key === "eligible" || key === "active") {
        hydrated[key] = Boolean(value);
      }
    }
    return hydrated as T;
  });

const seedDesignProfiles = (db: DatabaseSync) => {
  insertRows(
    db,
    "design_profiles",
    designProfiles.map((profile) => ({
      ...profile,
      approved_vendors: profile.approved_vendors
    }))
  );
};

const writeState = (db: DatabaseSync, state: AppState) => {
  db.exec("BEGIN");
  try {
    clearAppTables(db);
    insertRows(db, "clients", state.clients);
    insertRows(db, "projects", state.projects);
    insertRows(db, "design_profile_results", state.designProfileResults);
    insertRows(db, "purchases", state.purchases);
    insertRows(db, "deliverables", state.deliverables);
    insertRows(db, "product_selections", state.productSelections);
    insertRows(db, "sample_box_items", state.sampleBoxItems);
    insertRows(db, "consult_briefs", state.consultBriefs);
    insertRows(
      db,
      "offer_recommendations",
      state.offerRecommendations.map((recommendation) => ({
        ...recommendation,
        eligible: recommendation.eligible ? 1 : 0
      }))
    );
    insertRows(db, "email_deliveries", state.emailDeliveries);
    insertRows(db, "intake_uploads", state.intakeUploads);
    insertRows(
      db,
      "agent_skills",
      (state.agentSkills ?? []).map((skill) => ({
        ...skill,
        active: skill.active ? 1 : 0
      }))
    );
    insertRows(db, "agent_memories", state.agentMemories ?? []);
    insertRows(db, "agent_runs", state.agentRuns ?? []);
    insertRows(db, "agent_heartbeats", state.agentHeartbeats ?? []);
    seedDesignProfiles(db);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};

const readLegacyState = (): AppState | null => {
  if (!existsSync(legacyRuntimeFile)) {
    return null;
  }
  return JSON.parse(readFileSync(legacyRuntimeFile, "utf8")) as AppState;
};

const bootstrapState = () => {
  const db = openDb();
  try {
    const row = db.prepare("SELECT COUNT(*) as count FROM clients").get() as { count: number };
    if (row.count > 0) {
      return;
    }
    const seedState = readLegacyState() ?? initialState();
    writeState(db, seedState);
  } finally {
    db.close();
  }

  if (existsSync(legacyRuntimeFile)) {
    unlinkSync(legacyRuntimeFile);
  }
};

export const loadState = (): AppState => {
  bootstrapState();
  const db = openDb();
  try {
    return {
      clients: hydrateRows(db.prepare("SELECT * FROM clients").all() as Record<string, unknown>[]),
      projects: hydrateRows(db.prepare("SELECT * FROM projects").all() as Record<string, unknown>[]),
      designProfileResults: hydrateRows(db.prepare("SELECT * FROM design_profile_results").all() as Record<string, unknown>[]),
      purchases: hydrateRows(db.prepare("SELECT * FROM purchases").all() as Record<string, unknown>[]),
      deliverables: hydrateRows(db.prepare("SELECT * FROM deliverables").all() as Record<string, unknown>[]),
      productSelections: hydrateRows(db.prepare("SELECT * FROM product_selections").all() as Record<string, unknown>[]),
      sampleBoxItems: hydrateRows(db.prepare("SELECT * FROM sample_box_items").all() as Record<string, unknown>[]),
      consultBriefs: hydrateRows(db.prepare("SELECT * FROM consult_briefs").all() as Record<string, unknown>[]),
      offerRecommendations: hydrateRows(db.prepare("SELECT * FROM offer_recommendations").all() as Record<string, unknown>[]),
      emailDeliveries: hydrateRows(db.prepare("SELECT * FROM email_deliveries").all() as Record<string, unknown>[]),
      intakeUploads: hydrateRows(db.prepare("SELECT * FROM intake_uploads").all() as Record<string, unknown>[]),
      agentSkills: hydrateRows(db.prepare("SELECT * FROM agent_skills").all() as Record<string, unknown>[]),
      agentMemories: hydrateRows(db.prepare("SELECT * FROM agent_memories").all() as Record<string, unknown>[]),
      agentRuns: hydrateRows(db.prepare("SELECT * FROM agent_runs").all() as Record<string, unknown>[]),
      agentHeartbeats: hydrateRows(db.prepare("SELECT * FROM agent_heartbeats").all() as Record<string, unknown>[])
    };
  } finally {
    db.close();
  }
};

export const saveState = (state: AppState) => {
  bootstrapState();
  const db = openDb();
  try {
    writeState(db, state);
  } finally {
    db.close();
  }
};

export const resetState = () => {
  saveState(initialState());
};

export const getClientBundle = (state: AppState, clientId: string): ClientBundle | undefined => {
  const client = state.clients.find((entry) => entry.id === clientId);
  if (!client) {
    return undefined;
  }

  return {
    client,
    project: state.projects.find((entry) => entry.client_id === clientId),
    profileResult: state.designProfileResults.find((entry) => entry.client_id === clientId),
    purchases: state.purchases.filter((entry) => entry.client_id === clientId),
    deliverables: state.deliverables.filter((entry) => entry.client_id === clientId),
    sampleBoxItems: state.sampleBoxItems.filter((entry) => entry.client_id === clientId),
    consultBrief: state.consultBriefs.find((entry) => entry.client_id === clientId),
    recommendation: state.offerRecommendations.find((entry) => entry.client_id === clientId),
    selections: state.productSelections.filter((entry) => entry.client_id === clientId),
    emailDeliveries: state.emailDeliveries.filter((entry) => entry.client_id === clientId),
    intakeUploads: state.intakeUploads.filter((entry) => entry.client_id === clientId)
  };
};

export const ensureAdminUser = (adminUser: AdminUser) => {
  bootstrapState();
  const db = openDb();
  try {
    const existing = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(adminUser.email) as AdminUser | undefined;
    if (!existing) {
      db.prepare("INSERT INTO admin_users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)")
        .run(adminUser.id, adminUser.email, adminUser.password_hash, adminUser.created_at);
    }
  } finally {
    db.close();
  }
};

export const findAdminUserByEmail = (email: string): AdminUser | undefined => {
  bootstrapState();
  const db = openDb();
  try {
    return db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as AdminUser | undefined;
  } finally {
    db.close();
  }
};
