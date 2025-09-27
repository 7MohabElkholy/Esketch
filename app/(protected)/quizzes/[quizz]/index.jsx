import React, {
  useMemo,
  useLayoutEffect,
  useEffect,
  useState,
  memo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { supabase } from "../../../../utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../../../utils/authContext";

// Memoized Answer Component
const AnswerOption = memo(({ text, selected, correct, submitted, onPress }) => {
  let optionStyle = "bg-gray-50 border-gray-200";
  let textStyle = "text-neutral-700";

  if (!submitted) {
    if (selected) {
      optionStyle = "bg-primary-100 border-primary-500";
      textStyle = "text-primary-800 font-cairo_semibold";
    }
  } else {
    if (correct) {
      optionStyle = "bg-green-100 border-green-500";
      textStyle = "text-green-800 font-cairo_semibold";
    } else if (selected && !correct) {
      optionStyle = "bg-red-100 border-red-500";
      textStyle = "text-red-800 font-cairo_semibold";
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={submitted}
      className={`p-3 mb-3 rounded-xl border ${optionStyle}`}
    >
      <Text className={`font-cairo text-base ${textStyle}`}>{text}</Text>
    </TouchableOpacity>
  );
});

const QuizScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { quizzData } = useLocalSearchParams();
  const { session } = useAuth();

  const [fetchedData, setFetchedData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const quizz = useMemo(() => {
    if (!quizzData) return null;
    try {
      return JSON.parse(decodeURIComponent(quizzData));
    } catch {
      return null;
    }
  }, [quizzData]);

  if (!quizz) {
    router.replace("/(protected)/(taps)/quizzes");
    return null;
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: quizz.subject || "Quiz",
      headerTitleStyle: { fontFamily: "Cairo_400Regular" },
    });
  }, [navigation, quizz.subject]);

  // Fetch quiz questions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cached = await AsyncStorage.getItem(`quiz_${quizz.id}`);
        if (cached) {
          setFetchedData(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("tests")
          .select("*")
          .eq("id", quizz.id)
          .single();
        if (error) throw error;

        setFetchedData(data);
        await AsyncStorage.setItem(`quiz_${quizz.id}`, JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizz]);

  const handleSelectAnswer = (questionId, answerIndex) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = async () => {
    if (!fetchedData?.questions) return;

    setSubmitting(true);

    const total = fetchedData.questions.length;
    let score = 0;
    fetchedData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer_index) score++;
    });

    try {
      // Insert report
      const { error: reportError } = await supabase.from("reports").insert({
        user_id: session.user.id,
        test_id: quizz.id,
        score,
        answers: selectedAnswers,
      });
      if (reportError) throw reportError;

      // Detect test type
      let testType = "OTHER";
      if (quizz.id.includes("MCQ")) testType = "MCQ";
      else if (quizz.id.includes("TFQ")) testType = "TFQ";

      // Upsert daily progress
      const { error: progressError } = await supabase
        .from("daily_progress")
        .upsert(
          {
            user_id: session.user.id,
            date: new Date().toISOString().slice(0, 10),
            test_type: testType,
            completed: true,
          },
          { onConflict: "user_id,date,test_type" }
        );
      if (progressError) console.error(progressError);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3f9ef2" />
        <Text className="mt-4 font-cairo text-gray-500">
          جاري تحميل الاختبار...
        </Text>
      </View>
    );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={fetchedData?.questions || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListHeaderComponent={
          <Text className="text-2xl font-cairo_bold mb-6 text-primary">
            {quizz.title}
          </Text>
        }
        renderItem={({ item, index }) => (
          <View
            key={item.id}
            className="bg-white rounded-2xl p-4 mb-6 shadow-sm"
          >
            <Text className="font-cairo_semibold text-lg mb-4 text-neutral-900">
              {index + 1}. {item.question_title}
            </Text>

            {item.answers.map((answer, aIndex) => (
              <AnswerOption
                key={aIndex}
                text={answer}
                selected={selectedAnswers[item.id] === aIndex}
                correct={aIndex === item.correct_answer_index}
                submitted={submitted}
                onPress={() => handleSelectAnswer(item.id, aIndex)}
              />
            ))}
          </View>
        )}
        ListFooterComponent={
          <View className="p-4 pb-10 border-t border-gray-200 bg-white">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || submitted}
              className={`rounded-xl p-4 ${
                submitting || submitted ? "bg-gray-400" : "bg-primary-500"
              }`}
            >
              <Text className="text-center font-cairo_bold text-white text-lg">
                {submitting
                  ? "جارٍ التقييم..."
                  : submitted
                    ? "تم إرسال الإجابات"
                    : "إرسال الإجابات"}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default QuizScreen;
