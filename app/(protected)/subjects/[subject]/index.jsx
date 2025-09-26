//app\(protected)\subjects\[subject]\index.jsx
import React, { useLayoutEffect } from "react";

import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import PdfViewer from "../../../../components/PdfViewer";

export default function SubjectViewer() {
  const { url, subject } = useLocalSearchParams();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (subject) {
      console.log("subject from the url is: " + subject);

      navigation.setOptions({
        title: decodeURIComponent(subject),
        headerTitleStyle: {
          fontFamily: "Cairo_400Regular",
        },
      });
    }
  }, [navigation, subject]);

  if (!url) return <ActivityIndicator style={{ flex: 1 }} />;

  return <PdfViewer pdfUrl={url} />;
}
