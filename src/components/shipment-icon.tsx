import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Utility function for styles
export const getShipmentStyles = (status: string, type:any) => {
    if (type === "later") {
        return {
            backgroundColor: "#6363631A",
            iconColor: "#636363",
        };
    }

    switch (status) {
        case "PENDING":
            return {
                backgroundColor: "#F972161A",
                iconColor: "#F97216",
            };
        case "PAYMENT_COMPLETED":
            return {
                backgroundColor: "#1E83C51A",
                iconColor: "#1E83C5",
            };
        case "RIDER_ASSIGNED":
            return {
                backgroundColor: "#1E83C51A",
                iconColor: "#1E83C5",
            };
        case "PICKED_UP":
            return {
                backgroundColor: "#1E83C51A",
                iconColor: "#1E83C5",
            };
        case "IN_TRANSIT":
            return {
                backgroundColor: "#1E83C51A",
                iconColor: "#1E83C5",
            };
        case "DELIVERED":
            return {
                backgroundColor: "#4FB9481A",
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
const ShipmentIcon = ({ status, type }: { status: string, type?:string }) => {
    const { backgroundColor, iconColor } = getShipmentStyles(status, type);

    return (
        <View style={[styles.iconContainer, { backgroundColor }]}>
            <Ionicons name="cube-outline" size={24} style={{ color: iconColor }} />
        </View>
    );
};

export default ShipmentIcon;

const styles = StyleSheet.create({
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});
