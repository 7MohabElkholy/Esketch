import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  I18nManager,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { supabase } from "../../../utils/supabase";
import { useRouter } from "expo-router";
import Octicons from "@expo/vector-icons/Octicons";
import { useAuth } from "../../../utils/authContext";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Memoized Quiz Item
const QuizItem = memo(({ test, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-primary-50 rounded-xl p-4 mb-2 flex-row items-center justify-between"
  >
    <Text className="font-cairo_semibold text-lg text-neutral-800">
      {test.title}
    </Text>
    {test.taken && <Octicons name="check-circle" size={20} color="green" />}
  </TouchableOpacity>
));

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { session } = useAuth();

  // Fetch quizzes and reports
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!session?.user) return;
      try {
        const [
          { data: tests, error: testsError },
          { data: reports, error: reportsError },
        ] = await Promise.all([
          supabase.from("tests").select("id, title, subject"),
          supabase
            .from("reports")
            .select("test_id")
            .eq("user_id", session.user.id),
        ]);

        if (testsError) throw testsError;
        if (reportsError) throw reportsError;

        const takenSet = new Set(reports.map((r) => r.test_id));
        const quizzesWithStatus = tests.map((q) => ({
          ...q,
          taken: takenSet.has(q.id),
        }));
        setLoading(false);
        setQuizzes(quizzesWithStatus);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, [session]);

  // Group quizzes by subject
  const groupedQuizzes = useMemo(() => {
    return quizzes.reduce((acc, test) => {
      if (!acc[test.subject]) acc[test.subject] = [];
      acc[test.subject].push(test);
      return acc;
    }, {});
  }, [quizzes]);

  // Navigate to quiz
  const handlePress = useCallback(
    (test) => {
      router.push(
        `/(protected)/quizzes/${test.id}?quizzData=${encodeURIComponent(
          JSON.stringify(test)
        )}`
      );
    },
    [router]
  );

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3f9ef2" />
        <Text className="mt-4 font-cairo text-gray-500">
          جاري تحميل الاختبارات...
        </Text>
      </View>
    );

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      {/* Top Illustration */}
      <Image
        style={{ width: 400, height: 250, alignSelf: "center" }}
        contentFit="contain"
        source={require("../../../assets/images/Studying-pana.svg")}
      />

      {quizzes.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-2xl text-center font-cairo_bold text-primary mt-4">
            لا توجد اختبارات متاحة حالياً
          </Text>
          <Text className="font-cairo text-center text-sm text-gray-500 mt-2">
            لم يتم اضافة اي اختبارات بعد. يرجى التحقق مرة اخرى لاحقا.
          </Text>
        </View>
      ) : (
        <FlatList
          data={Object.entries(groupedQuizzes)}
          keyExtractor={([subject]) => subject}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item: [subject, tests] }) => (
            <View className="mb-6">
              <Text className="text-xl font-cairo_bold mb-2">{subject}</Text>
              {tests.map((test) => (
                <QuizItem
                  key={test.id}
                  test={test}
                  onPress={() => handlePress(test)}
                />
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Quizzes;
