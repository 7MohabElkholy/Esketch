import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../utils/authContext";

const settigns = () => {
  const { logOut } = useAuth();

  return (
    <SafeAreaView>
      <Text>settigns</Text>
      <TouchableOpacity onPress={logOut}>
        <Text>log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default settigns;
