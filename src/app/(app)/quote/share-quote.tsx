import TopNavigation from '@/components/TopNavigation';
import React, { useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { s } from 'react-native-size-matters';
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { colors } from '@/theme';
import { DataContext } from '@/store/GlobalState';
import moment from 'moment';
import { convertMinutes, formatMoney } from '@/utils/utils';
import { Image } from 'expo-image';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';


const ReceiptScreen = () => {
  const viewRef = useRef(null);
  const { state } = useContext(DataContext)
  const { quoteData, user } = state
  const [contentHeight, setContentHeight] = useState(0);

  const onShareImage = async () => {
    try {
      const uri = await viewRef.current.capture({
        height: contentHeight,
        format: "png",
        quality: 1,
        result: "data-uri",
      });

      await Share.open({ url: uri, message: `YPMC Quote summary` });

    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to capture or share image.");
    }
  };


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
                    <p style="font-size: 13px; margin-top: 5px;">Package Name: ${quoteData?.packageDetails?.name}</p>
                    <p style="font-size: 13px; margin-top: 5px;">Pickup: ${`${quoteData?.pickupStreet}, ${quoteData?.pickupArea}, ${quoteData?.pickupState}`}</p>
                    <p style="font-size: 13px; margin-top: 5px;">Delivery: ${`${quoteData?.dropoffStreet}, ${quoteData?.dropoffArea}, ${quoteData?.dropoffState}`}</p>
                    <p style="font-weight: 600; font-size: 13px; margin-top: 5px;">Estimated Price: N${formatMoney(Number(quoteData?.estimatedPrice))}</p>
          </div>
  
              </div>
              
              <div class="section-content">
                <p class="section-title">Delivery Total : N${formatMoney(Number(quoteData?.estimatedPrice))}</p>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <TopNavigation title="Share Quote" />

      <ViewShot
        ref={viewRef}
        options={{ format: "png", quality: 1.0, result: "data-uri" }}
        style={{ flex: 1, backgroundColor: 'white' }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 16 }}
        >

          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 20,
              backgroundColor: "#fff",
              alignItems: "center",
            }}
          >
            <Image source={require("@/assets/images/new-logo.png")} alt="" style={{ height: 50, width: 100 }} />

          </View>

          <View>
            <Text style={{ fontFamily: "interBold", fontSize: s(14), marginBottom: 15 }}>
              YPMC Shipment Invoice
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 10 }}>
              <Text style={[styles.text, { fontFamily: "interBold" }]}>Customer Name :</Text>
              <Text style={styles.text}>{user?.fullName}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5 }}>
              <Text style={[styles.text, { fontFamily: "interBold" }]}>Date :</Text>
              <Text style={styles.text}>{moment().format("ll")}</Text>
            </View>
          </View>

          <View style={{ height: 2, backgroundColor: '#F3F3F3', marginVertical: 20 }}>
          </View>

          <View>
            <Text style={{ fontFamily: "interSemiBold", fontSize: s(14), marginBottom: 15 }}>
              SHIPMENT DETAILS
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 10 }}>
              <Text style={[styles.text, { fontFamily: "interBold" }]}>Shipment type :</Text>
              <Text style={styles.text}>Single shipment</Text>
            </View>
          </View>

          <View style={{ marginTop: 10 }}>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 10 }}>
              <Text style={[styles.text, { fontFamily: "interBold" }]}>Package Name :</Text>
              <Text style={styles.text}>{quoteData?.packageDetails?.name}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 10 }}>
              <Text style={[styles.text, { fontFamily: "interBold" }]}>Pickup :</Text>
              <Text style={[styles.text, { lineHeight: 22, flex: 1 }]}>{`${quoteData?.pickupStreet}, ${quoteData?.pickupArea}, ${quoteData?.pickupState}`}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 10 }}>
              <Text style={[styles.text, { fontFamily: "interBold", lineHeight: 22 }]}>Delivery :</Text>
              <Text style={[styles.text, { lineHeight: 22, flex: 1 }]}>{`${quoteData?.dropoffStreet}, ${quoteData?.dropoffArea}, ${quoteData?.dropoffState}`}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 10 }}>
              <Text style={[styles.text, { fontFamily: "interBold", lineHeight: 20 }]}>Estimated Price :</Text>
              <Text style={[styles.text, { lineHeight: 20, flex: 1 }]}> N{formatMoney(Number(quoteData?.estimatedPrice))}</Text>
            </View>




            <View style={{ height: 2, backgroundColor: '#F3F3F3', marginVertical: 20 }}>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 10 }}>
              <Text style={[styles.text, { fontFamily: "interBold", fontSize: s(16) }]}>Delivery Total:</Text>
              <Text style={[styles.text, { fontFamily: "interBold", flex: 1, fontSize: s(16) }]}>N{formatMoney(Number(quoteData?.estimatedPrice))}</Text>
            </View>

            <Text style={[styles.text, { lineHeight: 20, flex: 1 }]}>Thanks for your patronage, YPMC cares</Text>
          </View>

        </ScrollView>
      </ViewShot>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={{ paddingVertical: 12, paddingHorizontal: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }}
          onPress={onShareImage}
        >
          <Text style={{ color: colors.primary }}>Share Image</Text>
          <MaterialIcons name="download" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingVertical: 12, paddingHorizontal: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }}
          onPress={onSharePDF}
        >
          <Text style={{ color: colors.primary }}>Share PDF</Text>
          <AntDesign name="pdffile1" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    color: '#0B9444',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
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
    paddingVertical: 30,
    backgroundColor: "white",
    position: 'absolute',
    bottom: 0,
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border

  },
  textStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    fontSize: 14,
    fontFamily: "interRegular",
  },

});

export default ReceiptScreen;