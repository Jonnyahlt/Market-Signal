import { createClient } from "@/lib/supabase/server";

interface UserApiKeys {
  openai_api_key?: string;
  twelve_data_api_key?: string;
  polygon_api_key?: string;
  finnhub_api_key?: string;
  alpha_vantage_api_key?: string;
  fred_api_key?: string;
}

export async function getUserApiKeys(): Promise<UserApiKeys> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {};
    }

    const { data } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!data) {
      return {};
    }

    return {
      openai_api_key: data.openai_api_key || undefined,
      twelve_data_api_key: data.twelve_data_api_key || undefined,
      polygon_api_key: data.polygon_api_key || undefined,
      finnhub_api_key: data.finnhub_api_key || undefined,
      alpha_vantage_api_key: data.alpha_vantage_api_key || undefined,
      fred_api_key: data.fred_api_key || undefined,
    };
  } catch (error) {
    console.error("Failed to get user API keys:", error);
    return {};
  }
}

export function getApiKey(
  userKeys: UserApiKeys,
  keyName: keyof UserApiKeys,
  envKey: string | undefined
): string | undefined {
  // User's key takes priority over env key
  return userKeys[keyName] || envKey;
}
