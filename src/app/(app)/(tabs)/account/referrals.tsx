import { ActivityIndicator, AppState, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import SafeAreaViews from "@/components/safe-area-view";
import TopNavigation from "@/components/TopNavigation";
import ShareAndCopy from "@/components/account/share-and-copy";
import { GetRequest } from "@/utils/requests";
import { RefreshControl } from "react-native-gesture-handler";

export default function Referrals() {
  const { state } = useContext(DataContext)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const appState = useRef(AppState.currentState);
  const [refreshing, setRefreshing] = useState(false);

  const getData = async () => {
    const res = await GetRequest(`/customer/referral-stats`, state?.token)
    if (res?.status === 200 || res?.status === 201) {
      setData(res?.data?.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [state?.message])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        getData()
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [getData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    getData()

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshing]);

  // 

  return (
    <SafeAreaViews>
      <TopNavigation title="Referrals" />


      <ScrollView style={styles.container} refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }>
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <View style={styles.imageContainer}>
            <Image
              source={require("@/assets/images/giftbox.png")}
              style={{
                width: 82,
                height: 85,
                alignSelf: "center",
              }}
            />
          </View>

          <ShareAndCopy />
        </View>

        <View
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "#6363631A",
          }}
        />

        <View style={{ marginTop: spacing.xl }}>
          <Text style={{ fontSize: 16, fontFamily: "interMedium" }}>
            Referral history
          </Text>

          <View style={styles.statContainer}>
            <Text style={styles.statTitle}>Total Cash Earned</Text>
            {loading ?
              <ActivityIndicator /> :
              <Text style={{ fontSize: 16, fontFamily: "interMedium" }}>₦{data?.totalCashEarnedInNaira}</Text>
            }
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <View style={styles.statContainer}>
              <Text style={styles.statTitle}>Friends who Signed Up</Text>
              {loading ?
                <ActivityIndicator /> :
                <Text style={{ fontSize: 16, fontFamily: "interMedium" }}>{data?.friendsWhoSignedUp}</Text>
              }
            </View>

            <View style={styles.statContainer}>
              <Text style={styles.statTitle}>Friends who Shipped</Text>
              {loading ?
                <ActivityIndicator /> :
                <Text style={{ fontSize: 16, fontFamily: "interMedium" }}>{data?.friendsWhoShipped}</Text>}
            </View>
          </View>

          <View style={styles.banner}>
            <Feather name="info" size={24} color={colors.primary} />
            <Text style={{ color: "rgba(99, 99, 99, 1)", fontSize: 12, flex: 1 }}>
              Get ₦500 when a friend signs up with your referral code and
              completes a shipment!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaViews>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
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
  buttonContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    gap: 10,
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  statContainer: {
    flex: 1,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: "#6363631A",
    borderRadius: 20,
    marginTop: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  statTitle: {
    color: "#636363",
    fontSize: 12,
    fontFamily: "interMedium",
  },
  banner: {
    marginTop: spacing.xl,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(249, 114, 22, 0.1)",
    flexDirection: "row",
    gap: 10,
  },
});
