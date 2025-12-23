import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ShippingOrder } from "@/api/shipping";
import { formatMoney } from "@/utils/utils";
import { s } from "react-native-size-matters";
import ShipmentIcon from "../shipment-icon";
import StatusComponent from "../status";
import moment from "moment";
import { colors } from "@/theme";
import { toast } from "sonner-native";
import { CalendarIcon } from "@/assets/images/svgs";
import { ACTIONS } from "@/store/Actions";
import { useContext } from "react";
import { DataContext } from "@/store/GlobalState";

const shipmentColorStatusMap = {
  SUCCESS: "#4FB948",
  PENDING: "#1E83C5",
};

export default function ScheduledShipmentItem({
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
      router.push(`/(app)/(tabs)/track/scheduled/${shipping.id}`)
    }
  }


  // 

  return (
    <TouchableOpacity activeOpacity={0.7}
      style={{
        paddingVertical: 22,
        paddingHorizontal: 10,
        backgroundColor: "#F3F3F380",
        borderWidth: 1,
        borderColor: "#6363631A",
        borderRadius: 20,
        gap: 30,
        width: boxWidth,
        overflow: 'hidden'
      }}
      onPress={handleRoute}
    >

      {type === "multi" && <View
        style={{
          backgroundColor: "#1E83C5", padding: 5, width: 90, position: 'absolute', top: 0, right: 0, borderBottomLeftRadius: 10
        }}>
        <Text style={{ color: 'white', fontFamily: 'interSemiBold', textAlign: 'center', fontSize: s(10) }}>Multiple (+{shipping?.shippings?.length})</Text>
      </View>}

      <View>
        <ShipmentIcon status={type === "individual" ? shipping?.status : shipping?.shippings[0].status} type={type === "individual" ? shipping?.scheduleType : shipping?.shippings[0].scheduleType} />

        <Text style={{ fontFamily: "interMedium", fontSize: s(14), marginTop: 8 }}
          numberOfLines={1}
          ellipsizeMode="tail">
          {type === "individual" ? shipping?.packageDetails?.name : shipping?.shippings[0].packageDetails?.name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 8,
            marginBottom: 10
          }}
        >

          <CalendarIcon />
          <Text>{moment(type === "individual" ? shipping?.scheduledPickupTime : shipping?.shippings[0].scheduledPickupTime).format('ll')}</Text>

        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: s(10) }}>{moment(type === "individual" ? shipping?.createdAt : shipping?.shippings[0].createdAt).format("LT")}</Text>
      </View>

      <View style={{ gap: 4 }}>
        {/* <TouchableOpacity
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={handleCopy}
        >
          <Text style={{ fontFamily: "interMedium", fontSize: s(10), marginRight: 8 }}>
            {shipment?.trackingId}
          </Text>
          <MaterialIcons name="content-copy" size={14} color="black" />
        </TouchableOpacity> */}



        <TouchableOpacity
          onPress={handleRoute}
        >
          <Text style={{ fontSize: s(12), color: "#F97216" }}>View details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity >
  );
}

