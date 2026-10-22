/**
 * Savings model for a group installing the same dependencies.
 *
 * Without a relay, every machine downloads the packages from the internet.
 * With a relay, the packages cross the internet once and are then served
 * on the local network. All sizes are in megabytes (1 GB = 1000 MB).
 */

export interface EstimateInput {
  /** Size of one install as downloaded from the registry, in MB. */
  sizeMB: number;
  /** Number of machines that install the same dependencies. */
  installs: number;
  /** Price of one gigabyte of mobile data. Omit to skip the cost lines. */
  pricePerGB?: number;
}

export interface Estimate {
  withoutRelayMB: number;
  withRelayMB: number;
  avoidedMB: number;
  /** Present only when a price per GB was given. */
  cost?: {
    withoutRelay: number;
    withRelay: number;
    saved: number;
  };
}

const MB_PER_GB = 1000;

function assertPositiveFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive number, got ${value}`);
  }
}

export function estimateSavings(input: EstimateInput): Estimate {
  const { sizeMB, installs, pricePerGB } = input;
  assertPositiveFinite("sizeMB", sizeMB);
  assertPositiveFinite("installs", installs);
  if (!Number.isInteger(installs)) {
    throw new RangeError(`installs must be a whole number, got ${installs}`);
  }

  const withoutRelayMB = sizeMB * installs;
  const withRelayMB = sizeMB;
  const avoidedMB = withoutRelayMB - withRelayMB;

  if (pricePerGB === undefined) {
    return { withoutRelayMB, withRelayMB, avoidedMB };
  }

  assertPositiveFinite("pricePerGB", pricePerGB);
  const toCost = (mb: number) => (mb / MB_PER_GB) * pricePerGB;
  return {
    withoutRelayMB,
    withRelayMB,
    avoidedMB,
    cost: {
      withoutRelay: toCost(withoutRelayMB),
      withRelay: toCost(withRelayMB),
      saved: toCost(avoidedMB),
    },
  };
}

/** Formats a size given in MB as "215 MB" or "6.45 GB" ("215 Mo", "6,45 Go" in French). */
export function formatMB(mb: number, locale = "en"): string {
  const fr = locale.toLowerCase().startsWith("fr");
  if (mb >= MB_PER_GB) {
    const gb = mb / MB_PER_GB;
    const n = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(gb);
    return `${n} ${fr ? "Go" : "GB"}`;
  }
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(mb);
  return `${n} ${fr ? "Mo" : "MB"}`;
}

/** Formats an amount of money, rounded to whole units (XOF has no subunit). */
export function formatMoney(amount: number, currency: string, locale = "en"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
