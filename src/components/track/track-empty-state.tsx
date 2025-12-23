import { View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";

export default function TrackEmptyState() {
  const router = useRouter();
  return (
    <View style={{flex:1}}>
      <Image
        source={require("@/assets/images/logistics-bus.png")}
        style={{
          width: 184,
          height: 184,
          marginBottom: 50,
          alignSelf: "center",
        }}
      />

      <Text style={{ textAlign: "center", fontSize: 16, color: "#636363" }}>
        All clear! Add a shipment
      </Text>

      <Button
        style={{ marginTop: 50 }}
        onPress={() => router.push("/(app)/(tabs)/ship")}
      >
        <ButtonText>Add a Shipment</ButtonText>
        <Ionicons name="arrow-forward" size={24} style={{ color: "#fff" }} />
      </Button>
    </View>
  );
}
