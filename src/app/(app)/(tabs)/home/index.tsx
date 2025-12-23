import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import MapView from "react-native-maps";
import ShipmentOverview from "@/components/home/shipment-overview";
import { Button } from "@/components/ui/button";
import { GetRequest, PatchRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import { getInitials } from "@/utils/utils";
import SafeAreaViews from "@/components/safe-area-view";
import { toast } from "sonner-native";
import { colors } from "@/theme";
import AppUpdates from "@/components/app-updates";
import DeviceInfo from 'react-native-device-info';
import { SubscriptionIcon } from "@/assets/images/svgs";
import Subscription from "@/components/home/subscription";
import OngoingShipment from "@/components/home/ongoing-shipment";
import OngoingShipmentBanner from "@/components/home/ongoing-shipment-banner";



export default function Home() {
  const mapRef = useRef<MapView | null>(null);
  const router = useRouter();
  const { state, dispatch } = useContext(DataContext)
  const { user } = state
  const [loading, setLoading] = useState(false)
  const [trackingId, setTrackingId] = useState("")
  const [callback, setCallback] = useState(false)
  const [isFocused, setIsFocused] = useState(false);
  const [count, setCount] = useState(0)
  const appVersion = DeviceInfo.getVersion();
  const [version, setVersion] = useState()
  const appState = useRef(AppState.currentState);
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [subscriptionModal, setSubscriptionModal] = useState(false)


  const getVersion = async () => {

    const res = await GetRequest('/app-versions', state?.token);
    if (res?.status === 200 || res?.status === 201) {

      const ios = res?.data?.data?.find(item => item?.platform === "ios")
      const android = res?.data?.data?.find(item => item?.platform === "android")

      if (
        Platform.OS === 'android' &&
        android?.versionNumber !== appVersion
      ) {
        setVersion(android.versionNumber)
        setIsModalVisible(true);
        // console.log(appVersion, android?.versionNumber)
      }

      if (
        Platform.OS === 'ios' &&
        ios?.versionNumber !== appVersion
      ) {
        setVersion(ios.versionNumber)
        setIsModalVisible(true);
        // console.log(appVersion, ios?.versionNumber)
      }
    }

  };

  useEffect(() => {
    if (state?.token) {
      getVersion();
    }
  }, [state?.token]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        getVersion()
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [getVersion]);


  // get user profile
  useEffect(() => {
    if (state?.token) {
      const getProfile = async () => {
        const res = await GetRequest("/customer/profile", state?.token)
        if (res?.status === 200 || res?.status === 201) {
          dispatch({ type: ACTIONS.USER, payload: res?.data?.data })
          dispatch({ type: ACTIONS.PROFILE_LOADING, payload: false })
        }
      }
      getProfile()
    }
  }, [state?.token, state?.callback])

  useEffect(() => {
    if (state?.token) {
      const getNotifications = async () => {
        const res = await GetRequest("/notifications?page=1&limit=30", state?.token)
        if (res?.status === 200 || res.status === 201) {
          dispatch({ type: ACTIONS.NOTIFICATIONS, payload: res?.data?.data?.data })
          const notificationCount = res?.data?.data?.data?.filter(item => item?.isRead === false)
          setCount(notificationCount?.length)
        }
        setLoading(false)
      }
      getNotifications()
    }
  }, [state?.token, state?.message, state?.notificationCallback])


  useEffect(() => {
    if (state?.token && trackingId) {

      trackOrders()
    }
  }, [state?.token, callback])

  const trackOrders = async () => {
    if (!state?.token) {
      return;
    }


    if (trackingId.trim() === "") {
      toast.error("Please enter a valid Tracking ID.");
      return;
    }

    setLoading(true)

    const res = await GetRequest(`/shipping/customer/tracking/${trackingId}`, state?.token)
    if (res?.status === 200 || res?.status === 201) {
      const id = res?.data?.data?.id
      router.push(`/(app)/(tabs)/track/${id}`)
      setTrackingId("")
    }

    else {
      toast.error(res)
    }

    setLoading(false)

  }

  // get delivery code
  const getDeliveryQuote = () => {
    router.push("/(app)/quote")
  }


  const handleRead = async () => {
    router.push("/(app)/(tabs)/home/notifications")
    const res = await PatchRequest(`/notifications/read-all`, {}, state?.token)
    if (res?.status === 200 || res?.status === 201) {
      dispatch({ type: ACTIONS.NOTIFICATION_CALLBACK, payload: !state?.notificationCallback })
    }
  }

  // 

  return (

    <SafeAreaViews>

      <BottomSheet
        index={0}
        enableDynamicSizing={false}
        handleComponent={() => null}
        snapPoints={Platform.OS === "ios" ? ["95%"] : ["100%"]}
        enablePanDownToClose={false}
        enableHandlePanningGesture={false}
        enableContentPanningGesture={false}
      >
        <BottomSheetScrollView contentContainerStyle={{}}>
          <View style={styles.headerContainer}>

            {state?.profileLoading ? <ActivityIndicator size="small" />
              :
              <TouchableOpacity onPress={() => router.push("/(app)/(tabs)/account/profile-details")}>
                {user?.metadata?.profileImageUrl ?
                  <View style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: "50%", borderWidth: 1, borderColor: "#999" }}>
                    <Image
                      source={{ uri: user?.metadata?.profileImageUrl }}
                      style={{ width: 40, height: 40, borderRadius: 50 }}
                    />
                  </View>
                  :
                  <View style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: "50%", borderWidth: 1, borderColor: "#999" }}>
                    <Text>{(`${user?.user?.firstName?.charAt(0).toUpperCase()} ${user?.user?.lastName?.charAt(0).toUpperCase()}`)}</Text>
                  </View>
                }
              </TouchableOpacity>
            }

            <View>
              <Text style={styles.greeting}>
                Hey {user?.user?.firstName}👋
              </Text>

              <Text style={styles.subgreeting}>
                Let's get your package shipped!
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleRead}
              style={styles.notificationButton}
            >
              <View style={{ position: "relative" }}>
                <Ionicons name="notifications-outline" size={28} />

                {count > 0 && <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{count}</Text>
                </View>}
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.cardContainerStyle}>
              <View style={styles.cardStyle}>
                <Text style={styles.cardTitle}>
                  Locate Your Delivery Easily
                </Text>

                <View style={[styles.searchContainer, isFocused && { borderColor: "#f97216" }]}>
                  <TextInput
                    placeholder="Type Tracking ID"
                    placeholderTextColor="#63636380"
                    style={styles.searchInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    value={trackingId.toUpperCase()}
                    onChangeText={(value) => setTrackingId(value)}
                  />

                  <Button
                    onPress={() => setCallback(!callback)}
                    size="icon"
                    style={{ height: 37, width: 37, borderRadius: 48 }}
                  >
                    {loading ? <ActivityIndicator size="small" color="#fff" /> :
                      <Ionicons
                        name="search"
                        size={20}
                        color="white"
                        style={styles.searchIcon}
                      />}

                  </Button>
                </View>
              </View>
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <View style={styles.quickActionsContainer}>
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: 'center'
                }}>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <Pressable
                    onPress={() => {
                      router.push("/(app)/(tabs)/ship/all-quotes"),
                        dispatch({ type: ACTIONS.ORDER_DATA })
                    }}
                    style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 16,
                        fontWeight: 600
                      }}
                    >
                      All quotes
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.quickActions}>
                  {/* Quick Action Buttons */}
                  <TouchableOpacity
                    onPress={() => router.push("/(app)/(tabs)/ship")}
                    style={[styles.actionButton, styles.blueAction]}
                  >
                    <View style={styles.actionIconContainer}>
                      <Image
                        source={require("@/assets/images/package-1.svg")}
                        style={{ height: 40, width: 40 }}
                      />
                    </View>
                    <Text style={styles.actionText}>New Shipment</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={getDeliveryQuote}
                    style={[styles.actionButton, styles.orangeAction]}
                  >
                    <View style={styles.actionIconContainer}>
                      <Image
                        source={require("@/assets/images/package-2.svg")}
                        style={{ height: 40, width: 40 }}
                      />
                    </View>
                    <Text style={styles.actionText}>Get Delivery Quote</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <OngoingShipmentBanner/>

              {/* <OngoingShipment/> */}

              <ShipmentOverview />
            </View>
          </View>

          {isModalVisible && <AppUpdates isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} version={version} />}

          {/* modal for 360 */}
          {subscriptionModal && <Subscription isModalVisible={subscriptionModal} setIsModalVisible={setSubscriptionModal} />}

        </BottomSheetScrollView>
      </BottomSheet>

      {user?.subscription &&
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            right: 20,
            bottom: -10,
            elevation: 10,
          }}
          onPress={() => setSubscriptionModal(true)}
        >
          <SubscriptionIcon />
        </TouchableOpacity>}
    </SafeAreaViews>
  );

}

