import React, { useContext, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { useRouter } from "expo-router";
import { retrieveToken, storeData } from "@/utils/helper";
import { ACTIONS } from "@/store/Actions";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

type PaymentMethod = {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    extra?: string;
};

const PaymentScreen = ({closeSheet, customerId, shippingId, user,state }: any) => {
    const [selectedMethod, setSelectedMethod] = useState<string>("WALLET");
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    

    const ref = useRef<BottomSheetModal>(null);

    const handleSelection = (id: string) => {
        setSelectedMethod(id);
    };

    // handle payment
    const handlePay = async () => {
        setLoading(true)

        const token = await retrieveToken("token")

        const payload = {
            shippingId,
            customerId,
            paymentMethod: selectedMethod
        }

        const multiPayload = {
            multiShippingId: shippingId,
            customerId,
            paymentMethod: selectedMethod
        }


        let res:any;

        if(state?.shippingType === "basic"){
            res = await PostRequest(`/transactions/initiate`, payload, state?.token)
        }
        else{
            res = await PostRequest(`/transactions/initiate-multi-shipping`, multiPayload, state?.token)
        }


        if (res?.status === 200 || res?.status === 201) {
            if(selectedMethod === "WALLET"){ 
                router.replace("/(app)/(tabs)/ship/success")
            }
            else{

                if(state?.shippingType === "basic"){
                    router.replace({
                        pathname: "/(app)/(tabs)/ship/paystack",
                        params: { paystack_url: res?.data?.data?.metadata?.authorization_url },
                    });
                }
                else{
                    router.replace({
                        pathname: "/(app)/(tabs)/ship/paystack",
                        params: { paystack_url: res?.data?.data?.paystackMetadata?.authorization_url },
                    });
                }
                
            }
            closeSheet();
        }
        else{
            // console.log(res)
        }
        setLoading(false)

    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Payment</Text>
                <Text style={styles.subtitle}>How would you like to pay?</Text>
            </View>

            <View style={styles.divider} />

                <Pressable
                    style={styles.paymentMethod}
                    onPress={() => handleSelection("WALLET")}
                >
                <Ionicons name="wallet-outline" size={24} style={styles.icon} />
                    <View style={styles.methodInfo}>
                        <Text style={styles.methodLabel}>Wallet</Text>
                        <Text style={styles.methodExtra}>NGN {user?.walletBalance}</Text>
                    </View>

                    {selectedMethod === 'WALLET' ? (
                        <Ionicons name="checkmark-circle" size={25} style={[styles.checkmark, { marginRight: -2 }]} />
                    ) :
                        <View style={styles.radio}>
                        </View>
                    }
                </Pressable>

                <Pressable
                    style={styles.paymentMethod}
                    onPress={() => handleSelection("PAYSTACK")}
                >
                <Ionicons name="card-outline" size={24} style={styles.icon} />
                    <View style={styles.methodInfo}>
                        <Text style={styles.methodLabel}>Paystack</Text>
                    </View>

                    {selectedMethod === "PAYSTACK" ? (
                        <Ionicons name="checkmark-circle" size={25} style={[styles.checkmark, { marginRight: -2 }]} />
                    ) :
                        <View style={styles.radio}>
                        </View>
                    }
                </Pressable>

            <Pressable style={styles.button} onPress={handlePay}>
                <Text style={styles.buttonText}>Make Payment</Text>
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="arrow-forward" size={20} style={styles.buttonIcon} />}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000000",
    },
    subtitle: {
        fontSize: 14,
        color: "#636363",
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F1F1",
        marginVertical: 12,
    },
    paymentMethod: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        // paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F1F1",
    },
    icon: {
        color: "#636363",
        marginRight: 12,
    },
    methodInfo: {
        flex: 1,
    },
    methodLabel: {
        fontSize: 16,
        color: "#000000",
    },
    methodExtra: {
        fontSize: 14,
        color: "#636363",
        marginTop: 2,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#B2B2B2",
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    checkmark: {
        color: "#FF6600",
        marginLeft: 25
    },
    button: {
        marginTop: 24,
        backgroundColor: "#FF6600",
        borderRadius: 20,
        paddingVertical: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "600",
    },
    buttonIcon: {
        color: "#FFFFFF",
        marginLeft: 8,
    },
});

export default PaymentScreen;
