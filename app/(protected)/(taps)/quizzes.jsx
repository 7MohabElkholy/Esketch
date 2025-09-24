import { View, Text, I18nManager } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const quizzes = () => {
  return (
    <SafeAreaView className="flex-1 bg-background px-6 justify-center">
      <Image
        style={{
          width: 400,
          height: 250,
          alignSelf: "center",
        }}
        contentFit="contain"
        source={require("../../../assets/images/Studying-pana.svg")}
      />
      <Text className="text-2xl text-center font-cairo_bold text-primary">
        لا توجد اختبارات متاحة حالياً
      </Text>
      <Text className="font-cairo text-center text-sm text-gray-500 mt-2">
        لم يتم اضافة اي اختبارات بعد. يرجى التحقق مرة اخرى لاحقا.
      </Text>
    </SafeAreaView>
  );
};

export default quizzes;
