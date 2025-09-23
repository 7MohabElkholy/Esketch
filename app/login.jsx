import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import { Image } from "expo-image";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 bg-background px-6 justify-center">
      {/* Header */}
      <Image
        style={{
          width: 200,
          height: 160,
          alignSelf: "center",
        }}
        contentFit="contain"
        source={require("../assets/logo/LOGO.svg")}
      />
      <Text className="text-neutral-600 text-center mb-8 font-cairo text-base">
        سجّل دخولك للمتابعة
      </Text>

      {/* Input: Email */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="البريد الإلكتروني"
        placeholderTextColor="#A3A3A3"
        className="w-full bg-white border border-neutral-300 rounded-md px-4 py-3 mb-4 text-right font-cairo"
      />

      {/* Input: Password */}
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="كلمة المرور"
        placeholderTextColor="#A3A3A3"
        secureTextEntry
        className="w-full bg-white border border-neutral-300 rounded-md px-4 py-3 mb-6 text-right font-cairo"
      />

      {/* Login Button */}
      <TouchableOpacity className="bg-primary-600 rounded-md py-3">
        <Text className="text-white text-center font-cairo_medium text-lg">
          تسجيل الدخول
        </Text>
      </TouchableOpacity>

      {/* Secondary Actions */}
      <Text className="text-neutral-500 text-center mt-6 font-cairo">
        ليس لديك حساب؟{" "}
        <Link href="/singup" className="text-primary-600 font-cairo">
          إنشاء حساب
        </Link>
      </Text>
    </View>
  );
}
