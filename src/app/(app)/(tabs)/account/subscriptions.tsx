import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopNavigation from '@/components/TopNavigation';
import { Image } from 'expo-image';
import { DataContext } from '@/store/GlobalState';
import { s } from 'react-native-size-matters';
import { DeployedIcon, SubscriptionBigIcon } from '@/assets/images/svgs';
import moment from 'moment';
import { Button, ButtonText } from '@/components/ui/button';

const DashboardCards = () => {
    const { state } = useContext(DataContext)
    const { user } = state

    // 

    return (
        <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
            <TopNavigation title="YPMC 360" />

            {!user?.subscription ?
                <View style={[styles.container, {
                    flex: 1,
                    backgroundColor: '#fff',
                    paddingHorizontal: 24,
                    justifyContent: 'center',
                    alignItems: 'center'
                }]}>
                    <SubscriptionBigIcon />
                    <Text style={{
                        fontSize: s(14),
                        color: '#111827',
                        textAlign: 'center',
                        marginVertical: 20,
                        fontFamily: 'interRegular'
                    }}>You do not have an active subscription plan at the moment</Text>
                    <Button style={{ width: '100%', borderRadius: 30 }}>
                        <ButtonText style={{ fontSize: s(13) }}>Subscribe now</ButtonText>
                    </Button>
                </View>
                :
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>

                        {/* Card 1 */}
                        <View style={styles.card}>
                            <View style={styles.content}>
                                <View style={[styles.iconCircle, { backgroundColor: '#4FB9481A' }]}>
                                    <Ionicons name="cube-outline" size={24} color="#4FB948" />
                                </View>

                                <Text style={styles.cardTitle}>Total Completed Deliveries</Text>
                                <Text style={styles.bigNumber}>{user?.subscription?.deliveriesUsed}</Text>
                                <Text style={styles.subText}>
                                    <Text style={styles.bold}>{user?.subscription?.remainingDeliveries} Deliveries left</Text> for this month.
                                </Text>
                            </View>

                        </View>

                        {/* Card 2 */}
                        <View style={styles.card}>
                            <View style={styles.content}>
                                <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                                    <DeployedIcon />
                                </View>

                                <Text style={styles.cardTitle}>Total Riders Deployed</Text>
                                <Text style={styles.bigNumber}>{user?.subscription?.plan?.riderCount}</Text>
                                <Text style={styles.subText}>
                                    <Text style={styles.bold}>0 Riders</Text> left for deployment
                                </Text>
                            </View>
                        </View>

                        {/* Card 3 */}
                        <View style={styles.card}>
                            <Text style={styles.activeTitle}>360 Plan</Text>
                            <View style={styles.divider} />

                            {/* <View style={styles.infoRow}>
                                <Ionicons name="star-outline" size={20} color="#F97316" style={styles.infoIcon} />
                                <View>
                                    <Text style={styles.infoLabel}>Current Plan</Text>
                                    <Text style={styles.infoValue}>{user?.subscription?.plan?.name}</Text>
                                </View>
                            </View> */}

                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={20} color="#F97316" style={styles.infoIcon} />
                                <View>
                                    <Text style={styles.infoLabel}>Plan Duration</Text>
                                    <Text style={styles.infoValue}>{moment(user?.subscription?.startDate).format("ll")} - {moment(user?.subscription?.expiresAt).format("ll")}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={20} color="#F97316" style={styles.infoIcon} />
                                <View>
                                    <Text style={styles.infoLabel}>Days Remaining</Text>
                                    <Text style={styles.infoValue}>{user?.subscription?.daysRemaining} Days</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            }
        </SafeAreaView>
    );
};

export default DashboardCards;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 30
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        padding: 5,
        height: 40,
        width: 40,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        marginLeft: 12,

    },
    cardTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginVertical: 8,
        fontFamily: "interRegular"
    },
    bigNumber: {
        fontSize: s(25),
        fontWeight: 'bold',
        color: '#111827',
        fontFamily: "interBold",
        marginBottom: 5
    },
    subText: {
        fontSize: s(11),
        color: '#6B7280',
        fontFamily: "inter"
    },
    bold: {
        fontWeight: 'semibold',
        color: '#111827',
    },
    activeTitle: {
        fontSize: 16,
        fontFamily: 'interSemiBold',
        color: '#111827',
        marginBottom: 10,
        marginTop: 2
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 8,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingVertical: 10
    },
    infoIcon: {
        marginRight: 8,
    },
    infoLabel: {
        fontSize: s(12),
        color: '#6B7280',
        marginBottom: 5
    },
    infoValue: {
        fontSize: s(13),
        color: '#111827',
        fontWeight: '500',
    },
});
