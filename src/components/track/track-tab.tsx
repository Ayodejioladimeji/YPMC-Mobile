import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import TrackEmptyState from "@/components/track/track-empty-state";
import Input from "@/components/ui/input";
import Text from "@/components/ui/text";
import { useAuthStore } from "@/store/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { GetRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { toast } from "sonner-native";
import TrackInput from "./trackInput";
import ShipmentItem from "./shipment-item";

export default function TrackTab() {
    const [activeOrders, setActiveOrders] = useState<any>([])
    const { state } = useContext(DataContext)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false);
  
    useEffect(() => {
      if (state?.token) {
        getActiveOrders()
      }
    }, [state?.token, state?.callback])
  
    const getActiveOrders = async () => {
      const res = await GetRequest("/shipping/customer?statusCategory=ACTIVE&limit=50", state?.token)
      if (res?.status === 200 || res?.status === 201) {
  
        setActiveOrders(res?.data?.data)
      }
  
      setLoading(false)
    }
  
    // on refresh
    const onRefresh = useCallback(() => {
      setRefreshing(true);
  
      getActiveOrders()
  
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
              <View style={{flex:1, marginTop: 10 }}>
                <FlatList
                  contentContainerStyle={styles.grid}
                  data={activeOrders}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => <ShipmentItem shipment={item} />}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
    paddingBottom: 20,
  },
});
