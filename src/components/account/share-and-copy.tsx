import React, { useContext } from "react";
import { View, StyleSheet, Text, Alert, Share, Button as RNButton } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { spacing } from "@/theme";
import { Button, ButtonText } from "../ui/button";
import { DataContext } from "@/store/GlobalState";
import { toast } from "sonner-native";

const ShareAndCopy = () => {
    const { state } = useContext(DataContext)
    const referralCode = state?.user?.referralCode;

    // Share referral code functionality
    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `Use my referral code ${referralCode} to register at YPMC`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // console.log("Shared with activity type: ", result.activityType);
                } else {
                    // console.log("Shared successfully");
                }
            } else if (result.action === Share.dismissedAction) {
                // console.log("Share dismissed");
            }
        } catch (error) {
            Alert.alert("Error", "Unable to share the referral code.");
        }
    };

    // Copy referral code functionality
    const handleCopy = async () => {
        try {
            await Clipboard.setStringAsync(referralCode);
            toast.success("Referral code copied to clipboard.");
        } catch (error) {
            Alert.alert("Error", "Unable to copy the referral code.");

        }
    };

    //  

    return (
        <View style={styles.buttonContainer}>
            <Button onPress={handleShare} style={{width:'80%'}}>
                <ButtonText>{state?.user?.referralCode}</ButtonText>
                <Text style={{ padding: 10, color: "white" }}>|</Text>
                <Entypo name="share" size={20} color="white" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                style={{ width: 58, height: 58 }}
                onPress={handleCopy}
            >
                <FontAwesome6 name="copy" size={20} color="black" />
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
        gap: 10,
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6600",
        padding: 10,
        borderRadius: 8,
        marginRight: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    separator: {
        color: "white",
        padding: 10,
    },
    buttonOutline: {
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#FF6600",
        borderWidth: 1,
        borderRadius: 8,
    },
});

export default ShareAndCopy;
