import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { s } from 'react-native-size-matters';
import { colors } from '@/theme';
import { GetRequest } from '@/utils/requests';
import { DataContext } from '@/store/GlobalState';

interface TimelineData {
    id: string;
    status: string;
    description: string;
    time: string;
    date: string;
    completed: boolean;
}

const timelineData: TimelineData[] = [
    { id: '1', status: "Awaiting rider's response", description: 'Waiting for rider to confirm your order.', time: '01:33pm', date: 'Sat, 17th Aug 2024', completed: true },
    { id: '2', status: 'Rider Responded', description: 'Rider confirmed pickup', time: '01:39pm', date: 'Sat, 17th Aug 2024', completed: true },
    { id: '3', status: 'In Transit', description: 'Package is on the move', time: '01:39pm', date: 'Sat, 17th Aug 2024', completed: true },
    { id: '4', status: 'Package Delivered', description: 'Delivered to recipient', time: '02:33pm', date: 'Sat, 17th Aug 2024', completed: true },
];

interface TimelineItemProps {
    item: TimelineData;
    isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, isLast }) => {
    return (
        <View style={styles.timelineItem}>
            <View style={styles.timeline}>
                <View style={[styles.circle, item.completed && styles.circleCompleted]}>
                    <FontAwesome name="check" size={12} color="#fff" />
                </View>
                {!isLast && <View style={styles.verticalLine} />}
            </View>

            <View style={styles.content}>
                <View>
                    <Text style={styles.status}>{item.status}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <Text></Text>
                </View>
                
                <View>
                    <Text style={styles.time}>{item.time}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
            </View>
        </View>
    );
};

const App: React.FC = () => {
    const [timelines, setTimelines] = useState<any>([])
    const {state} = useContext(DataContext)

    // fetch timeline
    useEffect(() => {
       if(state?.token){
           const getTimeline = async () => {
               const res = await GetRequest("", state?.token)
               if(res?.status === 200 || res?.status === 201){
                setTimelines(res?.data?.data)
               }
           }
           getTimeline()
       }
    }, [])

    // 

    return (
        <View style={styles.container}>
            <Text style={styles.etaText}>Estimated Time of Arrival</Text>
            <Text style={styles.eta}>60 mins</Text>

            <View style={{height:2, backgroundColor:colors.muted, marginVertical:30}}/>

            <ScrollView contentContainerStyle={{ paddingBottom: s(16) }}>
                {timelineData.map((item, index) => (
                    <TimelineItem key={item.id} item={item} isLast={index === timelineData.length - 1} />
                ))}
            </ScrollView>
        </View>
    );
};

export default App;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        backgroundColor: '#fff',
        flex: 1,
    },
    etaText: {
        fontSize: s(12),
        color: '#333',
        marginBottom: s(4),
    },
    eta: {
        fontSize: s(18),
        fontWeight: 'bold',
        color: '#333'
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timeline: {
        alignItems: 'center',
        marginRight: s(12),
    },
    circle: {
        height: s(18),
        width: s(18),
        borderRadius: s(9),
        backgroundColor: '#FF7F27',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleCompleted: {
        backgroundColor: '#FF7F27',
    },
    verticalLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#FF7F27',
    },
    content: {
        flex: 1,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    status: {
        fontSize: s(12),
        color: colors.primary,
        marginBottom: s(4),
    },
    description: {
        fontSize: s(11),
        color: '#333',
        marginBottom: s(8),
        width:200,
    },
    time: {
        fontSize: s(11),
        color: '#007AFF',
        alignSelf:'flex-end',
        marginBottom:5
    },
    date: {
        fontSize: s(10),
        color: '#8E8E93',
        alignSelf:'flex-end'
    },
});
