import { Redirect, Stack } from "expo-router";
import React from "react";

const isLoggedIn = false;

export default function ProtoctedLayout() {
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(taps)" options={{ headerShown: false }} />
    </Stack>
  );
}
