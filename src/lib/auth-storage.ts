"use client";

import type { User } from "@/types";

const TOKEN_KEY = "gearup_token";
const USER_KEY = "gearup_user";
const COOKIE_TOKEN_KEY = "gearup_token";
const COOKIE_PATH = "/";
const COOKIE_DAYS = 7;

function isBrowser() {
  return typeof window !== "undefined";
}

function msPerDay() {
  return 24 * 60 * 60 * 1000;
}

function setCookie(name: string, value: string, days: number = COOKIE_DAYS) {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * msPerDay()).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${COOKIE_PATH}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
}

function removeCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${COOKIE_PATH}`;
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(TOKEN_KEY) ?? getCookie(COOKIE_TOKEN_KEY);
  } catch {
    return getCookie(COOKIE_TOKEN_KEY);
  }
}

export function setToken(token: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
  setCookie(COOKIE_TOKEN_KEY, token, COOKIE_DAYS);
}

export function getUser(): User | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function clearAuth(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
  removeCookie(COOKIE_TOKEN_KEY);
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const AUTH_STORAGE_KEYS = {
  TOKEN_KEY,
  USER_KEY,
  COOKIE_TOKEN_KEY,
} as const;
