import React, { useContext } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { s } from 'react-native-size-matters';
import moment from 'moment';
import { DataContext } from '@/store/GlobalState';
import { ACTIONS } from '@/store/Actions';
import { getStatusColor } from '@/utils/helper';
import { PatchRequest } from '@/utils/requests';
import { useRouter } from 'expo-router';

interface NotificationsProps {
    id: string,
    createdAt: string,
    message: string,
    isRead: boolean,
    title: string,
    type: string,
}

interface NotificationProps {
    notifications: NotificationsProps[]
}

interface GroupedNotifications {
    [key: string]: NotificationsProps[];
}

const NotificationComponent = ({ notifications }: NotificationProps) => {
    const [refreshing, setRefreshing] = React.useState(false);
    const {state, dispatch} = useContext(DataContext)
    const router = useRouter()

    const groupedNotifications = notifications?.reduce((acc, notification) => {
        const date = moment(notification.createdAt).format("ll")

        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(notification);
        return acc;
    }, {} as GroupedNotifications);

    const renderNotificationItem = ({ item }: { item: NotificationsProps }) => {
      
        return(
            <TouchableOpacity onPress={() => handleView(item)} style={styles.notificationItem}>
                <View style={styles.iconBox}>
                    <FontAwesome5
                        name="bell"
                        size={18}
                        style={[styles.icon, { color: getStatusColor(item.type) }]}
                    />
                </View>
                <Text style={styles.messageText}>{item.message}</Text>
            </TouchableOpacity>
        )
    }
        
    

    const onRefresh = React.useCallback(() => {
        dispatch({type:ACTIONS.CALLBACK, payload:!state?.callback})
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, [refreshing]);

    // navigate chat messages
    const navigateChat = () => {
       
    }

    const handleView = async(item:any) => {
        // if(item.type === "CHAT_MESSAGE"){
        //     router.push(`/track/chat/${item?.metadata?.messageId}`)
        // }
        const res = await PatchRequest(`/notifications/${item?.id}/read`, {}, state?.token)
        if(res?.status === 200 || res?.status === 201){
            dispatch({type:ACTIONS.NOTIFICATION_CALLBACK, payload: !state?.notificationCallback})
        }
    }

    // 

    return (
        <FlatList
            data={Object.entries(groupedNotifications)}
            keyExtractor={([date]) => date}
            renderItem={({ item: [date, items] }) => (
                <View style={styles.dateGroup}>
                    <Text style={styles.dateText}>{date}</Text>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={renderNotificationItem}
                    />
                </View>
            )}
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        />
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    dateGroup: {
        marginBottom: 24,
    },
    dateText: {
        fontSize: s(12),
        color: colors.mutedForeground,
        marginBottom: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems:'center'

    },
    iconBox: {
        backgroundColor: '#1E83C51A',
        height: 32,
        width: 32,
        borderRadius: 50,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        color: '#1E83C5'
    },
    messageText: {
        fontSize: s(12),
        flex: 1,
        lineHeight: 22
    },
});

export default NotificationComponent;
