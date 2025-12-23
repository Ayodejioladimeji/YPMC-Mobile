import images from "@/assets/images";
import { ACTIONS } from "@/store/Actions";
import { DataContext } from "@/store/GlobalState";
import { formatMoney } from "@/utils/utils";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

const PaymentSuccessScreen = () => {
    const router = useRouter()
    const {state, dispatch} = useContext(DataContext)
    const searchParams = useLocalSearchParams();
    const amount = searchParams.amount as string;

    const handleRoute = () => {
        dispatch({type:ACTIONS.CALLBACK, payload:!state?.callback})
        dispatch({ type: ACTIONS.PROFILE_LOADING, payload: true })
        router.replace("/")
    }

    // 

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconBackground}>
                    <Image
                        source={images?.success}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>Payment Successful!</Text>

                <Text style={styles.subtitle}>
                  Your ₦{formatMoney(Number(amount))} Outstanding amount has been paid successfull ✨.
                </Text>

                <TouchableOpacity style={styles.button} onPress={handleRoute}>
                    <Text style={styles.buttonText}>Go to dashboard</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        alignItems: "center",
        paddingHorizontal: 20,
    },
    iconBackground: {
        backgroundColor: "#FFF6EB",
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    icon: {
        width: 120,
        height: 120,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#646464",
        textAlign: "center",
        marginBottom: 40,
    },
    button: {
        backgroundColor: "#FF6B00",
        borderRadius: 25,
        width: Dimensions.get("screen").width * 0.8,
        paddingVertical: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default PaymentSuccessScreen;
