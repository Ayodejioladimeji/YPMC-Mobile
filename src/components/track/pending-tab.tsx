import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import TrackEmptyState from "@/components/track/track-empty-state";
import { useCallback, useContext, useEffect, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import { GetRequest } from "@/utils/requests";
import TrackInput from "./trackInput";
import PendingShipmentItem from "./pending-shipment-item";


export default function PendingTab() {
  const [pendingOrders, setPendingOrders] = useState<any>([])
  const { state } = useContext(DataContext)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (state?.token) {
      getPendingOrders()
    }
  }, [state?.token])

  const getPendingOrders = async () => {
    const res = await GetRequest("/shipping/customer?statusCategory=PENDING&limit=50", state?.token)
    if (res?.status === 200 || res?.status === 201) {

      setPendingOrders(res?.data?.data)
    }
    setLoading(false)
  }

  // on refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    getPendingOrders()

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshing]);


  // 

  return (
    <View style={styles.container}>
      <TrackInput />

      {loading ? <ActivityIndicator color="#F97216" style={{ marginTop: 40 }} />
        :
        <View style={{flex:1, marginTop: 10}}>
          <FlatList
            contentContainerStyle={styles.grid}
            data={pendingOrders}
            keyExtractor={(item) => item.shipping.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <PendingShipmentItem shipment={item} />}
            ListEmptyComponent={TrackEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F3F3",
    padding: 5,
    borderRadius: 20,
    justifyContent: "space-between",
    overflow: "hidden",
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
  tabsHeader: {
    fontFamily: "interMedium",
    fontSize: 12,
  },
});
