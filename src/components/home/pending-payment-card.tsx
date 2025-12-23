import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { s, vs, ms } from 'react-native-size-matters';
import { ACTIONS } from '@/store/Actions';
import { DataContext } from '@/store/GlobalState';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';

const PendingPaymentCard = (item: any) => {
    const { shipping, type } = item
    const { state, dispatch } = useContext(DataContext)
    const [id, setId] = useState("")
    const [buttonLoading, setButtonLoading] = useState(false)
    const router = useRouter()


    // set orderData
    const setData = () => {
        const order = item.shipping
        const payload = {
            dropoffLatitude: parseFloat(order?.dropoffLatitude),
            dropoffLongitude: parseFloat(order?.dropoffLongitude),
            dropoffState: order?.dropoffState,
            dropoffStreet: item?.dropoffStreet,
            pickupLatitude: parseFloat(order?.pickupLatitude),
            pickupLongitude: parseFloat(order?.pickupLongitude),
            pickupState: order?.pickupState,
            pickupStreet: order?.pickupStreet,
        }

        dispatch({ type: ACTIONS.ORDER_DATA, payload: { ...state?.orderData, ...payload } })
    }

    const setMultipleData = () => {
        const shipping = item?.shipping?.shippings?.[0];

        const payload = {
            dropoffLatitude: parseFloat(shipping?.dropoffLatitude ?? "0"),
            dropoffLongitude: parseFloat(shipping?.dropoffLongitude ?? "0"),
            dropoffState: shipping?.dropoffState ?? "",
            dropoffStreet: shipping?.dropoffStreet ?? "",
            pickupLatitude: parseFloat(shipping?.pickupLatitude ?? "0"),
            pickupLongitude: parseFloat(shipping?.pickupLongitude ?? "0"),
            pickupState: shipping?.pickupState ?? "",
            pickupStreet: shipping?.pickupStreet ?? "",
        };

        dispatch({ type: ACTIONS.ORDER_DATA, payload: { ...state?.orderData, ...payload } })
    }

    // handle route
    const handleRoute = async () => {
        setButtonLoading(true)
        setId(item?.shipping?.id)
        dispatch({ type: ACTIONS.GENERAL_CALLBACK, payload: !state?.generalCallback })

        if (item?.type === "individual") {
            setData()
            dispatch({ type: ACTIONS.SHIPPING_TYPE, payload: "basic" })
            dispatch({ type: ACTIONS.SHIPPING, payload: item?.shipping })
            dispatch({ type: ACTIONS.SHIPPING_ID, payload: item?.shipping?.id })
        }
        else {
            setMultipleData()
            dispatch({ type: ACTIONS.SHIPPING_TYPE, payload: "multi" })
            dispatch({ type: ACTIONS.SHIPPING, payload: item?.shipping })
            dispatch({ type: ACTIONS.SHIPPING_ID, payload: item?.shipping?.id })
        }

        setTimeout(() => {
            router.push("/(app)/(tabs)/ship/rider-request")
            setButtonLoading(false)
        }, 2000)
    }


    return (
        <TouchableOpacity onPress={handleRoute} style={styles.trackingCardContainer}>
            {type === "multi" &&
                <View
                    style={{
                        backgroundColor: colors.primary, padding: 5, paddingHorizontal: 8, position: 'absolute', top: 0, right: 0, borderBottomLeftRadius: 10
                    }}>
                    <Text style={{ color: 'white', fontFamily: 'interSemiBold', textAlign: 'center', fontSize: s(10) }}>Multiple (+{shipping?.shippings?.length})</Text>
                </View>
            }

            <View style={styles.trackingIconBackground}>
                <MaterialCommunityIcons name="package-variant-closed" size={ms(24)} color="#FF7A00" />
            </View>
            <View style={styles.trackingTextContent}>
                <Text style={styles.trackingCategory}>{type === "individual" ? shipping?.packageDetails?.name : shipping?.shippings[0].packageDetails?.name}</Text>
                <View style={styles.trackingStatusRow}>
                    <MaterialCommunityIcons name="bicycle" size={ms(17)} color="#636363" />
                    <Text style={styles.trackingStatusText}>{shipping?.status?.toLowerCase()}</Text>
                </View>
            </View>
            <View style={styles.trackingAmountContent}>
                <Text style={styles.trackingAmount}>₦{type === "individual" ? shipping?.actualPriceInNaira : shipping?.totalActualPriceInNaira || 0}</Text>
                {buttonLoading ? <ActivityIndicator />
                    :
                    <AntDesign name="right" size={ms(16)} color="#000" />}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    trackingCardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F380',
        borderRadius: ms(12),
        paddingVertical: vs(16),
        paddingHorizontal: s(16),
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    trackingIconBackground: {
        width: ms(48),
        height: ms(48),
        borderRadius: 50,
        backgroundColor: '#F972161A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(12),
    },
    trackingTextContent: {
        flex: 1,
    },
    trackingCategory: {
        fontSize: ms(16),
        fontWeight: '600',
        color: '#171717',
        fontFamily: 'System',
    },
    trackingStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: vs(2),
    },
    trackingStatusText: {
        fontSize: ms(12),
        color: '#636363',
        marginLeft: s(4),
        fontFamily: 'System',
    },
    trackingAmountContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: s(10),
    },
    trackingAmount: {
        fontSize: ms(16),
        fontWeight: '600',
        color: '#171717',
        marginRight: s(8),
        fontFamily: 'System',
    },
});

export default PendingPaymentCard