import { useState, useEffect } from "react";
import { SafeAreaView, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useLocalSearchParams } from "expo-router";

import ActiveTab from "@/components/track/active-tab";
import PendingTab from "@/components/track/pending-tab";
import ShippingTab from "@/components/track/shipping-tab";
import { colors } from "@/theme";
import TrackNavigation from "@/components/TrackNavigation";
import ScheduledTab from "@/components/track/scheduled-tab";


const renderScene = SceneMap({
  active: ActiveTab,
  pending: PendingTab,
  scheduled: ScheduledTab,
  completed: ShippingTab,
});

const routes = [
  { key: "active", title: "Active" },
  { key: "pending", title: "Pending" },
  { key: "scheduled", title: "Scheduled" },
  { key: "completed", title: "Completed" },
];

export default function TrackScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const { initialTab } = useLocalSearchParams();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialIndex = routes.findIndex((route) => route.key === initialTab);
    if (initialIndex !== -1) {
      setIndex(initialIndex);
    }
    setLoading(false)
  }, [initialTab]);


  if(loading) return null

  return (
    <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
   <TrackNavigation title="Track"/> 
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          activeColor={colors.primary}
          inactiveColor="#636363"
          indicatorStyle={{ backgroundColor: colors.primary }}
          style={{
            backgroundColor: "#fff",
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: "#6363631A"
          }}
          pressColor="transparent"
          tabStyle={{ paddingHorizontal:1 }} 
        />
      )}
      initialLayout={{ width: layout.width }}
    />
    </SafeAreaView>
  );
}
