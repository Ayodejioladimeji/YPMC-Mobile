import React from 'react'
import { Button } from './ui/button'
import { Linking, View } from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { handleDial } from './ship/dialNumber';

interface Props{
    phoneNumber?:string
    id?:string
}


const CallAndChat = ({phoneNumber, id}:Props) => {
    const router = useRouter()

     
        // 

    return(
        <View style={{ flexDirection: "row", gap: 8 }}>
            <Button variant="outline" size="icon" onPress={() => handleDial(phoneNumber)}>
                <Ionicons
                    name="call-outline"
                    size={24}
                    style={{ color: "#F97216" }}
                />
            </Button>

            <Button
                variant="outline"
                size="icon"
                onPress={() => router.push(`/track/chat/${id}`)}
            >
                <Ionicons
                    name="chatbox-outline"
                    size={24}
                    style={{ color: "#F97216" }}
                />
            </Button>
        </View>
    )
}

export default CallAndChat