import React, { useContext, useState } from "react"
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../ui/text";
import { Button, ButtonText } from "../ui/button";
import { colors, spacing } from "@/theme";
import { useRouter } from "expo-router";
import { PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { toast } from "sonner-native";


const CancelRequestModal = ({ setCancelModal, id }: any) => {
  const router = useRouter()
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const {state} = useContext(DataContext)
  const [loading, setLoading] = useState(false)

  const reasons = [
    "Rider is taking too long",
    "Wrong shipment information",
    "Change in delivery plans",
    "Other personal reasons",
  ];

  const handleSelect = (reason: string) => {
    setSelectedReason(reason);
  };

  const handleCancel = async() => {
    setLoading(true)

    const res = await PostRequest(`/shipping/${id}/cancel`, {} , state?.token)
    if(res?.status === 200 || res?.status === 201){
      toast.success(res?.data?.message)
    }

    router.replace("/(app)/(tabs)/home")
    setCancelModal(false)
    setLoading(false)
  }

  // 

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Why are you cancelling this delivery?</Text>

      {/* <Text style={styles.modalMessage}>
        Are you sure you want to cancel this shipment? This action cannot be undone.
      </Text> */}

      <View style={{ gap: 12, marginTop:20 }}>
        {reasons.map((reason, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSelect(reason)}
            style={[
              styles.reasonBox,
              selectedReason === reason && styles.selectedBox,
            ]}
          >
            <Text
              style={[
                styles.reasonText,
                selectedReason === reason && styles.selectedText,
              ]}
            >
              {reason}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: spacing.base, display: 'flex', flexDirection: "row", gap: spacing.xs }}>
        {/* <Button
          variant="outline"
          size="sm"
          style={{ flex: 1, width: "50%" }}
          onPress={() => setCancelModal(false)}
        >
          <ButtonText>No, Continue</ButtonText>

        </Button> */}
        <Button disabled={!selectedReason} variant='destructive' style={{ flex: 1, alignItems:'center', justifyContent:'center', opacity:!selectedReason ? 0.5 : 1 }} size="sm" onPress={handleCancel}>
          {loading ? <ActivityIndicator color="white" />
          :
          <ButtonText style={{ color: "#fff", margin:0, padding:0 }}>Cancel Delivery</ButtonText>}
        </Button>
      </View>
    </View>
  )
}

export default CancelRequestModal

const styles = StyleSheet.create({
  modalContent: {
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "interSemiBold",
    textAlign: "center",
    width:"90%"
  },
  modalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  reasonBox: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedBox: {
    backgroundColor: "#f8fbfe",
    borderColor: colors.primary, 
  },
  reasonText: {
    color: "#636363",
    fontSize: 16,
  },
  selectedText: {
    color: "#000",
    fontWeight: "500",
  },
});
