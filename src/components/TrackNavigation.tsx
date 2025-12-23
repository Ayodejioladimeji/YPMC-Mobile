import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { s } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
  title: string;
  item?: any;
  ellipsis?: boolean;
  arrow?: boolean;
}

const TrackNavigation = (props: Props) => {
  const router = useRouter();

  const handleRoute = () => {
    router.back()
  }

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
            borderWidth: 0.2,
            opacity: 0
          }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

      </Pressable>
      
      <Text style={{ fontSize: s(16) }}>{props?.title}</Text>

      <TouchableOpacity style={{
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 50,
        borderWidth: 0.2,
        opacity: 0
      }}>
        <Ionicons name="arrow-back" size={24} color="black" />
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

export default TrackNavigation;
