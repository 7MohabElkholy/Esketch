import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { useRouter, useNavigation } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../utils/supabase";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const ReportsListScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("User not logged in");

        const { data, error } = await supabase
          .from("reports")
          .select("id, score, created_at, tests(title, subject)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "التقارير",
      headerTitleStyle: {
        fontFamily: "Cairo_400Regular",
      },
    });
  }, [navigation]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3f9ef2" />
        <Text className="mt-4 font-cairo text-gray-500">
          جاري تحميل التقارير...
        </Text>
      </View>
    );
  }

  if (!reports.length) {
    return (
      <SafeAreaView className="flex-1 bg-background px-6 justify-center">
        <Image
          style={{
            width: 400,
            height: 250,
            alignSelf: "center",
          }}
          contentFit="contain"
          source={require("../../../assets/images/Data report-bro.svg")}
        />
        <Text className="text-2xl text-center font-cairo_bold text-primary">
          لا توجد اي تقارير
        </Text>
        <Text className="font-cairo text-center text-sm text-gray-500 mt-2">
          لم تقم بأخذ اي اختبار حتى الآن, خذ واحدًا ثم حاول مرة اخرى.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView className="p-4 bg-background">
      {reports.map((report) => (
        <TouchableOpacity
          key={report.id}
          className="bg-white rounded-xl p-4 mb-3 shadow-sm"
          onPress={
            () => router.push(`/reports/${report.id}`) // navigate to full report
          }
        >
          <Text className="font-cairo_semibold text-lg">
            {report.tests.title}
          </Text>
          <Text className="text-gray-500 font-cairo">
            الدرجة: {report.score} | التاريخ:{" "}
            {new Date(report.created_at).toLocaleDateString()} |{" "}
            {report.tests.subject}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default ReportsListScreen;
