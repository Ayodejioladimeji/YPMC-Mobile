import { Linking, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";

import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

import { Button } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { spacing } from "@/theme";
import TopNavigation from "@/components/TopNavigation";

export default function Support() {

  const openMailApp = () => {
    Linking.openURL('mailto:ypmcommunity.org@gmail.com');
  };


  const openWhatsApp = () => {
    const phoneNumber = "2348103979320";
    const message = "Hello, I need help with my delivery";

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          alert("WhatsApp is not installed or cannot be opened.");
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  // 

  return (
    <SafeAreaView style={styles.container}>
      <TopNavigation title="Support" />

      <View style={styles.content}>
        <Image
          source={require("@/assets/images/questions.png")}
          style={{
            width: 203,
            height: 203,
          }}
        />

        <Text
          style={{ fontSize: 16, fontFamily: "interMedium", color: "#636363" }}
        >
          How can we help you?
        </Text>
      </View>

      <View style={{ backgroundColor: "#fff" }}>
        <TouchableOpacity style={styles.itemContainer} onPress={openWhatsApp} >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MaterialCommunityIcons name="whatsapp" size={19} color="black" />
            <Text style={styles.itemText}>Live Chat</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="black" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={styles.itemContainer} onPress={() =>
          router.push("/(app)/(tabs)/account/support/case-request")
        }>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={17}
              color="black"
            />
            <Text style={styles.itemText}>Submit a Request</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={openMailApp} style={styles.itemContainer}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Feather name="mail" size={17} color="black" />
            <Text style={styles.itemText}>Send us an Email</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemContainer} onPress={() => router.push("/(app)/(tabs)/account/faqs")}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <AntDesign name="questioncircleo" size={18} color="black" />
            <Text style={styles.itemText}>FAQs</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    backgroundColor: "#F972161A",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 204,
    width: 204,
    borderRadius: 102,
    backgroundColor: "#F972161A",
    // marginTop: spacing.huge,
  },
  itemContainer: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  itemText: {
    fontSize: 14,
  },
  textStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    margin: spacing.xxs,
  },
  text: {
    fontSize: 14,
    fontFamily: "interRegular",
  },
});
