import React, { forwardRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AntDesign, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { colors, spacing } from "@/theme";
import TimelineComponent from "./timeline-components";
import { s } from "react-native-size-matters";
import { DataContext } from "@/store/GlobalState";
import { GetRequest } from "@/utils/requests";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";


type RiderInfoProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
  id:string
};

const SNAP_POINTS = ["40%", "70%"];

const Timeline = forwardRef<BottomSheetModal, RiderInfoProps>(
  ({ index, position, id }, ref) => {
    const headerHeight = useHeaderHeight();
    const token = useAuthStore((state) => state.token);
    const { bottom: bottomSafeArea } = useSafeAreaInsets();
    const [timelines, setTimelines] = useState<any>([])
    const { state } = useContext(DataContext)

    const scrollViewContentContainer = useMemo(
      () => [
        styles.scrollViewContentContainer,
        { paddingBottom: bottomSafeArea + 64 },
      ],
      [bottomSafeArea],
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          enableTouchThrough={true}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );


    // fetch timeline
    useEffect(() => {
      if (state?.token && id) {
        const getTimeline = async () => {
          const res = await GetRequest(`/shipping/track/${id}`, state?.token)
          if (res?.status === 200 || res?.status === 201) {
            setTimelines(res?.data?.data?.timeline?.events)
          }
        }
        getTimeline()
      }
    }, [state?.token, id])



    // 

    return (
      <BottomSheetModal
        animatedIndex={index}
        animatedPosition={position}
        enableDismissOnClose={true}
        enableDynamicSizing={false}
        enablePanDownToClose={true}
        key="TimelineSheet"
        name="TimelineSheet"
        keyboardBehavior="extend"
        ref={ref}
        snapPoints={SNAP_POINTS}
        style={styles.shadow}
        topInset={headerHeight}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView
          contentContainerStyle={scrollViewContentContainer}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="never"
          style={styles.scrollView}
        >
          <BottomSheetView >
            <View style={styles.container}>
              <Text style={styles.etaText}>Estimated Time of Arrival</Text>
              <Text style={styles.eta}>60 mins</Text>

              <View style={{ height: 2, backgroundColor: colors.muted, marginVertical: 30 }} />
              {timelines?.map((item:any, index:number) => {
               const isLast = index === timelines.length - 1
              return (
                <View style={styles.timelineItem} key={index}>
                  <View style={styles.timeline}>
                    <View style={[styles.circle, item.completed && styles.circleCompleted]}>
                      <FontAwesome name="check" size={12} color="#fff" />
                    </View>
                    {!isLast && <View style={styles.verticalLine} />}
                  </View>

                  <View style={styles.content}>
                    <View>
                      <Text style={styles.status}>{item.type}</Text>
                      <Text style={styles.description}>{item.description}</Text>
                      <Text></Text>
                    </View>

                    <View>
                      <Text style={styles.time}>{moment(item?.timestamp).format("LT")}</Text>
                      <Text style={styles.date}>{moment(item?.timestamp).format("ll")}</Text>
                    </View>
                  </View>
                </View>
                // <TimelineItem key={item.id} item={item} isLast={index === timelineData.length - 1} />
              )})}
            </View>
          </BottomSheetView>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

export default Timeline;

const styles = StyleSheet.create({

  scrollView: {
    flex: 1,
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
  scrollViewContentContainer: {
    paddingHorizontal: 16,
  },

  bottomSheetContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  etaText: {
    fontSize: s(12),
    color: '#333',
    marginBottom: s(4),
  },
  eta: {
    fontSize: s(18),
    fontWeight: 'bold',
    color: '#333'
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeline: {
    alignItems: 'center',
    marginRight: s(12),
  },
  circle: {
    height: s(18),
    width: s(18),
    borderRadius: s(9),
    backgroundColor: '#FF7F27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCompleted: {
    backgroundColor: '#FF7F27',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#FF7F27',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  status: {
    fontSize: s(12),
    color: colors.primary,
    marginBottom: s(4),
  },
  description: {
    fontSize: s(11),
    color: '#333',
    marginBottom: s(8),
    width: 250,
    lineHeight:20
  },
  time: {
    fontSize: s(11),
    color: '#007AFF',
    alignSelf: 'flex-end',
    marginBottom: 5
  },
  date: {
    fontSize: s(10),
    color: '#8E8E93',
    alignSelf: 'flex-end'
  }

});
