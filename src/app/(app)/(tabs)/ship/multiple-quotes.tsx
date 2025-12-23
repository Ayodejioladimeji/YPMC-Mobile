import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { colors } from "@/theme";
import { useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import { BottomSheetModal, SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { useSharedValue } from "react-native-reanimated";
import { GetRequest } from "@/utils/requests";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { s } from "react-native-size-matters";
import AddressList from "@/components/quote/addresslist";
import AllQuotesSummarySheet from "@/components/quote/all-quotes-summary";
import { useLocalSearchParams } from "expo-router";
import TopNavigation from "@/components/TopNavigation";
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { formatMoney } from "@/utils/utils";
import moment from "moment";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';


export default function MultipleQuotes() {
    const { state, dispatch } = useContext(DataContext)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const [quotes, setQuotes] = useState<any>([])
    const [callback, setCallback] = useState(false)
    const { id } = useLocalSearchParams();
    const [multiples, setMultiples] = useState<any>([])

    const summarySheetRef = useRef<BottomSheetModal>(null);
    const summarySheetIndex = useSharedValue<number>(0);
    const summarySheetPosition = useSharedValue<number>(SCREEN_HEIGHT);

    useEffect(() => {
        const getQuotes = async () => {
            const res = await GetRequest(`/shipping/multi-quotes/${id}`, state?.token)

            if (res?.status === 200 || res?.status === 201) {
                setQuotes(res?.data?.data)
                setLoading(false)

                const mapped = res?.data?.data?.multiShipping?.shippings?.map((item: any) => ({
                    dropoffArea: item?.dropoffArea,
                    dropoffLatitude: parseFloat(item?.dropoffLatitude),
                    dropoffLongitude: parseFloat(item?.dropoffLongitude),
                    dropoffState: item?.dropoffState,
                    dropoffStreet: item?.dropoffStreet,
                    isFragile: item?.packageDetails?.isFragile,
                    isSecurityShipping: item?.isSecurityShipping,
                    packageName: item?.packageDetails?.name,
                    packageNotes: item?.packageDetails?.notes,
                    packageSize: item?.packageDetails?.size,
                    pickupArea: item?.pickupArea,
                    pickupDate: item?.pickupDate,
                    pickupLatitude: parseFloat(item?.pickupLatitude),
                    pickupLongitude: parseFloat(item?.pickupLongitude),
                    pickupState: item?.pickupState,
                    pickupStreet: item?.pickupStreet,
                    pickupTime: new Date().toISOString(), // Or keep item.pickupTime if needed
                    receiverName: item?.receiverInfo?.name,
                    receiverPhoneNumber: item?.receiverInfo?.contactInfo?.phoneNumber,
                    scheduledType: "now",
                    senderName: item?.senderInfo?.name,
                    senderPhoneNumber: item?.senderInfo?.contactInfo?.phoneNumber,
                    amount: item?.estimatedPriceInNaira
                }));

                setMultiples(mapped);
                dispatch({ type: ACTIONS.ORDER_DATA, payload: mapped[0] })
            }

        }

        if (state?.token) {
            getQuotes()
        }
    }, [state?.token, callback])


    // view details
    const viewDetails = (item: any) => {

        const payload = {
            dropoffArea: item?.dropoffArea,
            dropoffLatitude: parseFloat(item?.dropoffLatitude),
            dropoffLongitude: parseFloat(item?.dropoffLongitude),
            dropoffState: item?.dropoffState,
            dropoffStreet: item?.dropoffStreet,
            isFragile: item?.packageDetails?.isFragile,
            isSecurityShipping: item?.isSecurityShipping,
            packageName: item?.packageDetails?.name,
            packageNotes: item?.packageDetails?.notes,
            packageSize: item?.packageDetails?.size,
            pickupArea: item?.pickupArea,
            pickupDate: item?.pickupDate,
            pickupLatitude: parseFloat(item?.pickupLatitude),
            pickupLongitude: parseFloat(item?.pickupLongitude),
            pickupState: item?.pickupState,
            pickupStreet: item?.pickupStreet,
            pickupTime: new Date().toISOString(),
            receiverName: item?.receiverInfo?.name,
            receiverPhoneNumber: item?.receiverInfo?.contactInfo?.phoneNumber,
            scheduledType: "now",
            senderName: item?.senderInfo?.name,
            senderPhoneNumber: item?.senderInfo?.contactInfo?.phoneNumber,
            type: "multi",
            amount: item?.estimatedPriceInNaira
        }


        dispatch({ type: ACTIONS.ORDER_DATA, payload: payload })
        summarySheetRef.current?.present();
    }

    const onSharePDF = async () => {
        try {
            const displayData = quotes?.multiShipping?.shippings;

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

            const shipmentsHtml = (displayData || []).map((shipment, index) => `
           <div style="margin-top: 20px;">
                      <p style="font-weight: 600;">${index + 1}.</p>
                      <p style="font-size: 13px; margin-top: 5px;">Package Name: ${shipment?.packageDetails?.name}</p>
                      <p style="font-size: 13px; margin-top: 5px;">Pickup: ${`${shipment?.pickupStreet}, ${shipment?.pickupArea}, ${shipment?.pickupState}`}</p>
                      <p style="font-size: 13px; margin-top: 5px;">Delivery: ${`${shipment?.dropoffStreet}, ${shipment?.dropoffArea}, ${shipment?.dropoffState}`}</p>
                      <p style="font-weight: 600; font-size: 13px; margin-top: 5px;">Estimated Price: N${formatMoney(Number(shipment.estimatedPriceInNaira))}</p>
            </div>
            ${index < (displayData.quotes || []).length - 1 ? '<div class="section-divider"></div>' : ''}
          `).join('');

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
                  border-bottom: 1px solid #F3F3F3;
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
                    <p class="section-title">Customer Name: <span style="font-weight: normal;">${state?.user?.fullName}</span></p>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">DATE: ${moment().format('MMMM Do YYYY')}</p>
                </div>
    
                <div class="section-divider"></div>
    
                <div class="section-content" style="border-bottom: none;">
                    <p class="section-title">SHIPMENT DETAILS</p>
                    <p style="font-weight: 500;">Shipment Type: Multiple Shipment</p>
                    
                    ${shipmentsHtml}
    
                </div>
                
                <div class="section-content">
                  <p class="section-title">Delivery Total : N${formatMoney(Number(quotes?.multiShipping?.totalEstimatedPriceInNaira))}</p>
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
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TopNavigation title="Multiple Quotes" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {loading ?
                    <ActivityIndicator style={{ marginTop: 50 }} /> :

                    <View
                        style={{
                            backgroundColor: "#fff",
                            paddingHorizontal: 20,
                            paddingTop: 20,
                            gap: 20,
                            paddingBottom: 150,

                        }}
                    >
                        {quotes?.multiShipping?.shippings?.map((item: any, index: number) => {
                            return (
                                <View style={styles.container} key={index}>
                                    <View style={styles.spaceBetween}>
                                        <View
                                            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                                        >
                                            <View style={styles.iconContainer}>
                                                <Ionicons name="cube-outline" size={24} style={styles.icon} />
                                            </View>

                                            <Text style={{ flex: 1, fontSize: s(13), fontFamily: "interBold" }}>
                                                {item?.packageDetails?.name}
                                            </Text>
                                        </View>
                                    </View>

                                    <AddressList data={item} />

                                    <View style={[{ gap: 15, marginTop: 16 }, styles.spaceBetween]}>
                                        <Button size="sm" style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary, gap: 5, flex: 1, borderRadius: 25, height: 45, paddingHorizontal: 5 }} onPress={() => viewDetails(item)}>
                                            <ButtonText style={{ color: colors.primary, fontFamily: 'interSemiBold' }}>Details (N{(item?.estimatedPriceInNaira.toLocaleString())})</ButtonText>
                                        </Button>
                                    </View>
                                </View>
                            );
                        })}

                        <AllQuotesSummarySheet
                            ref={summarySheetRef}
                            index={summarySheetIndex}
                            position={summarySheetPosition}
                            onSubmit={() => summarySheetRef.current?.close()}
                        />


                        {!loading && <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 40
                            }}
                        >
                            <Text style={{ fontSize: s(14), fontFamily: 'interBold' }}>Total Amount</Text>
                            <Text style={{ fontSize: s(14), fontFamily: "interBold" }}>
                                ₦
                                {(quotes?.multiShipping?.totalEstimatedPriceInNaira.toLocaleString() || 0)}
                            </Text>
                        </View>}

                    </View>
                }

                {!loading && quotes?.length === 0 && <View style={{}}>
                    <Image
                        source={require("@/assets/images/logistics-bus.png")}
                        style={{
                            width: 160,
                            height: 160,
                            alignSelf: "center",
                        }}
                    />

                    <Text style={{ textAlign: "center", fontSize: s(14), color: "#636363" }}>
                        No saved Delivery Quotes
                    </Text>
                </View>}

                <View style={{ paddingHorizontal: 20, gap: 15, marginBottom: 30 }}>
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

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F3F3F380",
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#6363631A",
        flex: 1,
        overflow: 'hidden'
    },
    spaceBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconContainer: {
        backgroundColor: "#F972161A",
        width: 44,
        height: 44,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        color: colors.primary,
    },
    eventContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
    },
    eventMarker: {
        alignItems: "center",
        marginRight: 16,
    },
    eventDetails: {
        flex: 1,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#4CAF50",
    },
    line: {
        width: 2,
        height: 48,
        backgroundColor: "#4CAF50",
    },
    address: {
        fontSize: 16,
        fontFamily: "interSemiBold",
        color: "#000",
        marginBottom: 4,
    },
    time: {
        fontSize: 14,
        color: "#636363",
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
