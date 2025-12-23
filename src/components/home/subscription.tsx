import React, { useContext } from "react"
import CustomModal from "../ui/modal"
import { StyleSheet, View } from "react-native"
import Text from "../ui/text"
import { colors } from "@/theme"
import { s } from "react-native-size-matters"
import { DataContext } from "@/store/GlobalState"
import moment from "moment"
import { SubscriptionBoxIcon, SubscriptionCalendarIcon, SubscriptionClockIcon } from "@/assets/images/svgs"
import { Button, ButtonText } from "../ui/button"
import { useRouter } from "expo-router"

const Subscription = ({ isModalVisible, setIsModalVisible }: any) => {
    const { state } = useContext(DataContext)
    const { user } = state
    const router = useRouter()

    const handleRoute = () =>{
        router.push("/(app)/(tabs)/account/subscriptions")
        setIsModalVisible(false)
    }

    // 

    return (
        <CustomModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
        >
            <View style={{ paddingBottom: 25, borderBottomWidth: 0.5, borderColor: "#6363631A" }}>
                <Text style={styles.modalTitle}>YPMC 360</Text>
            </View>

            <View style={{ paddingVertical:12, flexDirection: 'row', gap: 10 }}>
                <SubscriptionBoxIcon />
                <View style={{ }}>
                    <Text style={[styles.text, {color:"#636363"}]}>Total Completed Deliveries</Text>
                    <Text style={[styles.text, {fontSize:s(14),fontFamily:'interMedium'}]}>{user?.subscription?.deliveriesUsed}</Text>
                </View>
            </View>

            <View style={{ paddingVertical:12, flexDirection: 'row', gap: 10 }}>
                <SubscriptionCalendarIcon />
                <View style={{ }}>
                    <Text style={[styles.text, {color:"#636363"}]}>Plan Duration </Text>
                    <Text style={[styles.text, {fontSize:s(13),fontFamily:'interMedium'}]}>
                        {moment(user?.subscription.startDate).format("ll")}
                        {" "}-{" "}
                        {moment(user?.subscription.expiresAt).format("ll")}
                        </Text>
                </View>
            </View>

            <View style={{ paddingVertical:12, flexDirection: 'row', gap: 10 }}>
                <SubscriptionClockIcon />
                <View style={{ }}>
                    <Text style={[styles.text, {color:"#636363"}]}>Days Remaining</Text>
                    <Text style={[styles.text, {fontSize:s(14),fontFamily:'interMedium'}]}>{user?.subscription?.daysRemaining}</Text>
                </View>
            </View>

            <Button
                style={{ marginTop: 10 }}
                onPress={handleRoute}
            >
                <ButtonText>Go to Dashboard</ButtonText>
            </Button>

        </CustomModal>
    )
}

const styles = StyleSheet.create({
    modalTitle: {
        fontSize: s(15),
        fontFamily: "interSemiBold",
    },
    text: {
        fontSize: s(13),
        fontFamily: "interRegular",
        lineHeight:25
    },
})

export default Subscription