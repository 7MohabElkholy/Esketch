import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Cairo: require("../assets/fonts/Cairo-Regular.ttf"),
    CairoBold: require("../assets/fonts/Cairo-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Protected guard={false}>
          <Stack.Screen name="(taps)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={true}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="singup" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </React.Fragment>
  );
}
