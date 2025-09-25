import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { supabase } from "../../../../utils/supabase";

const ReportScreen = () => {
  const router = useRouter();
  const { report } = useLocalSearchParams();
  const [fetchedReport, setFetchedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // ✅ simple UUID validator (no npm needed)
  const isValidUUID = (id) =>
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    );

  useLayoutEffect(() => {
    if (!fetchedReport?.tests?.subject) return;

    navigation.setOptions({
      title: fetchedReport.tests.subject,
      headerTitleStyle: {
        fontFamily: "Cairo_400Regular",
      },
    });
  }, [navigation, fetchedReport?.tests?.subject]);

  useEffect(() => {
    if (!report || !isValidUUID(report)) {
      router.replace("/(protected)/reports");
      return;
    }

    const fetchReport = async () => {
      console.log("Fetching reportId:", report);

      try {
        const { data, error } = await supabase
          .from("reports")
          .select("id, score, answers, created_at, tests(*)")
          .eq("id", report)
          .single();

        if (error) throw error;

        setFetchedReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [report]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading report...</Text>
      </View>
    );
  }

  if (!fetchedReport) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Report not found</Text>
      </View>
    );
  }

  const { tests, answers, score, created_at } = fetchedReport;

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      {/* Report Header */}
      <Text className="text-2xl font-cairo_bold mb-2 text-primary">
        {tests.title}
      </Text>
      <Text className="mb-6 text-neutral-600">
        Score: {score} | Date: {new Date(created_at).toLocaleDateString()}
      </Text>

      {/* Questions */}
      {tests.questions.map((q, index) => {
        const userAnswerIndex = answers[q.id];
        const correct = q.correct_answer_index;

        return (
          <View key={q.id} className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            {/* Question Title */}
            <Text className="font-cairo_semibold text-lg mb-4 text-neutral-900">
              {index + 1}. {q.question_title}
            </Text>

            {/* Answers */}
            {q.answers.map((ans, i) => {
              let optionStyle = "bg-gray-50 border-gray-200";
              let textStyle = "text-neutral-700";

              // Highlighting based on correctness
              if (i === correct) {
                optionStyle = "bg-green-100 border-green-500";
                textStyle = "text-green-800 font-cairo_semibold";
              } else if (userAnswerIndex === i && i !== correct) {
                optionStyle = "bg-red-100 border-red-500";
                textStyle = "text-red-800 font-cairo_semibold";
              }

              return (
                <View
                  key={i}
                  className={`p-3 mb-3 rounded-xl border ${optionStyle}`}
                >
                  <Text className={`font-cairo text-base ${textStyle}`}>
                    {ans}
                  </Text>
                </View>
              );
            })}

            {/* Explanation */}
            {q.explanation && (
              <Text className="font-cairo text-gray-500 mt-2">
                *{q.explanation}
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default ReportScreen;
