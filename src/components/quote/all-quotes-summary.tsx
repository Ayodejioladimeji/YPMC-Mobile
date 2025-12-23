import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";
import moment from "moment";
import { DataContext } from "@/store/GlobalState";
import { calculateDistanceAndTime } from "@/utils/distance-and-time";
import { Button, ButtonText } from "../ui/button";
import { PostRequest } from "@/utils/requests";
import { ACTIONS } from "@/store/Actions";
import * as FileSystem from 'expo-file-system';
import { formatMoney } from "@/utils/utils";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';

type SummarySheetProps = {
  index: SharedValue<number>;
  position: SharedValue<number>;
  onSubmit: () => void;
};

const SNAP_POINTS = ["100%"];

const AllQuotesSummarySheet = forwardRef<BottomSheetModal, SummarySheetProps>(
  ({ index, position, onSubmit }, ref) => {
    const router = useRouter();
    const { top, bottom: bottomSafeArea } = useSafeAreaInsets();
    const { state, dispatch } = useContext(DataContext)
    const { orderData, quoteData, user } = state
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [distanceLoading, setDistanceLoading] = useState(true)
    const [loading, setLoading] = useState(false)

    const scrollViewContentContainer = useMemo(
      () => [
        styles.scrollViewContentContainer,
        { paddingBottom: bottomSafeArea + 86 },
      ],
      [bottomSafeArea],
    );

    const handleHide = () => {
      if (ref && "current" in ref && ref.current) ref.current.dismiss();
    }


    useEffect(() => {
      const fetchDistanceAndTime = async () => {
        if (orderData?.pickupLatitude && orderData?.dropoffLatitude) {
          const pickupCoord = { latitude: orderData.pickupLatitude, longitude: orderData.pickupLongitude };
          const dropoffCoord = { latitude: orderData.dropoffLatitude, longitude: orderData.dropoffLongitude };

          const result = await calculateDistanceAndTime(pickupCoord, dropoffCoord);
          if (result) {
            setDistance(result.distance);
            setDuration(result.duration);
          }
          setDistanceLoading(false)
        }
      };

      fetchDistanceAndTime();
    }, [orderData]);

    // find rider
    const findRider = async () => {
      setLoading(true)

      dispatch({ type: ACTIONS.SHIPPING_TYPE, payload: "basic" })

      const res = await PostRequest("/shipping", orderData, state?.token)
      if (res?.status === 200 || res?.status === 201) {
        dispatch({ type: ACTIONS.SHIPPING_ID, payload: res?.data?.data?.id })
        dispatch({ type: ACTIONS.SHIPPING, payload: res?.data?.data })

        let shippingId = res?.data?.data?.id

        const response = await PostRequest(`/shipping/${shippingId}/assign-support-rider`, {}, state?.token)

        if (response?.status === 200 || response.status === 201) {
          dispatch({ type: ACTIONS.PROPOSED_RIDER, payload: response?.data?.data?.proposedRider })
          dispatch({ type: ACTIONS.SHIPPING, payload: response?.data?.data })

        }

        setTimeout(() => {
          router.push("/(app)/(tabs)/ship/rider-request")
          //  router.push("/(app)/(tabs)/ship/find-rider");
          if (ref && "current" in ref && ref.current) ref.current.dismiss();
        }, 1000)
      }

      setLoading(false)
    }


    const onSharePDF = async () => {
      try {
        ;

        let logoBase64 = '';
        try {
          const logoAsset = Asset.fromModule(require("@/assets/images/new-logo.png"));
          await logoAsset.downloadAsync();
          logoBase64 = await FileSystem.readAsStringAsync(logoAsset.localUri || '', {
            encoding: FileSystem.EncodingType.Base64,
          });
          logoBase64 = `data:${logoAsset.type};base64,${logoBase64}`;
        } catch (assetError) {
          console.error("Failed to load logo as base64:", assetError);
          // Fallback to empty string if logo fails
          logoBase64 = '';
        }


        const htmlContent = `
                      <!DOCTYPE html>
               <html>
               <head>
                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                 <style>
                   body {
                     font-family: Arial, sans-serif;
                     margin: 0;
                     padding: 0;
                     background-color: #fff;
                     font-size: 14px;
                     color: #333;
                   }
                   .invoice-container {
                      padding: 20px;
                      max-width: 700px;
                      margin: 0 auto;
                      border: 1px solid #f7f7f7
                   }
                   .header-top {
                       background-color: #f7f7f7;
                       height: 40px;
                       width: 100%;
                       margin-bottom: 20px;
                       display: block;
                   }
                   .logo-section {
                     text-align: center;
                     padding: 20px 0;
                     border-bottom: 1px solid #F3F3F3;
                     margin-bottom: 20px;
                   }
                   .logo-img {
                     height: 50px;
                     width: 100px;
                     object-fit: contain;
                     margin-bottom: 10px;
                   }
                   .header-title {
                     font-size: 16px;
                     font-weight: 500;
                     margin-top: 5px;
                   }
                   .header-text-small {
                     font-size: 11px;
                     color: #666;
                     margin-top: 10px;
                   }
                   .section-divider {
                     height: 3px;
                     background-color: #F3F3F3;
                     margin-bottom: 0;
                   }
                   .section-content {
                     padding: 16px;
                     background-color: #fff;
                     display: flex;
                     flex-direction: column;
                   }
       
                   .section-title {
                     font-weight: 600;
                     font-size: 16px;
                     margin-bottom: 5px;
                   }
       
                 </style>
               </head>
               <body>
                 <div class="invoice-container">
                   <div class="logo-section">
                     ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="YPMC Logo" />` : ''}
                     <p class="header-title">YPMC SHIPMENT INVOICE</p>
                   </div>
       
                   <div class="section-content">
                       <p class="section-title">Customer Name: <span style="font-weight: normal;">${user?.fullName}</span></p>
                       <p style="font-size: 12px; color: #666; margin-top: 20px;">DATE: ${moment().format('MMMM Do YYYY')}</p>
                   </div>
       
                   <div class="section-divider"></div>
       
                   <div class="section-content">
                       <p class="section-title">SHIPMENT DETAILS</p>
                       <p style="font-weight: 500;">Shipment Type: Single Shipment</p>
                       
                      <div style="margin-top: 20px;">
                         <p style="font-weight: 600;">1.</p>
                         <p style="font-size: 13px; margin-top: 5px;">Package Name: ${quoteData?.packageName}</p>
                         <p style="font-size: 13px; margin-top: 5px;">Pickup: ${`${quoteData?.pickupStreet}, ${quoteData?.pickupArea}, ${quoteData?.pickupState}`}</p>
                         <p style="font-size: 13px; margin-top: 5px;">Delivery: ${`${quoteData?.dropoffStreet}, ${quoteData?.dropoffArea}, ${quoteData?.dropoffState}`}</p>
                         <p style="font-weight: 600; font-size: 13px; margin-top: 5px;">Estimated Price: N${formatMoney(Number(quoteData?.amount))}</p>
               </div>
       
                   </div>
                   
                   <div class="section-content">
                     <p class="section-title">Delivery Total : N${formatMoney(Number(quoteData?.amount))}</p>
                     <p style="font-weight: 600; font-size: 13px;">Thanks for your patronage, YPMC cares</p>
                   </div>
                 </div>
               </body>
               </html>
             `;


        const { uri: pdfUri } = await Print.printToFileAsync({ html: htmlContent });

        if (pdfUri) {
          await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
        } else {
          Alert.alert("Error", "Failed to generate PDF.");
        }
      } catch (error) {
        console.error("Error sharing PDF:", error);
        Alert.alert("Error", "Failed to generate or share PDF.");
      }
    };

    // 

    return (
      <BottomSheetModal
        animatedIndex={index}
        animatedPosition={position}
        enableDynamicSizing={false}
        key="SummarySheet"
        name="SummarySheet"
        keyboardBehavior="extend"
        ref={ref}
        snapPoints={SNAP_POINTS}
        style={styles.shadow}
        topInset={top}
      >
        <BottomSheetScrollView
          contentContainerStyle={scrollViewContentContainer}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="never"
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 20,
              backgroundColor: "#fff",
              alignItems: "center",
              // paddingBottom: 16,
            }}
          >
            <Text style={{ fontFamily: "interMedium", fontSize: 16 }}>
              Shipment Summary
            </Text>

            <Text style={{ fontSize: 12, marginTop: spacing.xs }}>
              Review your details before proceeding.
            </Text>

            <TouchableOpacity
              onPress={handleHide}
              style={{
                position: 'absolute',
                top: 10,
                right: 20
              }}>
              <FontAwesome5 name="times" size={20} color="black" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 6, backgroundColor: '#F3F3F3' }}>
          </View>

          <View>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 20,
                backgroundColor: "#fff",
                rowGap: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontFamily: "interSemiBold" }}>
                  Pickup & Delivery
                </Text>

              </View>

              <View
                style={{
                  flexDirection: "row",
                  // alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Pickup address</Text>
                <Text
                  style={{ maxWidth: "50%" }}
                >{`${orderData?.pickupStreet}, ${orderData?.pickupArea}, ${orderData?.pickupState}`}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Pickup Date and Time</Text>
                <Text style={{ fontFamily: "interSemiBold", fontSize: 13 }}>
                  {moment(orderData?.pickupDate).format("ll")} {" "}
                  {moment(orderData?.pickupTime).format("LT")}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Delivery Address</Text>
                <Text style={{ maxWidth: "50%", lineHeight: 25 }}>
                  {`${orderData?.dropoffStreet}, ${orderData?.dropoffArea}, ${orderData?.dropoffState}`}
                </Text>
              </View>

            </View>

            <View style={{ height: 6, backgroundColor: '#F3F3F3' }}>
            </View>

            <View style={{ height: 6, backgroundColor: '#F3F3F3' }}>
            </View>

            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 20,
                backgroundColor: "#fff",
                rowGap: 10,
              }}
            >
              <Text style={{ fontFamily: "interSemiBold" }}>
                Delivery Details
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Package Name</Text>
                {distanceLoading ? <ActivityIndicator /> :
                  <Text style={{ fontFamily: "interSemiBold" }}>
                    {orderData?.packageName}
                  </Text>}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Travel Time</Text>
                {distanceLoading ? <ActivityIndicator /> :
                  <Text style={{ fontFamily: "interSemiBold" }}>
                    Estimated:{" "}
                    {duration}
                  </Text>}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Distance</Text>
                {distanceLoading ? <ActivityIndicator /> :
                  <Text style={{ fontFamily: "interSemiBold" }}>{distance}</Text>}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{}}>Amount</Text>
                {distanceLoading ? <ActivityIndicator /> :
                  <Text style={{ fontFamily: "interSemiBold" }}>N{orderData?.amount.toLocaleString() || 0}</Text>}
              </View>
            </View>

            <View style={{ paddingHorizontal: 20, gap: 15, marginBottom: 30, marginTop: 100 }}>
              <TouchableOpacity
                style={{ paddingVertical: 16, paddingHorizontal: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }}
                onPress={onSharePDF}
              >
                <Text style={{ color: colors.primary }}>Share PDF</Text>
                <AntDesign name="pdffile1" size={20} color={colors.primary} />
              </TouchableOpacity>

              {/* <TouchableOpacity
                        style={{ backgroundColor: colors.primary, paddingVertical: 18, paddingHorizontal: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, }}
                        onPress={onSharePDF}
                    >
                        <Text style={{ color: 'white' }}>Continue Shipment</Text>
                    </TouchableOpacity> */}
            </View>
          </View>

        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

export default AllQuotesSummarySheet;

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
    marginTop: spacing.xxl,
  },
  scrollView: {
    flex: 1,
    // backgroundColor: "#",
    position: 'relative'
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
    paddingVertical: 20,
    backgroundColor: "#fff",
    position: 'absolute',
    bottom: 0,
    flex: 1,
    width: '100%'
  },
});
