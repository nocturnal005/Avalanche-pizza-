'use client';

import { useSyncExternalStore } from 'react';

/**
 * The basket.
 *
 * A tiny vanilla store rather than a state library: the whole surface is
 * add/remove/setQty/clear, and `useSyncExternalStore` gives correct SSR
 * behaviour (server renders empty, client hydrates from localStorage) with no
 * dependency and no hydration mismatch.
 *
 * Persisted so a customer who wanders off to check a price still has their
 * order when they come back — on a flaky Ghanaian connection, losing a basket
 * to a dropped page load is the difference between an order and no order.
 */

export interface BasketLine {
  /** Stable identity: `product:the-avalanche` or `deal:party-feast`. */
  id: string;
  kind: 'product' | 'deal';
  slug: string;
  name: string;
  /** Price of ONE unit, in pesewas, captured when it was added. */
  unitPesewas: number;
  qty: number;
  /** Shown under the name, e.g. "Size: Standard". */
  sizeLabel?: string;
  /** Chips under the name, e.g. deal inclusions. */
  tags?: string[];
}

const STORAGE_KEY = 'avalanche.basket.v1';
const MAX_QTY = 15;
const MAX_LINES = 25;

let lines: BasketLine[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

/** Cached snapshot — useSyncExternalStore requires a stable reference. */
let snapshot: BasketLine[] = lines;

function emit() {
  snapshot = lines;
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private mode or a full quota — the basket still works for this session.
  }
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    // Validate defensively: this is user-writable storage.
    lines = parsed.filter(
      (l): l is BasketLine =>
        !!l &&
        typeof l === 'object' &&
        typeof (l as BasketLine).id === 'string' &&
        typeof (l as BasketLine).name === 'string' &&
        Number.isInteger((l as BasketLine).unitPesewas) &&
        (l as BasketLine).unitPesewas >= 0 &&
        Number.isInteger((l as BasketLine).qty) &&
        (l as BasketLine).qty > 0,
    );
    snapshot = lines;
  } catch {
    lines = [];
  }
}

export function addLine(line: Omit<BasketLine, 'qty'>, qty = 1) {
  hydrate();
  const existing = lines.find((l) => l.id === line.id);
  if (existing) {
    lines = lines.map((l) =>
      l.id === line.id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
    );
  } else {
    if (lines.length >= MAX_LINES) return;
    lines = [...lines, { ...line, qty: Math.min(MAX_QTY, qty) }];
  }
  persist();
  emit();
}

export function setQty(id: string, qty: number) {
  hydrate();
  if (qty <= 0) return removeLine(id);
  lines = lines.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l));
  persist();
  emit();
}

export function removeLine(id: string) {
  hydrate();
  lines = lines.filter((l) => l.id !== id);
  persist();
  emit();
}

export function clearBasket() {
  hydrate();
  lines = [];
  persist();
  emit();
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Server render: always empty, so markup matches the pre-hydration client. */
const EMPTY: BasketLine[] = [];

export function useBasket(): BasketLine[] {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}

export function basketCount(ls: BasketLine[]): number {
  return ls.reduce((n, l) => n + l.qty, 0);
}

export function basketSubtotal(ls: BasketLine[]): number {
  return ls.reduce((n, l) => n + l.unitPesewas * l.qty, 0);
}
