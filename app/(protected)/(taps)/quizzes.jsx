import {
  View,
  Text,
  I18nManager,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { supabase } from "../../../utils/supabase";
import { useRouter } from "expo-router";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const Quizzes = () => {
  const [quizzes, setQuizzes] = React.useState([]);
  const [groupedQuizzes, setGroupedQuizzes] = React.useState({});
  const router = useRouter();

  // Fetch tests from Supabase
  React.useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data: tests, error } = await supabase
          .from("tests")
          .select("id, title, subject");

        if (error) throw error;
        setQuizzes(tests || []);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };
    fetchQuizzes();
  }, []);

  // Group by subject
  React.useEffect(() => {
    const grouped = quizzes.reduce((acc, test) => {
      if (!acc[test.subject]) acc[test.subject] = [];
      acc[test.subject].push(test);
      return acc;
    }, {});
    setGroupedQuizzes(grouped);
  }, [quizzes]);

  // Empty state
  if (quizzes.length === 0) {
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
  }

  // Render grouped tests
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Image
        style={{
          width: 400,
          height: 250,
          alignSelf: "center",
        }}
        contentFit="contain"
        source={require("../../../assets/images/Studying-pana.svg")}
      />
      <ScrollView className="flex-1 bg-background px-6">
        {Object.entries(groupedQuizzes).map(([subject, subjectTests]) => (
          <View key={subject} className="mb-6">
            <Text className="text-xl font-cairo_bold mb-2">{subject}</Text>
            {subjectTests.map((test) => (
              <TouchableOpacity
                key={test.id}
                onPress={() =>
                  router.push(
                    `/(protected)/quizzes/${test.id}?quizzData=${encodeURIComponent(JSON.stringify(test))}`
                  )
                }
                className="bg-primary-50 rounded-xl p-4 mb-2"
              >
                <Text className="font-cairo_semibold text-lg text-neutral-800">
                  {test.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Quizzes;
