import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Input from "@/components/ui/input";
import Text from "@/components/ui/text";
import { useContext, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import { GetRequest } from "@/utils/requests";
import { router } from "expo-router";
import { colors } from "@/theme";
import { toast } from "sonner-native";

export default function TrackInput() {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const { state } = useContext(DataContext);
  const [isFocused, setIsFocused] = useState(false);

  const handleTrack = async () => {
    if (!state?.token) {
      return;
    }

    if (trackingId.trim() === "") {
      toast.error("Please enter a valid Tracking ID.");
      return;
    }

    setLoading(true);
      const res = await GetRequest(
        `/shipping/customer/tracking/${trackingId}`,
        state?.token
      );

      if (res?.status === 200 || res?.status === 201) {
        const id = res?.data?.data?.id;
        router.push(`/(app)/(tabs)/track/${id}`);
        setTrackingId(""); 
      } else {
        toast.error(res || "Unable to fetch tracking data.");
      }
   
      setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { borderColor: isFocused ? "#f97216" : "", borderWidth: isFocused ? 1 : 0 }]}>
        <Input
          style={{ color: colors.mutedForeground, flex: 1, paddingLeft: 10 }}
          placeholder="Type Tracking ID"
          placeholderTextColor="#63636380"
          value={trackingId.toUpperCase()}
          onChangeText={(value) => setTrackingId(value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <Pressable
          onPress={handleTrack}
          style={styles.button}
          disabled={loading || trackingId === ""}
        >
          <Text style={styles.buttonText}>Track</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="search" size={24} style={{ color: "#fff" }} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F3F3",
    padding: 5,
    borderRadius: 20,
    justifyContent: "space-between",
    overflow: "hidden",
    height: 55,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 8,
    backgroundColor: "#F97216",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: { color: "#fff", fontSize: 14 },
});
