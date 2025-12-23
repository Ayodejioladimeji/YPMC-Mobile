import React, { forwardRef, useCallback, useContext, useMemo, useState } from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
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

import { Button, ButtonText } from "../ui/button";
import images from "@/assets/images";
import { BadgeIcon } from "@/assets/images/svgs";
import { DataContext } from "@/store/GlobalState";
import { toast } from "sonner-native";
import { formatMoney } from "@/utils/utils";
import { handleDial } from "../ship/dialNumber";

type RiderInfoProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
  rider?: any,
  amount?:string,
  order?:any
};

const SNAP_POINTS = ["70%"];

const RiderInfo = forwardRef<BottomSheetModal, RiderInfoProps>(
  ({ index, position, rider, amount, order}, ref) => {
    const headerHeight = useHeaderHeight();
    const token = useAuthStore((state) => state.token);
    const { bottom: bottomSafeArea } = useSafeAreaInsets();

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
          <BottomSheetView style={styles.bottomSheetContent}>
            <View>
              <View>
                <View
                  style={{
                    display: "flex",

                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {rider?.profileImageUrl ? <Image
                    style={{ width: 85, height: 85, borderRadius: 100, borderWidth: 1, borderColor: colors.primary }}
                    source={{ uri: rider?.profileImageUrl }}
                  /> : <Image
                    style={{ width: 85, height: 85, borderRadius: 100, borderWidth: 1, borderColor: colors.primary }}
                    source={images.user}
                  />}

                  <View style={{ marginTop: spacing.xs }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "interSemiBold",
                        }}
                      >
                        {rider?.firstName} {rider?.lastName}
                      </Text>

                      <BadgeIcon />
                    </View>

                    <Text
                      style={{
                        fontSize: 12,
                        color: "#636363",
                        marginTop: spacing.xxs,
                        textAlign: 'center',
                        textTransform: 'capitalize'
                      }}
                    >
                      {rider?.companyName || "YPMC Logistics"}
                    </Text>
                  </View>
                </View>

               {order?.status !== 'DELIVERED' && order?.status !=='PENDING' && <View
                  style={{
                    flexDirection: "row",
                    gap: spacing.sm,
                    marginTop: spacing.xxl,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Button size="sm" style={{ paddingHorizontal: 25 }} onPress={() => handleDial(rider?.phoneNumber)}>
                    <ButtonText>Call</ButtonText>
                    <Ionicons
                      name="call-outline"
                      size={24}
                      style={{ color: "#fff" }}
                    />
                  </Button>

                  <Button variant="outline" size="sm" style={{ paddingHorizontal: 25, backgroundColor: colors.muted }}>
                    <ButtonText>Chat</ButtonText>
                    <Ionicons
                      name="chatbox-outline"
                      size={24}
                      style={{ color: "#000000" }}
                    />
                  </Button>
                </View>}

                <View
                  style={{
                    borderBottomWidth: 2,
                    borderBottomColor: "#6363631A",
                    marginTop: spacing.xl,
                  }}
                />

                <View style={styles.textStyle}>
                  <View>
                    <Text style={styles.text}>Rating</Text>
                  </View>
                  <View style={{ gap: 5 }}>
                    <View
                      style={{
                        borderWidth: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 3,
                        borderRadius: 20,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderColor: "#6363631A",
                      }}
                    >
                      <Ionicons
                        name="star"
                        size={12}
                        style={{ color: "#F97216" }}
                      />
                      <Text style={{ fontSize: 12 }}>{rider?.averageRating}</Text>
                    </View>
                    <Text style={{ fontSize: 12 }}>({Number(rider?.averageRating)} Ratings)</Text>
                  </View>
                </View>

                <View style={styles.textStyle}>
                  <View>
                    <Text style={styles.text}>Completed Deliveries</Text>
                  </View>

                  <View style={{ gap: 5 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name="bicycle"
                        size={18}
                        style={{ color: "#000000" }}
                      />
                      <Text style={{ fontSize: 16, fontFamily: "interMedium" }}>
                        {rider?.completedDeliveries || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.textStyle}>
                  <View>
                    <Text style={styles.text}>Vehicle Type</Text>
                  </View>

                  <View style={{ gap: 5 }}>
                    <Text style={{ fontFamily: "interMedium", fontSize: 14, textAlign: 'right' }}>
                      {rider?.vehicleType || "Van"}
                    </Text>

                    <Text
                      style={{
                        fontFamily: "interMedium",
                        fontSize: 12,
                        marginLeft: 40,
                      }}
                    >
                      {rider?.vehiclePlateNumber || "3HK5-4KKE"}
                    </Text>
                  </View>
                </View>

                <View style={styles.textStyle}>
                  <View>
                    <Text style={{ fontFamily: "interMedium", fontSize: 14 }}>
                      Fare Amount
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontFamily: "interMedium", fontSize: 14 }}>
                     ₦{formatMoney(Number(amount) || 0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.textStyle}>
                  <View>
                    <Text style={{ fontFamily: "interMedium", fontSize: 14 }}>
                      Total
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontFamily: "interMedium", fontSize: 14 }}>
                      ₦{formatMoney(Number(amount) || 0)}
                    </Text>
                  </View>
                </View>

              </View>
            </View>
          </BottomSheetView>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

export default RiderInfo;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  wrapper: {
    gap: 20,
    marginTop: spacing.xxl,
  },
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

  footerContainer: {
    marginHorizontal: 12,
    backgroundColor: "#fff",
  },

  bottomSheetContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bottomSheetContent: {
    padding: spacing.base,
  },
  textStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xxxs,
    paddingVertical: spacing.xs,
    margin: spacing.xxs,
  },
  text: {
    fontSize: 14,
    fontFamily: "interRegular",
  },
});
