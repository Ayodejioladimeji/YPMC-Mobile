import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ShippingOrder } from "@/api/shipping";
import { formatMoney } from "@/utils/utils";
import { s } from "react-native-size-matters";
import ShipmentIcon from "../shipment-icon";
import StatusComponent from "../status";
import moment from "moment";
import { colors } from "@/theme";
import { toast } from "sonner-native";
import * as Clipboard from "expo-clipboard";
import { useContext } from "react";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";

const shipmentColorStatusMap = {
  SUCCESS: "#4FB948",
  PENDING: "#1E83C5",
};

export default function ShipmentHistory({
  shipment,
}: any) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const HORIZONTAL_PADDING = 20;
  const AVAILABLE_WIDTH = width - HORIZONTAL_PADDING * 2;
  const COLUMN_GAP = 10;
  const boxWidth = (AVAILABLE_WIDTH - COLUMN_GAP) / 2;
  const { shipping, type } = shipment
  const { dispatch } = useContext(DataContext)

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(shipment?.trackingId);
      toast.success("Tracking ID copied to clipboard.");
    } catch (error) {
      Alert.alert("Error", "Unable to copy the Tracking ID.");

    }
  };



  const handleRoute = () => {

    // get the location coordinates
    const location = {
      pickupLatitude: shipping?.pickupLatitude,
      dropoffLatitude: shipping?.dropoffLatitude,
      pickupLongitude: shipping?.pickupLongitude,
      dropoffLongitude: shipping?.dropoffLongitude
    }

    if (type === "individual") {
      router.push(`/(app)/(tabs)/track/${shipping.id}`)
      dispatch({ type: ACTIONS.LOCATION, payload: location })
    }
    else {
      router.push(`/(app)/(tabs)/track/completed/${shipping.id}`)
    }
  }

  // 

  return (
    <Pressable
      style={{
        width: '100%',
        backgroundColor: '#F3F3F380',
        marginBottom: 20,
        borderRadius: 20,
        paddingVertical: 20,
        paddingTop: type === "multi" ? 40 : 20,
        paddingHorizontal: 10,
        overflow: 'hidden'
      }}

      onPress={handleRoute}
    >
      {type === "multi" && <View
        style={{
          backgroundColor: '#4FB948', padding: 5, width: 90, position: 'absolute', top: 0, right: 0, borderBottomLeftRadius: 10
        }}>
        <Text style={{ color: 'white', fontFamily: 'interSemiBold', textAlign: 'center', fontSize: s(10) }}>Multiple (+{shipping?.shippings?.length})</Text>
      </View>}

      <View style={{ flexDirection: 'row', columnGap: 10 }}>
        <ShipmentIcon status={type === "individual" ? shipping?.status : shipping?.shippings[0].status} />

        <View style={{ flex: 1 }}>
          {/* Title and Tracking ID */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: 'interMedium',
                fontSize: s(13),
                textTransform: 'capitalize',
                flex: 1,
                marginRight: 10,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {type === "individual" ? shipping?.packageDetails?.name : shipping?.shippings[0].packageDetails?.name}
            </Text>


            <TouchableOpacity activeOpacity={0.7} style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
              onPress={handleCopy}
            >
              <Text
                style={{
                  fontFamily: 'interMedium',
                  fontSize: s(11),
                  flexShrink: 1,
                }}
              >
                {type === "individual" ? shipping?.trackingId : shipping?.shippings[0].trackingId}
              </Text>
              <MaterialIcons name="content-copy" size={14} color="black" style={{ marginLeft: 0 }} />
            </TouchableOpacity>
          </View>

          {/* Status Section */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginTop: 4,
            }}
          >
            <FontAwesome5 name="check" size={10} color="#636363" />
            <StatusComponent status={type === "individual" ? shipping?.status : shipping?.shippings[0].status} />
          </View>

          {/* Footer Section */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <Text
              style={{
                flex: 1,
                color: colors.mutedForeground,
                fontSize: s(10),
              }}
            >
              {moment(type === "individual" ? shipping?.createdAt : shipping?.shippings[0].createdAt).format('LT')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/(app)/(tabs)/track/${type === "individual" ? shipping?.id : shipping?.shippings[0].id}`)}
            >
              <Text
                style={{
                  fontSize: s(12),
                  color: '#F97216',
                  flexShrink: 1,
                }}
              >
                View details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>

  );
}

