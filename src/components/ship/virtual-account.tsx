import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, Alert } from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const VirtualAccount = ({ amount, bankName, accountNumber, accountName, onShare, onUseOtherPaymentMethods }) => {
    const handleCopyAccountNumber = () => {
        Clipboard.setString(accountNumber);
        Alert.alert('Copied!', 'Account number copied to clipboard.');
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.amountShareRow}>
                    <Text style={styles.amount}>₦{amount}</Text>
                    <TouchableOpacity onPress={onShare} style={styles.shareButton}>
                        <Feather name="share-2" size={ms(16)} color="#FF7A00" />
                    </TouchableOpacity>
                </View>

                <View style={styles.bankDetailsRow}>
                    <MaterialCommunityIcons name="bank" size={ms(16)} color="#636363" style={styles.bankIcon} />
                    <Text style={styles.bankName}>{bankName}</Text>
                </View>

                <View style={styles.accountNumberRow}>
                    <Text style={styles.accountNumber}>{accountNumber}</Text>
                    <TouchableOpacity onPress={handleCopyAccountNumber} style={styles.copyIcon}>
                        <MaterialCommunityIcons name="content-copy" size={ms(16)} color="#FF7A00" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.accountName}>{accountName}</Text>
            </View>

            <TouchableOpacity onPress={onUseOtherPaymentMethods} style={styles.otherPaymentButton}>
                <Text style={styles.otherPaymentButtonText}>Use Other Payment Methods</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: s(20),
    },
    card: {
        width: '100%',
        backgroundColor: '#FFF8F0',
        borderRadius: ms(12),
        paddingVertical: vs(20),
        paddingHorizontal: s(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: ms(2) },
        shadowOpacity: 0.05,
        shadowRadius: ms(4),
        elevation: 2,
        marginBottom: vs(30),
    },
    amountShareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(15),
    },
    amount: {
        fontSize: ms(24),
        fontWeight: '700',
        color: '#171717',
        fontFamily: 'System',
        textDecorationLine: 'underline',
        textDecorationColor: '#FF7A00',
        textDecorationStyle: 'solid',
    },
    shareButton: {
        width: ms(36),
        height: ms(36),
        borderRadius: ms(18),
        backgroundColor: 'rgba(255, 122, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bankDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vs(8),
    },
    bankIcon: {
        marginRight: s(8),
        color: '#636363',
    },
    bankName: {
        fontSize: ms(14),
        color: '#636363',
        fontFamily: 'System',
    },
    accountNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: vs(8),
    },
    accountNumber: {
        fontSize: ms(20),
        fontWeight: '700',
        color: '#171717',
        fontFamily: 'System',
    },
    copyIcon: {
        padding: s(5),
    },
    accountName: {
        fontSize: ms(14),
        color: '#636363',
        fontFamily: 'System',
    },
    otherPaymentButton: {
        width: '100%',
        backgroundColor: '#FF7A00',
        borderRadius: ms(12),
        paddingVertical: vs(16),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: ms(2) },
        shadowOpacity: 0.1,
        shadowRadius: ms(4),
        elevation: 3,
    },
    otherPaymentButtonText: {
        color: 'white',
        fontSize: ms(16),
        fontWeight: '700',
        fontFamily: 'System',
    },
});

export default VirtualAccount