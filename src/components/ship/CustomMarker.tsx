import {StyleSheet} from 'react-native';
import React from 'react';
import {Marker} from 'react-native-maps';
import { MapMarkerIcon } from '@/assets/images/svgs';

interface PProps {
  coordinate: any;
}

export default function CustomMarker({coordinate}: PProps) {
  //
  return (
    <Marker coordinate={coordinate} title="Delivery Location"
      description="The location to deliver the order">
      <MapMarkerIcon/>
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
