import {StyleSheet} from 'react-native';
import React from 'react';
import {Marker} from 'react-native-maps';
import { BoxMarkerIcon, RiderIcon } from '@/assets/images/svgs';

interface PProps {
  coordinate: any;
}

export default function RiderMarker({coordinate}: PProps) {
  //
  return (
    <Marker coordinate={coordinate} style={{ transform: [{ rotate: `120deg` }] }} title="Rider Location"
      description="Current location of the Rier">
      <RiderIcon/>
    </Marker>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 35,
    height: 35,
    backgroundColor: '#FFC619',
    borderRadius: 1000,
    // Additional styles for your custom icon
  },
  iconbig: {
    width: 30,
    height: 30,
    backgroundColor: '#FFF9E6',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
