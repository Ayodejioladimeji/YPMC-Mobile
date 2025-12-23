import React from 'react';
import {
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { s } from 'react-native-size-matters';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
  title: string;
  item?: any;
  ellipsis?: boolean;
  arrow?: boolean;
  id:string
}

const DetailNavigation = (props: Props) => {
  const router = useRouter();

  const handleRoute = () => {
    router.back()
  }

  // handle share
  const handleShare = async () => {
    try {
      const url = process.env.EXPO_PUBLIC_CLIENT_URL
      const result = await Share.share({
        message: `Click the link below to track order ${url}/${props?.id}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // console.log("Shared with activity type: ", result.activityType);
        } else {
          // console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        // console.log("Share dismissed");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to share the referral code.");
    }
  };

  return (
    <View style={styles.container}>
      <Pressable

        style={styles.left}>

        <TouchableOpacity
          onPress={handleRoute}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderRadius: 50,
            borderWidth: 0.2
          }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

      </Pressable>
      <Text style={{ fontSize: s(16) }}>{props?.title}</Text>

      <TouchableOpacity style={{
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 50,
        backgroundColor: '#6363630D'
      }}

        onPress={handleShare}>
        <MaterialCommunityIcons name="share-variant" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  left: {
  }
});

export default DetailNavigation;
