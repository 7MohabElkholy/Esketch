// import { registerRootComponent } from 'expo';

// import App from './App';

// // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// // It also ensures that whether you load the app in Expo Go or in a native build,
// // the environment is set up appropriately
// registerRootComponent(App);
import { View, Text } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="font-[CairoBold]">مرحباً بك في تطبيقنا</Text>
      <Text className="font-[Cairo]">مرحباً بك في تطبيقنا</Text>
      <Link href="singup">حساب جديد</Link>
    </View>
  );
};

export default index;
