import React, { useContext, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import {
    AntDesign,
    EvilIcons,
    Feather,
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Button, ButtonText } from "@/components/ui/button";
import CustomModal from "@/components/ui/modal";
import { Switch, SwitchThumb, SwitchTrack } from "@/components/ui/switch";
import Text from "@/components/ui/text";
import { useAuthStore } from "@/store/auth";
import { colors, spacing } from "@/theme";
import { removeToken } from "@/utils/helper";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import { SubscriptionsIcon } from "@/assets/images/svgs";
import { s } from "react-native-size-matters";
import { PostRequest } from "@/utils/requests";
import { toast } from "sonner-native";

const ProfileSettings = () => {
    const [signOutModalVisible, setSignOutModalVisible] = useState(false);
    const logoutUser = useAuthStore((state) => state.logoutUser);
    const { state, dispatch } = useContext(DataContext)
    const { user } = state
    const [loading, setLoading] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)


    const handleSignOut = async () => {
        const payload = {
            deviceToken: state?.deviceInfo?.deviceToken
        }
        setLoading(true)

        // await PostRequest("/auth/logout", payload, state?.token)
        dispatch({ type: ACTIONS.USER })
        router.replace("/(auth)/sign-in");
        logoutUser();
        await removeToken("token");

        setLoading(false)
    };

    const handlePayment = async () => {
        setButtonLoading(true);

        const payload = {
            customerId: user?.id,
            paymentMethod: "PAYSTACK"
        };

        const res = await PostRequest(
            "/transactions/outstanding-bill/initiate",
            payload,
            state?.token,
        );

        if (res?.status === 200 || res?.status === 201) {
            router.replace({
                pathname: "/(app)/(tabs)/account/paystack",
                params: {
                    paystack_url: res?.data?.data?.authorizationUrl,
                    amount: res?.data?.data?.amountInNaira,
                },
            });

        }
        setButtonLoading(false);
    };

    const handleCopy = async () => {
        try {
            await Clipboard.setStringAsync("12345674");
            toast.success("Account number copied to clipboard.");
        } catch (error) {
            toast.error("Unable to copy the Account number.");

        }
    };
    // 

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1 }}>

                <View style={styles.walletContainer}>
                    <View style={[styles.wallet, { backgroundColor: colors.primary, marginBottom: -30, zIndex: 1, height:130 }]}>
                        <Text
                            style={{
                                fontSize: s(12),
                                letterSpacing: -0.5,
                                color: "#fff",
                                marginTop: 20,
                                fontFamily: 'interMedium'
                            }}
                        >
                            Total Outstanding Balance
                        </Text>

                        <Text style={styles.walletBalance}>
                            {user?.subscription?.outstandingBalanceInNaira?.toLocaleString("en-NG", {
                                style: "currency",
                                currency: "NGN",
                            }) || 0?.toLocaleString("en-NG", {
                                style: "currency",
                                currency: "NGN",
                            })}
                        </Text>

                        <Image
                            source={require("@/assets/images/ring.png")}
                            style={styles.ring}
                        />
                    </View>

                    <View style={styles.wallet}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30, gap: 3 }}>
                            <MaterialCommunityIcons name="bank" size={20} color="white" />
                            <Text
                                style={{
                                    fontSize: s(13),
                                    letterSpacing: -0.5,
                                    color: "#fff",
                                    fontFamily: 'interSemiBold'
                                }}
                            >
                                Moniepoint
                            </Text>
                        </View>

                        <TouchableOpacity onPress={handleCopy} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 3 }}>
                            <Text style={{ fontFamily: "interSemiBold", color:'white', fontSize:s(18)}}>
                                2221245678
                            </Text>
                            <MaterialIcons name="content-copy" size={20} color="white" />
                            <MaterialCommunityIcons name="bank" />
                        </TouchableOpacity>

                        <Text
                            style={{
                                fontSize: s(12),
                                letterSpacing: -0.5,
                                color: "#fff",
                                marginTop: 5,
                                fontFamily: 'interMedium'
                            }}
                        >
                            Adeleke David
                        </Text>

                        <Image
                            source={require("@/assets/images/wallet.png")}
                            style={styles.walletImage}
                        />
                    </View>

                    {user?.subscription?.outstandingBalanceInNaira > 0 &&
                        <Button onPress={handlePayment} style={{ width: '100%', borderRadius: 30, marginTop: 20, alignItems: 'center' }}>
                            <ButtonText style={{ fontSize: s(13) }}>
                                {buttonLoading ? <ActivityIndicator color="white" /> : "Pay Now "}
                            </ButtonText>
                        </Button>}
                </View>

                <View style={styles.header}>
                    <Text style={styles.headerText}>Personal</Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push("/(app)/(tabs)/account/profile-details")}
                    style={styles.itemContainer}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Ionicons name="person-outline" size={18} color="black" />
                        <Text style={styles.itemText}>Profile Details</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="black" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>Subscriptions</Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push("/(app)/(tabs)/account/subscriptions")}
                    style={styles.itemContainer}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <SubscriptionsIcon />
                        <Text style={styles.itemText}>YPMC 360</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="black" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>Services</Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push("/(app)/(tabs)/account/referrals")}
                    style={styles.itemContainer}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Feather name="gift" size={18} color="black" />
                        <Text style={styles.itemText}>Referrals</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="black" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>Others</Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push("/(app)/(tabs)/account/transaction-history")}
                    style={styles.itemContainer}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <FontAwesome5 name="history" size={18} color="black" />
                        <Text style={styles.itemText}>Transaction History</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/(app)/(tabs)/account/faqs")}
                    style={styles.itemContainer}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <AntDesign name="questioncircleo" size={18} color="black" />
                        <Text style={styles.itemText}>FAQs</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/(app)/(tabs)/account/support")}
                    style={styles.itemContainer}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <AntDesign name="questioncircleo" size={18} color="black" />
                        <Text style={styles.itemText}>Support</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="black" />
                </TouchableOpacity>

                <View style={styles.itemContainer}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Ionicons name="finger-print" size={18} color="black" />
                        <Text style={styles.itemText}>Biometrics</Text>
                    </View>

                    <Switch
                        //   checked={field.value}
                        //   onCheckedChange={field.onChange}
                        style={styles.switch}
                    >
                        <SwitchTrack style={styles.track}>
                            <SwitchThumb style={styles.thumb} />
                        </SwitchTrack>
                    </Switch>
                </View>

                <View style={styles.header}>
                    {/* <Text style={styles.headerText}>Account</Text> */}
                </View>

                <TouchableOpacity
                    onPress={() => router.push("/(app)/(tabs)/account/change-password")}
                    style={styles.itemContainer}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="#000000"
                        />
                        <Text style={styles.itemText}>Change Password</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="black" />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} style={styles.itemContainer} onPress={() => setSignOutModalVisible(true)}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <AntDesign name="logout" size={18} color="black" />
                        <Text style={styles.itemText}>Sign Out</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="black" />
                </TouchableOpacity>

                <View style={styles.header}>
                    {/* <Text style={styles.headerText}>Account</Text> */}
                </View>

                <CustomModal
                    visible={signOutModalVisible}
                    onClose={() => setSignOutModalVisible(false)}
                >
                    <View style={{ paddingHorizontal: 10 }}>
                        <Text style={styles.modalTitle}>Sign Out</Text>
                        <Text style={styles.modalDescription}>
                            Are you sure you want to Sign Out?
                        </Text>

                        <View style={{ marginTop: 50 }}>
                            <Button size="sm" onPress={handleSignOut}>
                                <ButtonText>Sign Out </ButtonText>
                                {loading ? <ActivityIndicator color="white" /> : <AntDesign name="logout" size={24} color="white" />}
                            </Button>

                            <Button
                                variant="outline"
                                style={{ marginTop: 10 }}
                                onPress={() => setSignOutModalVisible(false)}
                            >
                                <ButtonText>Cancel </ButtonText>
                            </Button>
                        </View>
                    </View>
                </CustomModal>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F3F3",
    },
    walletContainer: {
        backgroundColor: "#ffffff",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    wallet: {
        position: "relative",
        backgroundColor: "black",
        borderRadius: 20,
        padding: 20,
        height: 150
    },
    walletName: {
        fontFamily: "interMedium",
        fontSize: 12,
        color: "#fff",
        letterSpacing: 4,
        zIndex: 9
    },
    walletBalance: {
        fontFamily: "interSemiBold",
        fontSize: s(22),
        color: "#fff",
        marginTop: 10,
    },
    walletImage: {
        width: "60%",
        height: 90,
        position: "absolute",
        bottom: 0,
        right: 0,
    },
    ring: {
        width: 176,
        height: 176,
        position: "absolute",
        top: -118,
        right: 20,
    },
    header: {
        paddingLeft: spacing.md,
        paddingVertical: spacing.sm,
        rowGap: 10,
    },
    headerText: {
        color: "#636363",
    },
    itemContainer: {
        backgroundColor: "#ffffff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    itemText: {
        fontSize: 14,
    },
    textStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        margin: spacing.xxs,
    },
    text: {
        fontSize: 14,
        fontFamily: "interRegular",
    },
    switch: {
        // Size of the switch
        width: 50,
        height: 30,
    },
    track: {
        // Track styling
        flex: 1,
        borderRadius: 15,
        backgroundColor: "#F3F3F3",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#6363631A",
    },
    thumb: {
        // Thumb styling
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.primary,
        margin: 2,
    },
    modalTitle: {
        fontSize: 16,
        fontFamily: "interSemiBold",
        textAlign: "center",
    },
    modalDescription: {
        marginTop: 20,
        color: "#636363",
        fontSize: 14,
        fontFamily: "interRegular",
        textAlign: "center",
    },
});

export default ProfileSettings;
