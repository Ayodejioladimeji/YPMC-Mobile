import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    selected:string,
    setSelected:(value:string) => void
}

export default function RadioCheck({selected, setSelected}:Props) {
    

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => setSelected("now")}
            >
                <View
                    style={[
                        styles.radioCircle,
                        selected === "now" && styles.radioSelected,
                    ]}
                >
                    {selected === "now" && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                </View>
                <Text style={styles.optionText}>Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => setSelected("later")}
            >
                <View
                    style={[
                        styles.radioCircle,
                        styles.orangeCircle,
                        selected === "later" && styles.radioSelected,
                    ]}
                >
                    {selected === "later" && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                </View>
                <Text style={styles.optionText}>Schedule for Later</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        columnGap:40,
        marginVertical: 20,
    },
    optionContainer: {
        flexDirection: "row",
        alignItems:'center'
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#ddd",
        alignItems: "center",
        justifyContent: "center",
    },
    radioSelected: {
        backgroundColor: "#FF6600", // Orange color for selected radio
        borderColor: "#FF6600",
    },
    orangeCircle: {
        borderColor: "#FF6600",
    },
    optionText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: "400",
        color: "#000",
    },
});
