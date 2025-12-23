import { useContext, useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, View } from "react-native";

import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

import { Button, ButtonText } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Text from "@/components/ui/text";
import { useShippingStore } from "@/store/shipping";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";

const shippingTypes = [
  {
    id: "basic",
    title: "Basic",
    description: "Ship a single package through a single route",
    image: require("@/assets/images/package.png"),
  },
  {
    id: "multiple",
    title: "Multiple",
    description: "Ship multiple packages to different destinations",
    image: require("@/assets/images/boxes.png"),
  },
];

export default function ShippingHome() {
  const [selectedType, setSelectedType] = useState("");
  const { setType } = useShippingStore((state) => state.actions);
  const {state, dispatch} = useContext(DataContext)
  

  function handleSubmit() {
    if (!selectedType) return;
    setType(selectedType);

    dispatch({type:ACTIONS.SHIPPING_TYPE, payload:selectedType})
    dispatch({type:ACTIONS.MORE_ORDER, payload: false})
    dispatch({ type: ACTIONS.DELIVERY_MODE, payload: false })

    if(selectedType === "multiple" && !state?.firstTime){
      dispatch({type:ACTIONS.ORDER_DATA, payload:null})
      dispatch({type:ACTIONS.CLEAR_MULTIPLE_DATA})
    }
    
    if(selectedType === "multiple"){
      dispatch({type:ACTIONS.FIRST_TIME, payload: true})
    }
    router.push("/(app)/(tabs)/ship/package-locations");
  }

  // 

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ gap: 50, paddingHorizontal:16 }}>
        <Text style={styles.subHeader}>Select a shipping type</Text>

        <RadioGroup
          value={selectedType}
          onValueChange={setSelectedType}
          style={styles.optionsContainer}
          accessibilityLabel="Options"
        >
          {shippingTypes.map((type) => (
            <RadioGroupItem
              key={type.id}
              value={type.id}
              style={styles.contentContainer}
            >
              <Text
                style={{
                  alignSelf: "flex-start",
                  fontSize: 14,
                  fontFamily: "interMedium",
                }}
              >
                {type.title}
              </Text>

              <Image style={styles.image} source={type.image} />

              <Text style={styles.description}>{type.description}</Text>
            </RadioGroupItem>
          ))}
        </RadioGroup>

        <Button
          disabled={!selectedType}
          onPress={handleSubmit}
          style={{ gap: 5 }}
        >
          <ButtonText>Continue</ButtonText>
          <AntDesign name="arrowright" size={18} color="white" />
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  subHeader: {
    fontSize: 20,
    fontFamily: "interMedium",
    textAlign: "center",
    fontWeight:'bold'
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
  },
  image: {
    width: 78,
    height: 78,
    marginTop: 44,
    marginBottom: 16,
  },
  description: {
    fontSize: 12,
    textAlign: "center",
  },
});
