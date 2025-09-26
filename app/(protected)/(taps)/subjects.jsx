//app\(protected)\(taps)\subjects.jsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { getLectures } from "../../../utils/lecturesFetcher";
import { useRouter } from "expo-router";

export default function LectureList() {
  const [lectures, setLectures] = useState([]);
  const [groupedLectures, setGroupedLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await getLectures(true); // set true if bucket is private
        setLectures(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group by subject
  React.useEffect(() => {
    const grouped = lectures.reduce((acc, lecture) => {
      if (!acc[lecture.subject]) acc[lecture.subject] = [];
      acc[lecture.subject].push(lecture);
      return acc;
    }, {});

    setGroupedLectures(grouped);
  }, [lectures]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (lectures.length === 0) {
    <SafeAreaView className="flex-1 bg-background px-6 justify-center">
      <Image
        style={{
          width: 400,
          height: 250,
          alignSelf: "center",
        }}
        contentFit="contain"
        source={require("../../../assets/images/Learning-pana.svg")}
      />
      <Text className="text-2xl text-center font-cairo_bold text-primary">
        لا توجد مواد دراسية
      </Text>
      <Text className="font-cairo text-center text-sm text-gray-500 mt-2">
        لم يتم إضافة أي مواد دراسية بعد. يرجى التحقق مرة أخرى لاحقًا.
      </Text>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Image
        style={{
          width: 400,
          height: 250,
          alignSelf: "center",
        }}
        contentFit="contain"
        source={require("../../../assets/images/Learning-pana.svg")}
      />
      <ScrollView className="flex-1 bg-background px-6">
        {Object.entries(groupedLectures).map(([subject, subjectLeacture]) => (
          <View key={subject} className="mb-6">
            <Text className="text-xl font-cairo_bold mb-2">{subject}</Text>
            {subjectLeacture.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                onPress={() =>
                  router.push(
                    `/(protected)/subjects/${subject.subject}?url=${subject.pdf_url}`
                  )
                }
                className="bg-primary-50 rounded-xl p-4 mb-2"
              >
                <Text className="font-cairo_semibold text-lg text-neutral-800">
                  {subject.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
