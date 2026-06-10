import { useEffect, useMemo, useState } from "react";

type UsageRecord = {
  timestamp?: string;
  type?: string;
  model?: string;
  cost_usd?: number;
  response_time_ms?: number;
};

type BalanceResponse = {
  balance?: number;
};

type UsageResponse = {
  usage?: UsageRecord[];
};

type Props = {
  apiKey: string;
  compact?: boolean;
};

function formatPollen(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Unavailable";
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function formatUsageDate(value: string | undefined) {
  if (!value) {
    return "Recent";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function PollinationsAccountPanel({ apiKey, compact }: Props) {
  const [balance, setBalance] = useState<number | undefined>();
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const recentUsageCost = useMemo(
    () =>
      usage.reduce(
        (total, item) =>
          total + (typeof item.cost_usd === "number" ? item.cost_usd : 0),
        0
      ),
    [usage]
  );

  useEffect(() => {
    if (!apiKey) {
      setBalance(undefined);
      setUsage([]);
      setError("");
      return;
    }

    let isMounted = true;

    const loadAccount = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [balanceResponse, usageResponse] = await Promise.all([
          fetch("https://gen.pollinations.ai/account/balance", {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }),
          fetch("https://gen.pollinations.ai/account/key/usage?limit=5&days=30", {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }),
        ]);

        if (!balanceResponse.ok) {
          throw new Error("Could not load pollen balance.");
        }

        if (!usageResponse.ok) {
          throw new Error("Could not load recent usage.");
        }

        const balanceData = (await balanceResponse.json()) as BalanceResponse;
        const usageData = (await usageResponse.json()) as UsageResponse;

        if (!isMounted) {
          return;
        }

        setBalance(balanceData.balance);
        setUsage(Array.isArray(usageData.usage) ? usageData.usage : []);
      } catch (accountError) {
        if (!isMounted) {
          return;
        }

        setError(
          accountError instanceof Error
            ? accountError.message
            : "Could not load Pollinations account data."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAccount();

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  if (!apiKey) {
    return null;
  }

  return (
    <div
      className={`rounded-3xl border ${
        compact
          ? "border-white/10 bg-slate-900/40 backdrop-blur-md text-slate-100"
          : "border-black/10 bg-white text-[#111713]"
      } p-6 shadow-xl`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-black uppercase tracking-[0.2em] ${
              compact ? "text-amber-400" : "text-[#0f766e]"
            }`}
          >
            Pollen balance
          </p>
          <p className="mt-2 text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            {isLoading ? "Loading..." : formatPollen(balance)}
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-xs font-black uppercase tracking-[0.2em] ${
              compact ? "text-slate-500" : "text-[#5a665e]"
            }`}
          >
            Recent spend
          </p>
          <p className="mt-2 text-xl font-black text-slate-300">
            ${recentUsageCost.toFixed(4)}
          </p>
        </div>
      </div>

      {error ? (
        <p
          className={`mt-4 text-sm leading-6 ${
            compact ? "text-red-400 font-medium" : "text-red-700"
          }`}
        >
          ⚠️ {error}
        </p>
      ) : (
        <div className="mt-5 space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
            Recent API Requests
          </p>
          {usage.length > 0 ? (
            usage.slice(0, compact ? 3 : 5).map((item, index) => (
              <div
                key={`${item.timestamp ?? "usage"}-${index}`}
                className={`flex items-center justify-between gap-3 rounded-2xl border ${
                  compact
                    ? "bg-slate-950/30 border-white/5 hover:border-cyan-500/20 hover:bg-slate-950/50"
                    : "bg-[#f7f4ed] border-black/5"
                } px-4 py-3.5 text-xs transition duration-200`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span className="truncate font-semibold text-slate-300">
                    {item.model || item.type || "Request"}
                  </span>
                </div>
                <span className={compact ? "text-slate-500 font-medium" : "text-[#5a665e]"}>
                  {formatUsageDate(item.timestamp)}
                  {typeof item.cost_usd === "number"
                    ? ` • $${item.cost_usd.toFixed(4)}`
                    : ""}
                </span>
              </div>
            ))
          ) : (
            <p
              className={`text-sm leading-6 ${
                compact ? "text-slate-500" : "text-[#5a665e]"
              }`}
            >
              No recent usage for this key yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

