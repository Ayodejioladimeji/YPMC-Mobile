import { forwardRef, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  TextInput, // Import TextInput
} from "react-native";
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
import { saveVisitedAddress } from "@/utils/helper";
import RecentLocations from "./recent-locations";

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
  setLocation: (location: Location) => void;
};

const SNAP_POINTS = ["80%"];
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_API_KEY;

const LocationForm = forwardRef<BottomSheetModal, BottomSheetProps>(
  ({ index, position, closeModal, setLocation }, ref) => {
    const headerHeight = useHeaderHeight();
    const [googleLoading, setGoogleLoading] = useState(false);
    const googlePlacesRef = useRef<any>(null);
    const [isFocused, setIsFocused] = useState(false);


    useEffect(() => {
      const timeout = setTimeout(() => {
        const inputRef =
          googlePlacesRef.current?._textInput ||
          googlePlacesRef.current?.textInput?.current ||
          googlePlacesRef.current?.textInput;

        if (inputRef?.focus) {
          inputRef.focus();
        }
      }, 200);

      return () => clearTimeout(timeout);
    }, []);

    const getCurrentLocation = async () => {
      setGoogleLoading(true);

      // Get the current position
      const { coords } = await Locations.getCurrentPositionAsync({
        accuracy: Locations.Accuracy.High,
      });

      const { latitude, longitude } = coords;

      // Reverse geocoding to get the address
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const addressComponents = data.results[0]?.address_components || [];

          // Extract the address components
          const streetNumber =
            addressComponents.find((c: any) =>
              c.types.includes("street_number"),
            )?.long_name || "";
          const route =
            addressComponents.find((c: any) => c.types.includes("route"))
              ?.long_name || "";
          const area = addressComponents.find((c: any) =>
            c.types.includes("locality"),
          )?.long_name || "";
          const state = addressComponents.find((c: any) =>
            c.types.includes("administrative_area_level_1"),
          )?.long_name || "";

          // Construct the street address
          const street = [streetNumber, route].filter(Boolean).join(" ");

          googlePlacesRef.current?.setAddressText(`${street}, ${area}, ${state}`);

          // Set location state with the address and coordinates
          setLocation({
            longitude,
            latitude,
            street: street.trim(),
            area,
            state,
            // closestLandmark,
          });
          setGoogleLoading(false);
        })
        .catch((err: any) => console.error(err));
    };

    const handleContinue = () => {
      closeModal();
    };

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
            textInputProps={{  // Pass props to the inner TextInput
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
                color: "#333",
              },
              poweredContainer: {
                display: "none",
              },
            }}
            query={{ 
              key: GOOGLE_PLACES_API_KEY,
              language: "en",
              components: "country:NG",
            }}
            onPress={(data, details = null) => {
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
                  .filter(Boolean) // Remove empty strings
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
                };
                saveVisitedAddress(location);
              }
            }}
            onFail={(error) => console.error(error)}
            requestUrl={{
              url:
                "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api",
              useOnPlatform: "web",
            }}
          />

          <View
            style={{
              position: "absolute",
              top: 55,
              left: 5,
              opacity: googleLoading ? 0.5 : 1,
            }}
            pointerEvents={googleLoading ? "none" : "auto"}
          >
            <Pressable style={styles.sendLocation} onPress={getCurrentLocation}>
              <SendIcon />
              <Text style={{ fontSize: 15, fontFamily:'interSemiBold' }}>Use your current location</Text>
              {googleLoading && (
                <ActivityIndicator size="small" color={colors.mutedForeground} />
              )}
            </Pressable>
          </View>
          <View style={{ position: "absolute", top: 150, width: "100%", left: 10 }}>
            <RecentLocations
              setLocation={setLocation}
              googlePlacesRef={googlePlacesRef}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default LocationForm;

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
    alignItems:'center',
    gap: spacing.xxs,
  },
});