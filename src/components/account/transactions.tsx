import images from "@/assets/images";
import { colors } from "@/theme";
import { formatMoney } from "@/utils/utils";
import moment from "moment";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    Image,
    ActivityIndicator,
} from "react-native";
import { s } from "react-native-size-matters";
import TransactionStatus from "../transactionStatus";
import TransactionIcon from "../transactions-icon";
import FilterComponent from "../filter";




export default function Transactions({ data, isLoading, fetchMoreData, setLoading, setStatus, status }: any) {


    const renderTransaction = ({ item }:any) => {
    
        return (

            <View style={styles.transactionContainer}>
                <View style={styles.leftContainer}>
                    <TransactionIcon status={item?.status} type={item?.paymentMethod}/>
                    
                    <View>
                        <Text style={styles.category}>{item?.transactionCategory === "SHIPPING_PAYMENT" ? item.shipping?.packageDetails?.name : "Wallet Topup"}</Text>
                        <Text style={styles.method}>{
                            item?.paymentMethod
                        }
                        </Text>
                        <Text style={styles.date}>{moment(item.createdAt).format("ll")}</Text>
                    </View>
                </View>

                <View style={styles.rightContainer}>
                    <Text style={styles.amount}>₦{formatMoney(Number(item?.amountInNaira))}</Text>
                    <TransactionStatus status={item?.status} />
                </View>
            </View>
        );
    }

 
    return (
        <View style={styles.container}>
            <FilterComponent setLoading={setLoading} setStatus={setStatus} status={status}/>
            
            <FlatList
                data={data}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                // onEndReached={fetchMoreData}
                onEndReachedThreshold={0.5}
                // ListFooterComponent={() =>
                //     isLoading ? <ActivityIndicator size="small" color="#000" /> : null
                // }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
    },
    transactionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    leftContainer: {
        flexDirection: "row",
        alignItems: "center",
        columnGap:10
    },
    category: {
        fontSize: s(12),
        fontWeight: "500",
        color: "#000",
        marginBottom: 3
    },
    method: {
        fontSize: 14,
        color: "#757575",
        textTransform:'capitalize'
    },
    date: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 4,
    },
    rightContainer: {
        alignItems: "flex-end",
    },
    amount: {
        fontSize: s(13),
        color: "#000",
        marginBottom: 5
    },
    status: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: "500",
        backgroundColor: '#4FB9481A',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        color: '#4FB948'
    },
});
