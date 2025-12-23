import React, { useContext, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
} from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import SelectDropdown from 'react-native-select-dropdown';
import { colors } from "@/theme";
import { s } from "react-native-size-matters";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";

const status = [
    "All",
    'Pending',
    'Success'
];


const FilterComponent = ({ setLoading, setStatus, status:transactionStatus}:any) => {
    const {state, dispatch} = useContext(DataContext)

    return (
        <View style={styles.container}>

            <SelectDropdown
                data={status}
                onSelect={(selectedItem, index) => {
                    const items = selectedItem?.includes('Pending')
                        ? 'PENDING' :
                        selectedItem?.includes('Success') ? 'SUCCESS'
                        : 'ALL';

                    setStatus(items);
                    dispatch({type:ACTIONS.CALLBACK, payload:!state?.callback})
                    setLoading(true);
                }}
                renderButton={(selectedItem, isOpened) => {
                  
                    return (
                        <View style={styles.filterContainer}>
                            <MaterialIcons name="swap-vert" size={20} color="#636363" />
                            <Text style={styles.label}>Sort by:</Text>
                            <View style={styles.dropdown}>
                                <Text style={styles.dropdownText}>
                                    {transactionStatus || 'All'}
                                </Text>
                                <AntDesign name="down" size={16} color="#000" />
                            </View>
                        </View>
                    );
                }}
                renderItem={(item, index, isSelected) => {
                    return (
                        <View
                            style={{
                                ...styles.dropdownItemStyle,
                                ...(isSelected && { backgroundColor: '#D2D9DF' }),
                            }}>
                            <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                        </View>
                    );
                }}  
                
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
            />
            
        </View>
    );
};

export default FilterComponent;

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-end",
        justifyContent: "flex-end",
        marginTop: 20,
    },
    filterContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent:'center',
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 25,
        marginBottom:20,
    },
    label: {
        marginHorizontal: 8,
        fontSize: 14,
        color: "#636363",
    },
    dropdown: {
        flexDirection: "row",
        alignItems: "center",
    },
    dropdownText: {
        fontSize: 14,
        color: "#636363",
        marginRight: 5,
        textTransform:'capitalize'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#000",
    },
    option: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        width: "100%",
    },
    optionText: {
        fontSize: 14,
        textAlign: "center",
        color: "#000",
    },
    closeButton: {
        marginTop: 20,
    },
    closeText: {
        color: "#FF5722",
        fontSize: 14,
        fontWeight: "600",
    },

    dropdownButtonArrowStyle: {
        fontSize: 28,
    },
    dropdownMenuStyle: {
        borderRadius: 10,
        marginTop:10
    },
    dropdownItemStyle: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.muted,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: s(12),
        color: colors.black,
    },
});
