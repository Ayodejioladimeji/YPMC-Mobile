import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { s } from "react-native-size-matters";

// Props interface for type safety
interface StatusComponentProps {
    status: string;
}

const StatusComponent: React.FC<StatusComponentProps> = ({ status }) => {
    const getStatus = (status: string): string => {
        if (
            ["PAYMENT_COMPLETED", "RIDER_ASSIGNED", "IN_TRANSIT", "PICKED_UP"].includes(
                status
            )
        ) {
            return "ACTIVE";
        } else if (status === "PENDING") {
            return "PENDING";
        } else if (status === "DELIVERED") {
            return "DELIVERED";
        } else if (status === "CANCELLED") {
            return "CANCELLED";
        } else {
            return "FAILED";
        }
    };

    const computedStatus = getStatus(status);

    // Add styling or presentation if needed
    return (
            <Text style={styles.text}>
                {computedStatus}
            </Text>    );
};

const styles = StyleSheet.create({

    text: {
        textTransform:'uppercase',
         color: "#636363",
        fontSize: s(11),
    },
    active: {
        color: "blue",
    },
    pending: {
        color: "orange",
    },
    delivered: {
        color: "green",
    },
    cancelled: {
        color: "red",
    },
    failed: {
        color: "gray",
    },
});

export default StatusComponent;
