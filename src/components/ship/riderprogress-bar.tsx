import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    View,
    Easing,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface ProgressProps {
    text:string
}

export default function RiderProgressBar({text}:ProgressProps) {
    const progressAnimation = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(progressAnimation, {
                        toValue: 1,
                        duration: 12000,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                    Animated.timing(progressAnimation, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        };

        startAnimation();
    }, [progressAnimation]);

    // Interpolated width for progress bar
    const progressWidth = progressAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.text}>{text}</Text>

                <View style={styles.progressBarContainer}>
                    <Animated.View
                        style={[styles.progressBar, { width: progressWidth }]}
                    />
                </View>
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        overflow:"hidden",
        marginTop:20
    },
    card: {
        width: SCREEN_WIDTH * 0.9,
        borderRadius: "50%",
        backgroundColor: "#F3F3F380",
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    text: {
        fontSize: 17,
        fontWeight: "500",
        marginBottom:20
    },
    progressBarContainer: {
        width: "100%",
        height: 7,
        backgroundColor: "#3a3a3a",
        borderRadius: 5,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: colors.primary,
        borderRadius: 5,
    },
});
