import React, { useContext } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { s } from 'react-native-size-matters';
import { ACTIONS } from '@/store/Actions';
import { DataContext } from '@/store/GlobalState';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useRouter } from 'expo-router';

interface Props {
  onPress: () => void
  isCarouselView: boolean,
  riders:any
}

const RiderNavigation = (props: Props) => {
   const router = useRouter();
   const {state, dispatch} = useContext(DataContext)

   const handleRoute = () => {
    if(state?.pendingId){
      router.push(`/(app)/(tabs)/track/pending/${state?.pendingId}`)
    }
    else{
      router.back()
    }

     setTimeout(() => {
       dispatch({ type: ACTIONS.PENDING_ID, payload: null })
     }, 1000)
   }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleRoute}
        style={styles.left}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>

        <Text style={{ fontSize: s(16) }}>Find a Rider</Text>

      {props?.riders?.length !==0 ? <TouchableOpacity
        style={{
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderRadius: 50,
          backgroundColor: "rgba(249, 114, 22, 0.1)",
        }}
        onPress={props?.onPress}
      >
        <Ionicons
          name={props?.isCarouselView ? "list-outline" : "grid-outline"}
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>
    :
    
    <View></View>
    }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 10,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
  },
  left: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  right: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
});

export default RiderNavigation;
