import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, AppState, ActivityIndicator } from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import TopNavigation from '@/components/TopNavigation';
import PendingPaymentCard from '@/components/home/pending-payment-card';
import { GetRequest } from '@/utils/requests';
import { useRouter } from 'expo-router';
import { DataContext } from '@/store/GlobalState';
import { formatMoney } from '@/utils/utils';

// 

export default function PendingPayment() {
    const router = useRouter();
    const { state, dispatch } = useContext(DataContext);
    const [shipment, setShipment] = useState<any>([]);
    const [filteredShipment, setFilteredShipment] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const appState = useRef(AppState.currentState);
    const [refreshLoading, setRefreshLoading] = useState(false);

    // get ongoing shipment
    useEffect(() => {
        if (state?.token) {
            getPendingOrders();
        }
    }, [state?.token, state?.callback]);

    const getPendingOrders = async () => {
        const res = await GetRequest("/shipping/customer?statusCategory=PENDING", state?.token);
        if (res?.status === 200 || res?.status === 201) {
            const result = res.data.data?.filter(
                (ship: any) =>
                    ship?.shipping?.riderAssignmentStatus === "ACCEPTED" ||
                    ship?.shipping?.riderAssignmentStatus === "FULLY_ACCEPTED"
            );
            setShipment(result);
            setFilteredShipment(result); // initialize filtered list
        }
        setLoading(false);
    };

    // Handle app state changes (refresh when active again)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                getPendingOrders();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Search filter
    const handleSearch = (text: string) => {
        setSearchQuery(text);

        if (!text.trim()) {
            setFilteredShipment(shipment);
            return;
        }

        const lower = text.toLowerCase();

        const filtered = shipment.filter((item: any) => {
            if (item.type === "individual") {
                return (
                    item?.shipping?.trackingId?.toLowerCase().includes(lower) ||
                    item?.shipping?.packageDetails?.name?.toLowerCase().includes(lower) ||
                    item?.shipping?.pickupStreet?.toLowerCase().includes(lower) ||
                    item?.shipping?.dropoffStreet?.toLowerCase().includes(lower)
                );
            } else if (item.type === "multi") {
                return (
                    item?.shipping?.multiTrackingId?.toLowerCase().includes(lower) ||
                    item?.shipping?.shippings?.some((ship: any) =>
                        ship?.packageDetails?.name?.toLowerCase().includes(lower)
                    )
                );
            }
            return false;
        });

        setFilteredShipment(filtered);
    };

    const handlePayTotal = () => {
        console.log('Pay Total button pressed');
    };

    const totalAmount = filteredShipment?.reduce((sum: number, order: any) => {
        const price =
            order.type === "individual"
                ? order.shipping?.actualPriceInNaira || 0
                : order.shipping?.totalActualPriceInNaira || 0;

        return sum + price;
    }, 0);

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavigation title="Pending Payments" />

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by package name"
                        placeholderTextColor="#63636380"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                <View style={styles.cardsContainer}>
                    {loading ? (
                        <ActivityIndicator />
                    ) : filteredShipment.length > 0 ? (
                        filteredShipment.map((item: any, index: number) => (
                            <PendingPaymentCard {...item} key={index} />
                        ))
                    ) : (
                        <Text style={{ textAlign: 'center', color: '#636363' }}>
                            No shipments found.
                        </Text>
                    )}
                </View>
            </ScrollView>

            {filteredShipment?.length > 1 && (
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handlePayTotal} style={styles.payButton}>
                        <Text style={styles.payButtonText}>
                            Pay Total ₦{formatMoney(totalAmount || 0)}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollViewContent: {
        paddingHorizontal: s(16),
        paddingTop: vs(20),
        paddingBottom: vs(100),
    },
    searchContainer: {
        marginBottom: vs(20),
        position: 'relative',
    },
    searchInput: {
        flex: 1,
        height: vs(40),
        backgroundColor: '#F3F3F3',
        borderRadius: 30,
        paddingHorizontal: s(15),
        fontSize: ms(14),
        color: '#171717',
        fontFamily: 'InterRegular',
    },
    cardsContainer: {
        gap: vs(10),
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: s(16),
        paddingVertical: vs(15),
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    payButton: {
        backgroundColor: '#FF7A00',
        borderRadius: 30,
        paddingVertical: vs(15),
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonText: {
        color: 'white',
        fontSize: ms(16),
        fontWeight: '700',
        fontFamily: 'System',
    },
});