const styles = StyleSheet.create({

  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    backgroundColor: "#fff",
  },
  headerBackground: {
    height: "100%",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  headerContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 10,
  },
  greeting: {
    fontFamily: "interMedium",
    fontSize: 16,
  },
  subgreeting: {
    fontSize: 12,
    marginTop: 5,
  },
  notificationButton: {
    marginLeft: "auto",
  },
  notificationBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    height: 18,
    width: 18,
    backgroundColor: "red",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 10,
    fontFamily: "interSemiBold",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    paddingBottom: 40,
  },
  cardContainerStyle: {
    paddingVertical: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomEndRadius: 20,
  },
  cardStyle: {
    backgroundColor: "#1E83C5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  cardTitle: {
    maxWidth: 158,
    color: "#fff",
    fontFamily: "interMedium",
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 5,
    marginTop: 20,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 12,
    paddingLeft: 10
  },
  searchIcon: {
    backgroundColor: "#F97216",
    borderRadius: 9999,
    padding: 5,
  },
  quickActionsContainer: {},
  sectionTitle: {
    fontFamily: "interMedium",
    fontSize: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 20,
    padding: 20,
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  blueAction: {
    backgroundColor: "#1E83C533",
    borderWidth: 1,
    borderColor: "#1E83C533",
  },
  orangeAction: {
    backgroundColor: "#F9721633",
    borderWidth: 1,
    borderColor: "#F9721633",
  },
  actionIconContainer: {
    backgroundColor: "white",
    borderRadius: 9999,
    padding: 5,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  shipmentOverviewIcon: {
    backgroundColor: "#4FB94833",
    borderRadius: 9999,
    padding: 5,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: 500
  },
});
