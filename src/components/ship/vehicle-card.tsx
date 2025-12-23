import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Props{
    vehicleType?:string,
    plateNumber?:string
}

const VehicleCard = (props:Props) => {
  
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Ionicons name="bicycle-outline" size={24} style={styles.icon} />
                <Text style={styles.timeText}>2 mins away</Text>
                <Ionicons name="location-outline" size={18} color="#000" style={styles.locationIcon} />
                <Text style={styles.distanceText}>105m</Text>
            </View>
            <Text style={styles.vehicleText}>
                {props?.vehicleType || "Toyota Camry"}  <Text style={styles.plateText}>{props?.plateNumber || "EUHE-E333"}</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#F3F3F380",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        borderWidth: 1,
        borderColor: "#6363631A",
        marginTop:20
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    icon: {
        marginRight: 4,
    },
    timeText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
    },
    locationIcon: {
        color: "#B2B2B2",
        marginHorizontal: 8,
    },
    distanceText: {
        fontSize: 14,
        color: "#636363",
    },
    vehicleText: {
        fontSize: 14,
        color: "#000000",
        fontWeight: "600",
        // textTransform:'uppercase'
    },
    plateText: {
        fontSize: 14,
        color: "#636363",
        fontWeight: "400",
    },
});

export default VehicleCard;
