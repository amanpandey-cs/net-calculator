import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  calculateSubnet,
  validateIp,
  type IPCalculationResult,
} from "@/lib/ip-calculator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NetCalc Pro — Cybersecurity Subnet Calculator" },
      {
        name: "description",
        content:
          "Calculate IPv4 subnets, CIDR ranges, network and broadcast addresses, usable hosts, and IP class detection instantly in your browser.",
      },
      {
        property: "og:title",
        content: "NetCalc Pro — Cybersecurity Subnet Calculator",
      },
      {
        property: "og:description",
        content:
          "Professional IPv4 subnet calculator with CIDR slider, subnet mask, usable IP range, and copy-to-clipboard results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [ipAddress, setIpAddress] = useState("192.168.1.1");
  const [cidr, setCidr] = useState(24);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result: IPCalculationResult | null = useMemo(() => {
    if (!validateIp(ipAddress)) return null;
    try {
      return calculateSubnet(ipAddress, cidr);
    } catch {
      return null;
    }
  }, [ipAddress, cidr]);

  const isValid = validateIp(ipAddress);

  const copyToClipboard = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // Ignore clipboard errors
    }
  }, []);

  const resultItems = result
    ? [
        { label: "Subnet Mask", value: result.subnetMask, key: "subnetMask" },
        { label: "Wildcard Mask", value: result.wildcardMask, key: "wildcardMask" },
        { label: "Network Address", value: result.networkAddress, key: "networkAddress" },
        { label: "Broadcast Address", value: result.broadcastAddress, key: "broadcastAddress" },
        { label: "First Usable IP", value: result.firstUsableIp, key: "firstUsableIp" },
        { label: "Last Usable IP", value: result.lastUsableIp, key: "lastUsableIp" },
        { label: "Total Hosts", value: result.totalHosts.toLocaleString(), key: "totalHosts" },
        { label: "Usable Hosts", value: result.usableHosts.toLocaleString(), key: "usableHosts" },
        { label: "IP Class", value: result.ipClass, key: "ipClass" },
      ]
    : [];

  return (
    <div className="min-h-screen grid-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 text-center sm:mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Browser-based IPv4 calculator
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground text-glow sm:text-5xl">
            NetCalc Pro
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
            Professional subnet calculator for network engineers. Fast, private,
            and runs entirely in your browser.
          </p>
        </header>

        {/* Controls */}
        <section className="cyber-panel cyber-glow mb-6 p-5 sm:p-7">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="ip-address"
                className="block text-sm font-semibold text-foreground"
              >
                IPv4 Address
              </label>
              <input
                id="ip-address"
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-lg text-foreground outline-none ring-primary transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              {!isValid && (
                <p className="text-sm text-destructive">
                  Enter a valid IPv4 address (e.g. 192.168.1.1)
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="cidr-slider"
                  className="block text-sm font-semibold text-foreground"
                >
                  CIDR Prefix
                </label>
                <span className="rounded-md bg-primary/10 px-3 py-1 font-mono text-lg font-bold text-primary">
                  /{cidr}
                </span>
              </div>
              <input
                id="cidr-slider"
                type="range"
                min={0}
                max={32}
                step={1}
                value={cidr}
                onChange={(e) => setCidr(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>/0</span>
                <span>/32</span>
              </div>
            </div>
          </div>

          {result && (
            <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <div className="rounded-lg bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Binary Subnet Mask
                </p>
                <p className="mt-1 break-all font-mono text-sm text-cyan">
                  {result.binarySubnetMask}
                </p>
              </div>
              <div className="rounded-lg bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Binary Network Address
                </p>
                <p className="mt-1 break-all font-mono text-sm text-cyan">
                  {result.binaryNetworkAddress}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Calculation Results
            </h2>
            {result && (
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(result, null, 2),
                    "all-results"
                  )
                }
                className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                {copiedKey === "all-results" ? (
                  <>
                    <CheckIcon className="h-4 w-4 text-primary" />
                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-4 w-4" />
                    Copy all
                  </>
                )}
              </button>
            )}
          </div>

          {!result ? (
            <div className="cyber-panel flex flex-col items-center justify-center py-16 text-center">
              <ShieldIcon className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-foreground">
                Waiting for a valid IPv4 address
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter an IP address and adjust the CIDR slider to see results.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resultItems.map((item) => (
                <ResultCard
                  key={item.key}
                  label={item.label}
                  value={item.value}
                  copied={copiedKey === item.key}
                  onCopy={() => copyToClipboard(String(item.value), item.key)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          NetCalc Pro — No data leaves your device. Calculations run locally in
          JavaScript.
        </footer>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string | number;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="cyber-panel group flex flex-col justify-between p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 break-all font-mono text-xl font-semibold text-foreground sm:text-2xl">
          {value}
        </p>
      </div>
      <button
        onClick={onCopy}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <>
            <CheckIcon className="h-4 w-4 text-primary" />
            <span className="text-primary">Copied</span>
          </>
        ) : (
          <>
            <CopyIcon className="h-4 w-4" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
