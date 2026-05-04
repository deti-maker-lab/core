// apps/mobile/app/login.tsx
import { Platform } from "react-native";
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking   from "expo-linking";
import { useState }   from "react";
import { useAuth }    from "../context/AuthContext";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage() {
  const { setTokenAndLoad } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSSO = async () => {
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === "web") {
        const currentUrl = window.location.origin;
        window.location.href = `https://deti-makerlab.ua.pt/api/auth/sso/login/mobile?web_redirect=${encodeURIComponent(currentUrl + "/auth/callback")}`;
      } else {
        // Nativo — usa deep link
        const redirectUri = Linking.createURL("auth");
        const result = await WebBrowser.openAuthSessionAsync(
          "https://deti-makerlab.ua.pt/api/auth/sso/login/mobile",
          redirectUri
        );
        if (result.type === "success" && result.url) {
          const parsed = Linking.parse(result.url);
          const token  = parsed.queryParams?.token as string | undefined;
          if (token) await setTokenAndLoad(token);
          else setError("No token received.");
        } else if (result.type === "cancel") {
          setError("Login cancelled.");
        }
      }
    } catch (e: any) {
      setError(e.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f4f5f7] items-center justify-center px-6">
      <View className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-gray-100 items-center">

        <View className="w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center mb-6">
          <Text className="text-white font-black text-xl">DM</Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-1">DETI Maker Lab</Text>
        <Text className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
          Sign in with your University of Aveiro account to access the lab.
        </Text>

        {error && (
          <View className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSSO}
          disabled={loading}
          className="w-full bg-indigo-600 py-4 rounded-2xl items-center active:bg-indigo-700"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">
              Sign in with UA Account
            </Text>
          )}
        </TouchableOpacity>

        <Text className="mt-6 text-xs text-gray-300 text-center">
          You will be redirected to the University of Aveiro identity service.
        </Text>
      </View>

      <Text className="mt-8 text-gray-400 text-xs">© 2026 Universidade de Aveiro</Text>
    </View>
  );
}