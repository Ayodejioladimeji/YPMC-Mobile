import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { s, vs, ms } from 'react-native-size-matters';
import { Image } from 'expo-image';
import images from '@/assets/images';
import { useRouter } from 'expo-router';


const OngoingShipmentBanner = () => {
    const router = useRouter()
    return (
        <TouchableOpacity onPress={() => router.push("/(app)/(tabs)/home/pending-payments")} style={styles.cardContainer}>
            <View style={styles.leftContent}>
                <Image source={images.ongoingOrder} alt="" style={{height:60, width:60}}/>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Pending payment</Text>
                    <Text style={styles.description}>Shipment ongoing, don't forget to pay.</Text>
                </View>
            </View>
            <View style={styles.rightContent}>
                <Text style={styles.amount}>₦4000</Text>
                <AntDesign name="right" size={ms(16)} color="#000" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F68C1E1A',
        borderRadius: ms(12),
        padding: vs(10),
        marginVertical:20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: ms(2) },
        shadowOpacity: 0.05,
        shadowRadius: ms(4),
        elevation: 2,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        gap:10
    },
   
    card: {
        width: ms(28),
        height: ms(20),
        backgroundColor: '#4FC3F7',
        borderRadius: ms(4),
        borderBottomRightRadius: ms(8),
        borderTopLeftRadius: ms(2),
    },
    textContainer: {
        flexShrink: 1,
    },
    title: {
        fontSize: ms(15),
        fontWeight: '600',
        color: '#171717',
        fontFamily: 'interMedium',
        marginBottom:5
    },
    description: {
        fontSize: ms(12),
        color: '#636363',
        marginTop: vs(2),
        fontFamily: 'interRegular',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: s(10),
    },
    amount: {
        fontSize: ms(16),
        fontWeight: '600',
        color: '#171717',
        marginRight: s(8),
        fontFamily: 'System',
    },
});

export default OngoingShipmentBanner