import React from "react";
import { Text, StyleSheet } from "react-native";

// Props interface for type safety
interface TransactionStatusProps {
    status: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ status }) => {
    const getStyles = (status: string) => {
        switch (status) {
            case "PENDING":
                return {
                    backgroundColor: "#FFEFD5",
                    color: "#FF8C00",
                };
            case "SUCCESS":
                return {
                    backgroundColor: "#E8F5E9", 
                    color: "#4FB948",
                };
            case "FAILED":
            default:
                return {
                    backgroundColor: "#FFEBEE",
                    color: "#D32F2F",
                };
        }
    };

    const styles = getStyles(status);

    return (
        <Text
            style={[
                defaultStyles.text,
                { backgroundColor: styles.backgroundColor, color: styles.color },
            ]}
        >
            {status.toUpperCase()}
        </Text>
    );
};

const defaultStyles = StyleSheet.create({
    text: {
        textTransform:'capitalize',
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        overflow: "hidden",
        textAlign: "center",
        alignSelf: "flex-end",
    },
});

export default TransactionStatus;
