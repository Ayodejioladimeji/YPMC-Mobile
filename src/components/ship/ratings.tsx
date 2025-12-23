import { forwardRef, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/text";
import { useShippingStore } from "@/store/shipping";
import { colors, spacing } from "@/theme";
import { DataContext } from "@/store/GlobalState";
import ReviewCard from "../review-card";
import { GetRequest } from "@/utils/requests";
import RatingStars from "../rating-stars";
import { s } from "react-native-size-matters";
import images from "@/assets/images";
import { ACTIONS } from "@/store/Actions";



type SummarySheetProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
  onSubmit: () => void;
  riderId: string
};

const SNAP_POINTS = ["100%"];

const RatingSheet = forwardRef<BottomSheetModal, SummarySheetProps>(
  ({ index, position, onSubmit, riderId }, ref) => {
    const router = useRouter();
    const type = useShippingStore((state) => state.type);
    const { top, bottom: bottomSafeArea } = useSafeAreaInsets();
    const { state, dispatch } = useContext(DataContext)
    const [reviews, setReviews] = useState<any>(null)
    const [loading, setLoading] = useState(true)


    // get rider review
    useEffect(() => {
      const getReview = async () => {
        const res = await GetRequest(`/reviews/rider/${riderId}`, state?.token)
        if (res?.status === 200 || res?.status === 201) {
          setReviews(res?.data?.data)
        }
        dispatch({type:ACTIONS.RATE_LOADING, payload:false})
      }

      if (state?.token && riderId) {
        getReview()
      }
    }, [state?.token, riderId, state?.callback])


    // 

    return (
      <BottomSheetModal
        animatedIndex={index}
        animatedPosition={position}
        enableDismissOnClose={true}
        enableDynamicSizing={false}
        enablePanDownToClose={true}
        key="SummarySheet"
        name="SummarySheet"
        keyboardBehavior="extend"
        ref={ref}
        snapPoints={SNAP_POINTS}
        style={styles.shadow}
        topInset={top}
      >
        <Text style={{ fontFamily: "interMedium", fontSize: s(15), textAlign: 'center', marginTop: 20 }}>
          Rider Reviews
        </Text>

        <View style={{ flex: 1, marginTop:40 }}>
          {state?.rateLoading ? <ActivityIndicator /> :
            <FlatList
              data={reviews}
              keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <ReviewCard
                  rating={item?.rating}
                  review={item?.reviewText}
                  userName={`${item?.customer?.firstName} ${item?.customer?.lastName}`}
                />
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ marginTop: 150, alignItems: 'center', justifyContent: 'center', rowGap: 10 }}>
                  <RatingStars rating={0} />
                  <Text style={{ color: colors.mutedForeground, fontSize: s(14) }}>Rider has no Review</Text>
                </View>
              }
            />
          }

        </View>
      </BottomSheetModal>
    );
  },
);

export default RatingSheet;

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
    marginTop: spacing.xxl,
  },
  scrollView: {
    flex: 1,
    // backgroundColor: "#",
  },
  scrollViewContentContainer: {
    // backgroundColor: "#F3F3F3",
    rowGap: 10,
  },
  selectedLocationStyle: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  label: {
    fontFamily: "interBold",
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
    height: 40,
    margin: 12,
    borderWidth: 1,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginBottom: 20
  },
});
