import { forwardRef, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { SharedValue } from "react-native-reanimated";
import * as z from "zod";
import * as Locations from 'expo-location';
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";
import { SendIcon } from "@/assets/images/svgs";
import RecentLocations from "./recent-locations";
import { saveVisitedAddress } from "@/utils/helper";

const schema = z.object({
  longitude: z.number(),
  latitude: z.number(),
  street: z.string().min(1, { message: "Address is required" }),
  area: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  closestLandmark: z.string().optional(),
});

export type Location = z.infer<typeof schema>;

type BottomSheetProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
  defaultValues?: Location;
  closeModal: () => void;
  setLocation: any;
  // setLocation: (location: Location) => void;
};

const SNAP_POINTS = ["80%"];
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_API_KEY;
// 

const ReceiverLocationForm = forwardRef<BottomSheetModal, BottomSheetProps>(
  ({ index, defaultValues, position, closeModal, setLocation }, ref) => {
    const headerHeight = useHeaderHeight();
    const googlePlacesRef = useRef<any>(null);
    const [isFocused, setIsFocused] = useState(false);


    const handleContinue = () => {
      closeModal();
    };

    // 

    return (
      <BottomSheetModal
        animatedIndex={index}
        animatedPosition={position}
        // enableDismissOnClose={false}
        enableDynamicSizing={false}
        // enablePanDownToClose={false}
        key="LocationForm"
        name="LocationForm"
        keyboardBehavior="extend"
        ref={ref}
        snapPoints={SNAP_POINTS}
        style={styles.shadow}
        topInset={headerHeight}
        footerComponent={(props) => (
          <BottomSheetFooter {...props} bottomInset={0}>
            <View style={styles.footerContainer}>
              <Button onPress={handleContinue}>
                <ButtonText>Continue</ButtonText>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </Button>
            </View>
          </BottomSheetFooter>
        )}
      >
        <BottomSheetView style={styles.container}>
          <Text style={{ marginBottom: spacing.xs }}>Address</Text>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            fetchDetails
            placeholder="Enter street name and number"
            textInputProps={{
              onFocus: () => setIsFocused(true),
              onBlur: () => setIsFocused(false),
            }}
            styles={{
              textInput: {
                backgroundColor: "#FAFAFA",
                borderWidth: 1,
                fontSize: 14,
                fontFamily: "interRegular",
                borderColor: isFocused ? "#f97216" : "#6363631A",
              },
              listView: {
                zIndex: 9,
              },
              description: {
                fontSize: 14,
                color: '#333'
              },
              poweredContainer: {
                display: 'none',
              },
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: "en",
              components: "country:NG"
            }}
            onPress={(data, details = null) => {

              // console.log("details", JSON.stringify(details?.name, null, 2));
              if (details) {

                // Get street number if available
                const streetNumber =
                  details.address_components.find((c) =>
                    c.types.includes("street_number"),
                  )?.long_name || "";

                // Get route name
                const route =
                  details.address_components.find((c) =>
                    c.types.includes("route"),
                  )?.long_name || "";

                // Get subpremise (like Phase, Block etc) if available
                const subpremise =
                  details.address_components.find((c) =>
                    c.types.includes("subpremise"),
                  )?.long_name || "";

                // Get landmark/point of interest if available
                const landmark =
                  details.address_components.find((c) =>
                    c.types.includes("point_of_interest"),
                  )?.long_name || "";

                // Construct full street address
                const street = [
                  details?.name,
                  subpremise,
                  streetNumber,
                  route,
                  landmark ? `near ${landmark}` : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                const area =
                  details.address_components.find((c) =>
                    c.types.includes("locality"),
                  )?.long_name || "";

                const state =
                  details.address_components.find((c) =>
                    c.types.includes("administrative_area_level_1"),
                  )?.long_name || "";

                setLocation({
                  longitude: details.geometry.location.lng,
                  latitude: details.geometry.location.lat,
                  street: street.trim(),
                  area,
                  state,
                });

                const location = {
                  longitude: details.geometry.location.lng,
                  latitude: details.geometry.location.lat,
                  street: street.trim(),
                  area,
                  state,
                }
                saveVisitedAddress(location);
              }
            }}
            onFail={(error) => console.error(error)}
            requestUrl={{
              url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api",
              useOnPlatform: "web",
            }}
          />

          <View style={{ position: 'absolute', top: 100, width: '100%', left: 10 }}>
            <RecentLocations setLocation={setLocation} googlePlacesRef={googlePlacesRef} />
          </View>

        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default ReceiverLocationForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    position: 'relative'
  },
  wrapper: {
    gap: 20,
    marginTop: spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
  },
  selectedLocationStyle: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    marginBottom: 8,
  },
  coordinates: {
    color: "#666",
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#6363631A",
    fontSize: 14,
    fontFamily: "interRegular",
  },
  switch: {
    width: 50,
    height: 30,
  },
  track: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: "#F3F3F3",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#6363631A",
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    margin: 2,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 10,
  },
  radioGroupItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#6363631A",
  },
  datePlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#6363631A",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  shadow: {
    shadowColor: "#636363",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 15,
  },
  footerContainer: {
    marginHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 20
  },
  sendLocation: {
    marginTop: 40,
    display: "flex",
    flexDirection: "row",
    gap: spacing.xxs,
  },
});