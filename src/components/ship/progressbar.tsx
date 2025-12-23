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

export default function ProgressBar() {
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
                        duration:0,
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
                <View style={{flexDirection:'row', alignItems:'center', columnGap:10, marginBottom:20}}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor:'rgba(243, 243, 243, 0.2)', height:40, width:40, borderRadius:'50%'}}>
                        <Ionicons name="bicycle-outline" size={26} color="white" />
                    </View>

                    <Text style={styles.text}>Searching for available riders...</Text>
                </View>
               
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
        // flex: 1,
        // backgroundColor: "ye",
        justifyContent: "center",
        alignItems: "center",
        marginBottom:180,
        position:'absolute',
        left:20,
        bottom:0
    },
    card: {
        width: SCREEN_WIDTH * 0.9,
        borderRadius: 16,
        backgroundColor: "#212121",
        paddingVertical: 30,
        paddingHorizontal: 10,
        justifyContent: "center",
    },
    text: {
        color: "white",
        fontSize: 15,
        fontWeight: "500",
    },
    progressBarContainer: {
        width: "100%",
        height: 10,
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
