import React from "react";
import { View, StyleSheet } from "react-native";
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Utility function for styles
export const getStyles = (status: string) => {
    switch (status) {
        case "PENDING":
            return {
                backgroundColor: "#F972161A",
                iconColor: "#F97216",
            };
       
        case "SUCCESS":
            return {
                backgroundColor: "#E8F5E9",
                iconColor: "#4FB948",
            };
        default:
            return {
                backgroundColor: "#F972161A",
                iconColor: "red",
            };
    }
};

// Reusable component
const TransactionIcon = ({ status, type }: { status: string, type:string }) => {
    const { backgroundColor, iconColor } = getStyles(status);

    return (
        <View style={[styles.iconContainer, { backgroundColor }]}>
            {type === "WALLET" ? <AntDesign name="creditcard" size={24} style={{ color: iconColor }} />
            : <MaterialCommunityIcons name="bank" size={20} style={{ color: iconColor }} />}
        </View>
    );
};

export default TransactionIcon;

const styles = StyleSheet.create({
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
});
