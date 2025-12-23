import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { OneTapIcon, ScheduleCalendarIcon, SelectionCalendarIcon } from '@/assets/images/svgs';
import TopNavigation from '@/components/TopNavigation';
import { Image } from 'expo-image';
import { Feather } from "@expo/vector-icons";
import { colors } from '@/theme';
import { s } from 'react-native-size-matters';


const NoRiderAvailable = () => {
    const router = useRouter()

    const findRider = () => {

    }

    // 

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TopNavigation title="" />

            <View style={styles.container}>
                <Image source={require("@/assets/images/rider-not-available.svg")} alt="" style={{ height: 150, width: '70%', marginHorizontal:'auto' }} />

                <Text style={styles.modalTitle}>No Rider Available</Text>
                <Text style={styles.modalDescription}>
                    Our riders are unavailable at this time.
                </Text>
                <Text style={styles.modalDescription}>
                    You can easily schedule pickup for later and we’ll take it from there.
                </Text>

                <View style={{ marginTop: 30 }}>
                    <TouchableOpacity onPress={() => router.push("/(app)/(tabs)/ship/schedule-selection")} activeOpacity={0.7} style={styles.button}>
                        <Text style={styles.buttonText}>Schedule Now</Text>
                        <SelectionCalendarIcon/>
                    </TouchableOpacity>

                    <View style={styles.banner}>
                        <Feather name="info" size={24} color={colors.primary} />
                        <Text style={{ color: "rgba(99, 99, 99, 1)", fontSize: s(12), flex: 1, fontFamily: 'interMedium' }}>
                            Schedule your pickup for later and get 20% off your shipping fare.
                        </Text>
                    </View>
                </View>
            </View>

        </SafeAreaView>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        // alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalTitle: {
        fontSize: s(16),
        fontFamily: "interSemiBold",
        textAlign: "center",
        marginTop: 30
    },
    modalDescription: {
        marginTop: 20,
        color: "#636363",
        fontSize: s(13),
        fontFamily: "interRegular",
        textAlign: "center",
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#F36F21',
        paddingVertical: 3,
        paddingHorizontal: 45,
        borderRadius: 30,
        gap: 5,
        alignItems: 'center',
        justifyContent:'center',
        marginBottom: 20
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
       
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

export default NoRiderAvailable;
