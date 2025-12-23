import { forwardRef, useContext, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetFooter,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { Image } from "expo-image";
import { s } from "react-native-size-matters";
import { colors } from "@/theme";
import { PatchRequest, PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { useRouter } from "expo-router";
import { ACTIONS } from "@/store/Actions";
import { SelectionCalendarIcon } from "@/assets/images/svgs";
const { width, height } = Dimensions.get('window');



type BottomSheetProps = {
    closeModal: () => void;
};




const DeliveryETA = forwardRef<BottomSheetModal, BottomSheetProps>(
    ({ closeModal}, ref) => {
        const headerHeight = useHeaderHeight();
        const [loading, setLoading] = useState(false)
        const { state, dispatch } = useContext(DataContext)
        const { shipping, shippingId, shippingType: type, token, orderData } = state
        const [selected, setSelected] = useState<string>('STANDARD');
        const router = useRouter()
        const [deliveryAmount, setDeliveryAmount] = useState(null)

        const pHeight = Platform.OS === "android" ? height * 0.6 : height * 0.5
        const mainHeight = shipping?.scheduleType === "basic" ? height * 0.4 : type === "multi" ? height * 0.4 : pHeight
        const SNAP_POINTS = [mainHeight];


        const deliveryOptions = [
            {
                id: 'EXPRESS',
                title: 'Express Delivery',
                eta: 'Pickup within 30min',
                price: shipping?.shippingModePrices?.express || deliveryAmount?.express || 0,
                icon: require('@/assets/images/express-icon.png'),
            },
            {
                id: 'STANDARD',
                title: 'Standard Delivery',
                eta: 'Pickup within 2hrs',
                price: shipping?.shippingModePrices?.standard || deliveryAmount?.standard || 0,
                icon: require('@/assets/images/standard-icon.png'),
            },
        ];

        // Assign to the rider
        const handleContinue = async () => {
            setDeliveryAmount({
                express: shipping?.shippingModePrices?.express || 0,
                standard: shipping?.shippingModePrices?.standard || 0
            })
            setLoading(true)

            const {pickupDate, pickupTime} = orderData

            const combinedDateTime = new Date(
                pickupDate.getFullYear(),
                pickupDate.getMonth(),
                pickupDate.getDate(),
                pickupTime.getHours(),
                pickupTime.getMinutes(),
                0,
                0
            );

            const dateTime = combinedDateTime.toISOString();

            const payload = {
                shippingMode: selected,
                scheduleType: orderData?.scheduleType,
                scheduledPickupTime:dateTime ,
                pickupTime,
                pickupDate
            }


            let response;
            if (type === "basic") {
                response = await PatchRequest(`/shipping/${shippingId}/schedule?type=single`, payload, token);
                if (response?.status === 200 || response.status === 201) {
                    dispatch({ type: ACTIONS.SHIPPING, payload: response?.data?.data })
                    router.replace("/(app)/(tabs)/ship/rider-request")
                    closeModal();
                    dispatch({ type: ACTIONS.DELIVERY_MODE, payload: false })
                }

            }
            else {
                response = await PatchRequest(`/shipping/${shippingId}/schedule?type=multi`, payload, token);
                if (response?.status === 200 || response.status === 201) {
                    dispatch({ type: ACTIONS.SHIPPING, payload: response?.data?.data })
                    router.replace("/(app)/(tabs)/ship/rider-request")
                    closeModal();
                    dispatch({ type: ACTIONS.DELIVERY_MODE, payload: false })
                }

            }
            
            setLoading(false)
        };
        

        const renderBackdrop = (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.4}
                pressBehavior="none"
            />
        );

        const handleRoute = () => {
            router.push("/(app)/(tabs)/ship/schedule-selection")
            closeModal()
        }

        return (
            <BottomSheetModal
                ref={ref}
                index={0}
                enableDynamicSizing={false}
                // enablePanDownToClose={false}
                key="LocationForm"
                name="LocationForm"
                keyboardBehavior="extend"
                snapPoints={SNAP_POINTS}
                style={styles.shadow}
                topInset={headerHeight}
                backdropComponent={renderBackdrop}
                footerComponent={(props) => (
                    <BottomSheetFooter {...props} bottomInset={0}>
                        <View style={styles.footerContainer}>
                            {type === "basic" && 
                            <TouchableOpacity onPress={handleRoute}>
                                <SelectionCalendarIcon />
                            </TouchableOpacity>}

                            <Button onPress={handleContinue} style={styles.secondButton}>
                                <ButtonText>Continue</ButtonText>
                                {loading ?
                                    <ActivityIndicator color="white" />
                                    :
                                    <Ionicons name="arrow-forward" size={24} color="white" />
                                }
                            </Button>
                        </View>
                    </BottomSheetFooter>
                )}
            >
                <BottomSheetView style={styles.container}>
                    <Text style={styles.heading}>Delivery Preference</Text>

                    {shipping?.scheduleType === "now" ?
                        <View style={styles.boxcontainer}>
                            {deliveryOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.card,
                                        selected === option.id && styles.selectedCard,
                                    ]}
                                    onPress={() => setSelected(option.id)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.left}>
                                        <Image source={option.icon} style={styles.icon} />
                                        <View>
                                            <Text style={styles.title}>{option.title}</Text>
                                            <Text style={styles.eta}>
                                                <Text style={styles.etaLabel}>ETA:</Text> {option.eta}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.price}>₦{option?.price?.toLocaleString()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        :
                        <View style={styles.boxcontainer}>
                            <TouchableOpacity
                                style={styles.card}
                            >
                                <View style={styles.left}>
                                    <Image source={require('@/assets/images/standard-icon.png')} style={styles.icon} />
                                    <View>
                                        <Text style={styles.title}>Scheduled Amount</Text>
                                    </View>
                                </View>
                                <Text style={styles.price}>₦{shipping?.shippingModePrices?.standard?.toLocaleString()}</Text>
                            </TouchableOpacity>
                        </View>}

                    {type === "basic" &&
                        <View style={[styles.banner, { marginTop: 20 }]}>
                            <Feather name="info" size={24} color={colors.primary} />
                            <Text style={{ color: "rgba(99, 99, 99, 1)", fontSize: s(12), flex: 1, fontFamily: 'interMedium' }}>
                                Schedule your pickup for later and get 20% off your shipping fare.
                            </Text>
                        </View>}

                </BottomSheetView>

                
            </BottomSheetModal>
        );
    },
);

export default DeliveryETA;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        position: 'relative'
    },
    shadow: {
        shadowColor: "#636363",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.9,
        shadowRadius: 25,
        elevation: 15,
    },
    boxcontainer: {
        gap: 20,
    },
    heading: {
        fontSize: s(13),
        fontFamily: 'interSemiBold',
        marginBottom: 20
    },
    card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    selectedCard: {
        borderColor: '#FF6B00',
        backgroundColor: '#FFFAF5',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    icon: {
        width: 32,
        height: 32,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    eta: {
        fontSize: 12,
        color: '#666',
    },
    etaLabel: {
        color: '#999',
        fontWeight: '500',
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
    },
    footerContainer: {
        marginHorizontal: 16,
        backgroundColor: "#fff",
        marginBottom: 20,
        flexDirection: 'row',
        gap: 10
    },
    firstButton: {
        // width:80,
        paddingHorizontal: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    secondButton: {
        flexGrow: 1
    },
    banner: {
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "rgba(249, 114, 22, 0.1)",
        flexDirection: "row",
        gap: 10,
    },
});