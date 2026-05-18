import AsyncStorage from "@react-native-async-storage/async-storage";

export const CONVERTER_RECENT_STORAGE_KEY = "converterRecentHistory";
export const MAX_RECENT_CONVERSIONS = 4;

export type RecentConversion = {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: string;
  timestamp: number;
};

function fingerprint(entry: Pick<RecentConversion, "amount" | "fromCurrency" | "toCurrency">): string {
  return `${entry.fromCurrency}|${entry.toCurrency}|${entry.amount}`;
}

function normalizeEntry(raw: unknown): RecentConversion | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const amount = String(o.amount ?? "").trim();
  const fromCurrency = String(o.fromCurrency ?? "").trim().toUpperCase();
  const toCurrency = String(o.toCurrency ?? "").trim().toUpperCase();
  const convertedAmount = String(o.convertedAmount ?? "").trim();
  const timestamp = Number(o.timestamp);
  if (!amount || !fromCurrency || !toCurrency) return null;
  if (!Number.isFinite(timestamp)) return null;
  return { amount, fromCurrency, toCurrency, convertedAmount, timestamp };
}

/** Load up to 4 recent conversions; migrates legacy `lastConversion` once. */
export async function loadRecentConversions(): Promise<RecentConversion[]> {
  try {
    const stored = await AsyncStorage.getItem(CONVERTER_RECENT_STORAGE_KEY);
    let list: RecentConversion[] = [];
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        list = parsed
          .map(normalizeEntry)
          .filter((e): e is RecentConversion => e != null);
      }
    }

    if (list.length === 0) {
      const legacy = await AsyncStorage.getItem("lastConversion");
      if (legacy) {
        const last = JSON.parse(legacy) as Record<string, unknown>;
        const migrated = normalizeEntry({
          amount: last.amount,
          fromCurrency: last.fromCurrency,
          toCurrency: last.toCurrency,
          convertedAmount: last.convertedAmount ?? "",
          timestamp: last.timestamp,
        });
        if (migrated) {
          list = [migrated];
          await AsyncStorage.setItem(
            CONVERTER_RECENT_STORAGE_KEY,
            JSON.stringify(list)
          );
        }
      }
    }

    return list.slice(0, MAX_RECENT_CONVERSIONS);
  } catch {
    return [];
  }
}

export async function saveRecentConversions(
  list: RecentConversion[]
): Promise<void> {
  await AsyncStorage.setItem(
    CONVERTER_RECENT_STORAGE_KEY,
    JSON.stringify(list.slice(0, MAX_RECENT_CONVERSIONS))
  );
}

/** Add or bump a conversion; keeps newest 4 distinct amount/pair entries. */
export async function pushRecentConversion(
  entry: Omit<RecentConversion, "timestamp"> & { timestamp?: number }
): Promise<RecentConversion[]> {
  if (!entry.amount?.trim() || !entry.fromCurrency || !entry.toCurrency) {
    return loadRecentConversions();
  }
  if (!entry.convertedAmount?.trim()) {
    return loadRecentConversions();
  }

  const next: RecentConversion = {
    ...entry,
    fromCurrency: entry.fromCurrency.toUpperCase(),
    toCurrency: entry.toCurrency.toUpperCase(),
    timestamp: entry.timestamp ?? Date.now(),
  };

  const list = await loadRecentConversions();
  const fp = fingerprint(next);
  const withoutDup = list.filter((item) => fingerprint(item) !== fp);
  const updated = [next, ...withoutDup].slice(0, MAX_RECENT_CONVERSIONS);
  await saveRecentConversions(updated);
  return updated;
}
