import React from 'react';
import {Dimensions, StyleSheet, Text, View, Platform} from 'react-native';
import Toast from 'react-native-toast-message';
import {s} from 'react-native-size-matters';
const {width} = Dimensions.get('window');
import AntDesign from '@expo/vector-icons/AntDesign';

export const ShowNotify = (type, text1:string, text2:string) => {
  if (text1 !== '' && text2 !== '') {
    Toast.show({
      type: type,
      props: {
        text1,
        text2,
        type,
      },
      autoHide: true,
      topOffset: Platform.OS === 'ios' ? 50 : 0,
    });
  }
};

type Props = {
  margin?: boolean;
};

export const Toasts = ({margin}: Props) => {
  const toastConfig: any = {
    toast: ({props}) => {
      return (
        <View>
          <View style={styles.toastSuccess}>
            <AntDesign name="checkcircleo" size={14}
              color="green"
              style={{ marginTop: 5 }} />
            <View>
              <Text style={styles.toastHeading}>{props.text1}</Text>
              <Text style={styles.toastBody}>{props.text2}</Text>
            </View>
          </View>
        </View>
      );
    },
  };

  return (
    <View style={{zIndex: 90}}>
      <Toast config={toastConfig} position="top" />
    </View>
  );
};

const styles = StyleSheet.create({
  toastSuccess: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    borderLeftColor: 'green',
    borderLeftWidth: 5,
    borderRadius: 5,
    flexDirection: 'row',
    gap: 10,
    color: '#000',
    borderWidth: 0.6,
    borderColor: 'green',
  },
  toastHeading: {
    fontWeight: '600',
    fontSize: s(14),
    color: '#000',
  },
  toastBody: {
    fontSize: s(12),
    width: width * 0.8,
    lineHeight: 20,
    color: '#000',
  },
});
