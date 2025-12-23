import React, { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { s } from "react-native-size-matters";
import { getVisitedAddresses } from "@/utils/helper";
import { colors } from "@/theme";



const RecentLocations = ({ setLocation, googlePlacesRef }:any) => {

    const [recentLocations, setRecentLocations] = useState<any>([])

    useEffect(() => {
       const getLocations = async() => {
           const locations = await getVisitedAddresses()
           setRecentLocations(locations)
       }
       getLocations()
    },[])

    const handleSelectLocation = (item: any) => {
        setLocation(item);

        // Populate GooglePlacesAutocomplete input
        if (googlePlacesRef?.current) {
            googlePlacesRef.current.setAddressText(`${item.street}, ${item.area}, ${item.state}`);
        }
    };
    // 

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Recent Locations</Text>
            <FlatList
                data={recentLocations}
                keyExtractor={(item) => item?.street}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelectLocation(item)} activeOpacity={0.7} style={styles.itemContainer}>
                        <Ionicons name="location-sharp" size={20} color="#FF6F00"/>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item?.street} {item?.area} {item?.state}</Text>
                            <Text style={styles.subtitle}>{item?.street} {item?.area} {item?.state}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            ListFooterComponent={
                <View style={{paddingBottom:150}}/>
            }
            showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        height:550
    },
    header: {
        fontSize: 16,
        fontWeight: "400",
        marginBottom: 25,
        color:colors.foreground
    },
    itemContainer: {
        flexDirection: "row",
        marginBottom: 16,
        gap:5,
        borderBottomWidth:0.4,
        paddingBottom:10,
        borderColor:colors.mutedForeground
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: s(13),
        fontWeight: "400",
        color: "#000",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
});

export default RecentLocations;
