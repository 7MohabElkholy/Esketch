import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  I18nManager,
  Modal,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "../../../utils/authContext";

// Ensure RTL globally
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function AccountSettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { session, logOut, userData, updatedUserData } = useAuth();

  const handleSave = async () => {
    await updatedUserData({ first_name: firstName, last_name: lastName });
    setEditVisible(false);
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      {/* Header */}
      <Text className="text-2xl font-cairo_bold text-primary-700 mb-8">
        الإعدادات
      </Text>

      {/* Profile Section */}
      <View className="items-center mb-8">
        <Image
          source={require("../../../assets/images/profile-user.png")}
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
        <Text className="mt-3 text-lg font-cairo_semibold text-neutral-800">
          {userData?.first_name || "مستخدم"} {userData?.last_name || ""}
        </Text>
        <Text className="text-neutral-500 font-cairo text-sm">
          {session?.user?.email}
        </Text>
      </View>

      {/* Settings Options */}
      <View className="space-y-5">
        {/* Notifications */}
        {/* <View className="flex-row justify-between items-center bg-white rounded-lg p-4 shadow-sm">
          <Text className="font-cairo text-neutral-700 text-base">
            الإشعارات
          </Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ true: "#3f9ef2", false: "#d1d5db" }}
            thumbColor="#fff"
          />
        </View> */}

        {/* Edit Profile */}
        <TouchableOpacity
          className="bg-white rounded-lg p-4 shadow-sm"
          onPress={() => {
            setFirstName(userData?.first_name || "");
            setLastName(userData?.last_name || "");
            setEditVisible(true);
          }}
        >
          <Text className="font-cairo text-neutral-700 text-base">
            تغيير اسم الحساب
          </Text>
        </TouchableOpacity>

        {/* Change Password */}
        {/* <TouchableOpacity className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="font-cairo text-neutral-700 text-base">
            تغيير كلمة المرور
          </Text>
        </TouchableOpacity> */}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        className="mt-12 border-error border rounded-md py-3 shadow-md"
        onPress={logOut}
      >
        <Text className="text-error text-center font-cairo_semibold text-lg">
          تسجيل الخروج
        </Text>
      </TouchableOpacity>

      <View className="mt-8">
        <Text className="font-cairo_bold text-lg">برمجة وتطوير</Text>
        <Text className="font-cairo_medium text-base">مهاب الخولي</Text>
        <Text className="font-cairo text-neutral-500">
          في حالة وجود شكاوي او اقتراحات بالرجاء التواصل على 01551152503
        </Text>
        <Text className="font-cairo text-neutral-500">إصدار رقم (1.0.0)</Text>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="w-11/12 bg-white rounded-xl p-6">
            <Text className="text-lg font-cairo_bold text-primary-700 mb-4 text-center">
              تغيير اسم الحساب
            </Text>

            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="الاسم الأول"
              className="w-full bg-neutral-100 border border-neutral-300 rounded-md px-4 py-3 mb-3 text-right font-cairo"
            />

            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="اسم العائلة"
              className="w-full bg-neutral-100 border border-neutral-300 rounded-md px-4 py-3 mb-6 text-right font-cairo"
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-neutral-200 rounded-md py-3 mr-2"
                onPress={() => setEditVisible(false)}
              >
                <Text className="text-center font-cairo text-neutral-700">
                  إلغاء
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-primary-500 rounded-md py-3 ml-2"
                onPress={handleSave}
              >
                <Text className="text-center font-cairo_semibold text-white">
                  حفظ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
