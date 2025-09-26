import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useLayoutEffect, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { supabase } from "../../../../utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../../../utils/authContext";

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

  // Parse the quiz data passed from params
  const quizz = useMemo(() => {
    if (!quizzData) return null;
    try {
      return JSON.parse(decodeURIComponent(quizzData));
    } catch (e) {
      console.error("Invalid quizzData:", e);
      return null;
    }
  }, [quizzData]);

  if (!quizz) {
    router.replace("/(protected)/(taps)/quizzes");
    return null;
  }

  // Set header title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: quizz.subject || "Quiz",
      headerTitleStyle: {
        fontFamily: "Cairo_400Regular",
      },
    });
  }, [navigation, quizz?.subject]);

  // Fetch quiz questions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Try cache first
        const cached = await AsyncStorage.getItem(`quiz_${quizz.id}`);
        if (cached) {
          console.log("Loaded from cache ✅");
          setFetchedData(JSON.parse(cached));
          setLoading(false);
          return;
        }

        // If no cache → fetch from Supabase
        const { data: tests, error } = await supabase
          .from("tests")
          .select("*")
          .eq("id", quizz.id)
          .single();

        if (error) throw error;

        console.log("Fetched from Supabase 🌐");
        setFetchedData(tests);

        // Save to cache
        await AsyncStorage.setItem(`quiz_${quizz.id}`, JSON.stringify(tests));
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizz]);

  // Handle selecting an answer
  const handleSelectAnswer = (questionId, answerIndex) => {
    if (submitted) return; // disable changes after submit
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  // Handle quiz submission
  const handleSubmit = async () => {
    if (!fetchedData?.questions) return;

    setSubmitting(true);

    let score = 0;
    const total = fetchedData.questions.length;

    fetchedData.questions.forEach((question) => {
      const selected = selectedAnswers[question.id];
      if (selected === question.correct_answer_index) {
        score++;
      }
    });

    console.log("Quiz Results:");
    console.log("Selected Answers:", selectedAnswers);
    console.log(`Score: ${score} / ${total}`);

    // 1. Insert report
    const { error: reportError } = await supabase.from("reports").insert({
      user_id: session.user.id,
      test_id: quizz.id,
      score,
      answers: selectedAnswers, // e.g. { MCQ1: 2, MCQ2: 0 }
    });

    if (reportError) {
      console.error("Error inserting report:", reportError);
      setSubmitting(false);
      return;
    }

    // 2. Detect test type from ID (logsticMCQQ1 → MCQ)
    let testType = "OTHER";
    if (quizz.id.includes("MCQ")) testType = "MCQ";
    else if (quizz.id.includes("TFQ")) testType = "TFQ";

    // 3. Upsert into daily_progress
    const { error: progressError } = await supabase
      .from("daily_progress")
      .upsert(
        {
          user_id: session.user.id,
          date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
          test_type: testType,
          completed: true,
        },
        { onConflict: "user_id,date,test_type" } // ensures uniqueness
      );

    if (progressError) {
      console.error("Error updating daily progress:", progressError);
    } else {
      console.log(`Daily progress updated for type: ${testType}`);
    }

    setSubmitting(false);
    setSubmitted(true); // lock answers & show results
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3f9ef2" />
        <Text className="mt-4 font-cairo text-gray-500">
          جاري تحميل الاختبار...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-cairo_bold mb-6 text-primary">
          {quizz.title}
        </Text>

        {fetchedData?.questions?.map((question, qIndex) => (
          <View
            key={question.id}
            className="bg-white rounded-2xl p-4 mb-6 shadow-sm"
          >
            <Text className="font-cairo_semibold text-lg mb-4 text-neutral-900">
              {qIndex + 1}. {question.question_title}
            </Text>

            {question.answers.map((answer, aIndex) => {
              const selected = selectedAnswers[question.id];
              const correct = question.correct_answer_index;

              let optionStyle = "bg-gray-50 border-gray-200";
              let textStyle = "text-neutral-700";

              if (!submitted) {
                // Before submission → highlight selection only
                if (selected === aIndex) {
                  optionStyle = "bg-primary-100 border-primary-500";
                  textStyle = "text-primary-800 font-cairo_semibold";
                }
              } else {
                // After submission → highlight correct/wrong
                if (aIndex === correct) {
                  optionStyle = "bg-green-100 border-green-500";
                  textStyle = "text-green-800 font-cairo_semibold";
                } else if (selected === aIndex && aIndex !== correct) {
                  optionStyle = "bg-red-100 border-red-500";
                  textStyle = "text-red-800 font-cairo_semibold";
                }
              }

              return (
                <TouchableOpacity
                  key={aIndex}
                  onPress={() => handleSelectAnswer(question.id, aIndex)}
                  disabled={submitted}
                  className={`p-3 mb-3 rounded-xl border ${optionStyle}`}
                >
                  <Text className={`font-cairo text-base ${textStyle}`}>
                    {answer}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        {/* Submit Button */}
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
      </ScrollView>
    </View>
  );
};

export default QuizScreen;
