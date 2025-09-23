import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../utils/authContext";

export default function ProtoctedLayout() {
  const { session } = useAuth();

  if (session === null) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(taps)" options={{ headerShown: false }} />
    </Stack>
  );
}
