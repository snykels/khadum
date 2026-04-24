import type { SessionOptions } from "iron-session";

export type SessionData = {
  userId?: number;
  email?: string;
  role?: "freelancer" | "client" | "admin" | "supervisor";
  name?: string;
  avatarUrl?: string;
  rememberMe?: boolean;
  uaHash?: string;
  ipPrefix?: string;
  loginAt?: number;
};

const password = process.env.SESSION_SECRET;
if (!password || password.length < 32) {
  throw new Error(
    "SESSION_SECRET environment variable must be set and at least 32 characters"
  );
}

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "khadom_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  },
};

export const sessionOptionsShort: SessionOptions = {
  password,
  cookieName: "khadom_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};
