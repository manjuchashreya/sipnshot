import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { google, type gmail_v1 } from "googleapis";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "openid",
  "email",
  "profile",
];

const OAUTH_STORAGE_PATH = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  ".local",
  "gmail-oauth.json",
);

type StoredConnection = {
  email: string;
  tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
    scope?: string | null;
    token_type?: string | null;
    expiry_date?: number | null;
  };
  updatedAt: string;
};

type EncryptedPayload = {
  iv: string;
  tag: string;
  content: string;
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getOAuthClient() {
  return new google.auth.OAuth2(
    requireEnv("GOOGLE_CLIENT_ID"),
    requireEnv("GOOGLE_CLIENT_SECRET"),
    requireEnv("GOOGLE_REDIRECT_URI"),
  );
}

function getEncryptionKey() {
  const secret = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error("Missing required environment variable: GOOGLE_TOKEN_ENCRYPTION_KEY");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function encryptPayload(payload: StoredConnection) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const content = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    content: content.toString("base64"),
  } satisfies EncryptedPayload;
}

function decryptPayload(payload: EncryptedPayload) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(payload.iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.content, "base64")),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(decrypted) as StoredConnection;
}

async function ensureStorageDir() {
  await fs.mkdir(path.dirname(OAUTH_STORAGE_PATH), { recursive: true });
}

export function getGoogleAuthUrl(state: string) {
  const client = getOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    include_granted_scopes: true,
    state,
  });
}

export async function saveOAuthConnection(connection: StoredConnection) {
  await ensureStorageDir();
  const encrypted = encryptPayload(connection);
  await fs.writeFile(OAUTH_STORAGE_PATH, JSON.stringify(encrypted, null, 2), "utf8");
}

export async function readOAuthConnection() {
  try {
    const file = await fs.readFile(OAUTH_STORAGE_PATH, "utf8");
    return decryptPayload(JSON.parse(file) as EncryptedPayload);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function clearOAuthConnection() {
  try {
    await fs.unlink(OAUTH_STORAGE_PATH);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code !== "ENOENT") {
      throw error;
    }
  }
}

export async function exchangeCodeForConnection(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ auth: client, version: "v2" });
  const userInfo = await oauth2.userinfo.get();
  const email = userInfo.data.email;

  if (!email) {
    throw new Error("Google did not return an email address for the connected account.");
  }

  const connection: StoredConnection = {
    email,
    tokens: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    },
    updatedAt: new Date().toISOString(),
  };

  await saveOAuthConnection(connection);

  return connection;
}

async function getOAuthBackedGmailContext() {
  const connection = await readOAuthConnection();

  if (!connection) {
    return null;
  }

  const client = getOAuthClient();
  client.setCredentials({
    access_token: connection.tokens.access_token ?? undefined,
    refresh_token: connection.tokens.refresh_token ?? undefined,
    scope: connection.tokens.scope ?? undefined,
    token_type: connection.tokens.token_type ?? undefined,
    expiry_date: connection.tokens.expiry_date ?? undefined,
  });

  client.on("tokens", (tokens) => {
    const merged: StoredConnection = {
      ...connection,
      updatedAt: new Date().toISOString(),
      tokens: {
        access_token: tokens.access_token ?? connection.tokens.access_token ?? null,
        refresh_token: tokens.refresh_token ?? connection.tokens.refresh_token ?? null,
        scope: tokens.scope ?? connection.tokens.scope ?? null,
        token_type: tokens.token_type ?? connection.tokens.token_type ?? null,
        expiry_date: tokens.expiry_date ?? connection.tokens.expiry_date ?? null,
      },
    };

    void saveOAuthConnection(merged);
  });

  return {
    gmail: google.gmail({ version: "v1", auth: client }),
    senderEmail: connection.email,
    source: "oauth" as const,
    email: connection.email,
    updatedAt: connection.updatedAt,
  };
}

function getEnvFallbackContext() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const senderEmail = process.env.GOOGLE_SENDER_EMAIL;

  if (!refreshToken || !senderEmail) {
    return null;
  }

  const client = getOAuthClient();
  client.setCredentials({
    refresh_token: refreshToken,
  });

  return {
    gmail: google.gmail({ version: "v1", auth: client }),
    senderEmail,
    source: "env" as const,
    email: senderEmail,
    updatedAt: null,
  };
}

export async function getGmailContext(): Promise<{
  gmail: gmail_v1.Gmail;
  senderEmail: string;
  source: "oauth" | "env";
  email: string;
  updatedAt: string | null;
}> {
  const oauthContext = await getOAuthBackedGmailContext();

  if (oauthContext) {
    return oauthContext;
  }

  const envContext = getEnvFallbackContext();

  if (envContext) {
    return envContext;
  }

  throw new Error(
    "No Gmail connection found. Connect Gmail from Settings or configure the fallback env tokens.",
  );
}

export async function getGmailConnectionStatus() {
  const oauthConnection = await readOAuthConnection();

  if (oauthConnection) {
    return {
      connected: true,
      source: "oauth" as const,
      email: oauthConnection.email,
      updatedAt: oauthConnection.updatedAt,
    };
  }

  if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_SENDER_EMAIL) {
    return {
      connected: true,
      source: "env" as const,
      email: process.env.GOOGLE_SENDER_EMAIL,
      updatedAt: null,
    };
  }

  return {
    connected: false,
    source: null,
    email: null,
    updatedAt: null,
  };
}

export function buildGoogleSettingsUrl(status: "connected" | "disconnected" | "error", message?: string) {
  const url = new URL("/settings", requireEnv("APP_URL"));
  url.searchParams.set("gmail", status);

  if (message) {
    url.searchParams.set("message", message);
  }

  return url.toString();
}

export { GMAIL_SCOPES };
