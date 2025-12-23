import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import moment from "moment";

export default function AddressList({data}: any) {
    // 
    
    return (
        <View style={styles.container}>
            <View style={styles.rowContainer}>

                <View style={styles.iconContainer}>
                    <MaterialIcons name="circle" size={16} color="#FF5E00" />
                    <View style={styles.verticalLine} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.address}>{`${data?.pickupStreet}, ${data?.pickupArea}, ${data?.pickupState}`}</Text>
                    <Text style={[styles.time, { textTransform: 'uppercase' }]}>{moment(data?.pickupDate).format("lll")} {" "}
                    </Text>
                </View>
            </View>

            {/* Second Address */}
            <View style={styles.rowContainer}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <MaterialIcons name="place" size={17} color="#4CAF50" />
                </View>

                {/* Address & Time */}
                <View style={styles.textContainer}>
                    <Text style={styles.address}>{`${data?.dropoffStreet}, ${data?.dropoffArea}, ${data?.dropoffState}`}</Text>
                    <Text style={[styles.time, {textTransform:'uppercase'}]}>{moment(data?.pickupDate).format("lll")}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        marginTop:10
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    iconContainer: {
        alignItems: "center",
        marginRight: 12,
        position: "relative",
    },
    verticalLine: {
        position: "absolute",
        top: 16,
        left: 7,
        width: 1,
        height: 60,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderStyle: "dashed",
    },
    textContainer: {
        flex: 1,
    },
    address: {
        fontSize: 13,
        color: "#000",
    },
    time: {
        fontSize: 12,
        color: "#6C6C6C",
        marginTop: 4,
    },
});
