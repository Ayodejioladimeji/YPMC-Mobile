import images from "@/assets/images";
import { ACTIONS } from "@/store/Actions";
import { DataContext } from "@/store/GlobalState";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

const PaymentSuccessScreen = () => {
    const router = useRouter()
    const { state, dispatch } = useContext(DataContext)

    const handleRoute = () => {
        dispatch({ type: ACTIONS.CALLBACK, payload: !state?.callback })
        dispatch({ type: ACTIONS.ORDER_DATA, payload: null })
        dispatch({ type: ACTIONS.CLEAR_MULTIPLE_DATA })
        router.replace({ pathname: "/track", params: { initialTab: "active" } })
    }

    // 

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconBackground}>
                    <Image
                        source={state?.user?.subscription ? images.subSuccess : images.success}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                </View>

                {state?.user?.subscription ?
                    <Text style={styles.title}>Shipment Created Successfully</Text>
                    :
                    <Text style={styles.title}>Payment Successful!</Text>}

                <Text style={styles.subtitle}>
                    Your shipment is now on its way. Track its progress in real-time ✨.
                </Text>

                <TouchableOpacity style={styles.button} onPress={handleRoute}>
                    <Text style={styles.buttonText}>Track Your Shipment</Text>
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
