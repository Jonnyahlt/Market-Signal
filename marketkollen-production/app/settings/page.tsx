"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, Save, LogOut } from "lucide-react";

interface ApiKeys {
  openai_api_key: string;
  twelve_data_api_key: string;
  polygon_api_key: string;
  finnhub_api_key: string;
  alpha_vantage_api_key: string;
  fred_api_key: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai_api_key: "",
    twelve_data_api_key: "",
    polygon_api_key: "",
    finnhub_api_key: "",
    alpha_vantage_api_key: "",
    fred_api_key: "",
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);

    // Fetch user's API keys
    const { data } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setApiKeys({
        openai_api_key: data.openai_api_key || "",
        twelve_data_api_key: data.twelve_data_api_key || "",
        polygon_api_key: data.polygon_api_key || "",
        finnhub_api_key: data.finnhub_api_key || "",
        alpha_vantage_api_key: data.alpha_vantage_api_key || "",
        fred_api_key: data.fred_api_key || "",
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSuccess(false);

    try {
      const { error } = await supabase.from("user_api_keys").upsert(
        {
          user_id: user.id,
          ...apiKeys,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateKey = (key: keyof ApiKeys, value: string) => {
    setApiKeys((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const keyConfigs = [
    {
      key: "openai_api_key" as keyof ApiKeys,
      label: "OpenAI API Key",
      description: "For AI-powered market predictions",
      link: "https://platform.openai.com/api-keys",
      placeholder: "sk-...",
      tier: "Premium - Pay per use",
    },
    {
      key: "twelve_data_api_key" as keyof ApiKeys,
      label: "TwelveData API Key",
      description: "Premium stock market data (recommended)",
      link: "https://twelvedata.com/",
      placeholder: "Your TwelveData key",
      tier: "Free tier available",
    },
    {
      key: "polygon_api_key" as keyof ApiKeys,
      label: "Massive (Polygon) API Key",
      description: "Professional stock market data",
      link: "https://massive.com/",
      placeholder: "Your Massive/Polygon key",
      tier: "Free tier available",
    },
    {
      key: "finnhub_api_key" as keyof ApiKeys,
      label: "Finnhub API Key",
      description: "Stock market data and news",
      link: "https://finnhub.io/",
      placeholder: "Your Finnhub key",
      tier: "Free tier available",
    },
    {
      key: "alpha_vantage_api_key" as keyof ApiKeys,
      label: "Alpha Vantage API Key",
      description: "Stock and forex data (fallback)",
      link: "https://www.alphavantage.co/support/#api-key",
      placeholder: "Your Alpha Vantage key",
      tier: "Free tier available",
    },
    {
      key: "fred_api_key" as keyof ApiKeys,
      label: "FRED API Key",
      description: "Economic calendar and macro data",
      link: "https://fred.stlouisfed.org/docs/api/api_key.html",
      placeholder: "Your FRED key",
      tier: "Free",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              MarketKollen
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and API integrations
            </p>
          </div>

          {/* Profile Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Profile</h2>
            <div className="p-4 rounded-lg border border-border">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Full Name</span>
                  <p className="font-medium">{user?.user_metadata?.full_name || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">API Integrations</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add your own API keys to unlock premium features. Your keys override system defaults.
              </p>
            </div>

            <div className="space-y-6">
              {keyConfigs.map((config) => (
                <div key={config.key} className="p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <label htmlFor={config.key} className="block font-medium">
                        {config.label}
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                      <a
                        href={config.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        Get API key →
                      </a>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">{config.tier}</span>
                  </div>

                  <div className="relative">
                    <input
                      id={config.key}
                      type={showKeys[config.key] ? "text" : "password"}
                      value={apiKeys[config.key]}
                      onChange={(e) => updateKey(config.key, e.target.value)}
                      className="w-full px-4 py-2 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                      placeholder={config.placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(config.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKeys[config.key] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save All Settings
              </button>

              {success && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="text-xl">✓</span> Saved successfully
                </span>
              )}
            </div>

            <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>💡 How it works:</strong> Your API keys are encrypted and stored securely.
                They override system defaults, giving you premium features. Only you can access
                your keys.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                <strong>🔐 Security:</strong> Your API keys are encrypted and only accessible by
                you. We never share your keys with third parties or use them for anything except
                your own requests.
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="pt-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
