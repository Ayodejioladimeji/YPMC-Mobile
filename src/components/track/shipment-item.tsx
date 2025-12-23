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
import { ACTIONS } from "@/store/Actions";
import { useContext } from "react";
import { DataContext } from "@/store/GlobalState";

const shipmentColorStatusMap = {
  SUCCESS: "#4FB948",
  PENDING: "#1E83C5",
};

export default function ShipmentItem({
  shipment,
}: any) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const HORIZONTAL_PADDING = 20;
  const AVAILABLE_WIDTH = width - HORIZONTAL_PADDING * 2;
  const COLUMN_GAP = 10;
  const boxWidth = (AVAILABLE_WIDTH - COLUMN_GAP) / 2;
  const {shipping, type} = shipment
  const {dispatch} = useContext(DataContext)
 


  // handle route
  const handleRoute = () => {

    // get the location coordinates
    const location = {
      pickupLatitude:shipping?.pickupLatitude,
      dropoffLatitude : shipping?.dropoffLatitude,
      pickupLongitude: shipping?.pickupLongitude,
      dropoffLongitude: shipping?.dropoffLongitude
    }

    if(type === "individual"){
      router.push(`/(app)/(tabs)/track/${shipping.id}`)
      dispatch({type:ACTIONS.LOCATION, payload: location})
    }
    else{
      router.push(`/(app)/(tabs)/track/active/${shipping.id}`)
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
        overflow:'hidden'
      }}
      onPress={handleRoute}
    >
      {type === "multi" && <View
        style={{
          backgroundColor:"#1E83C5", padding: 5, paddingHorizontal:8, position: 'absolute', top: 0, right: 0, borderBottomLeftRadius: 10
        }}>
        <Text style={{ color: 'white', fontFamily: 'interSemiBold', textAlign: 'center', fontSize:s(10) }}>Multiple (+{shipping?.shippings?.length})</Text>
      </View>}

      <View>
        <ShipmentIcon status={type === "individual" ? shipping?.status : shipping?.shippings[0].status} />

        {type === "individual" ? 
        <Text style={{ fontFamily: "interMedium", fontSize: s(14), marginTop: 8 }}
          numberOfLines={1}
          ellipsizeMode="tail" >
          {shipping.packageDetails.name}
        </Text>
        :
        <Text style={{ fontFamily: "interMedium", fontSize: s(14), marginTop: 8 }}
          numberOfLines={1}
          ellipsizeMode="tail" >
          {shipping?.shippings[0].packageDetails.name}
        </Text>
}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
            marginBottom: 5
          }}
        >
          <Ionicons name="bicycle-outline" size={16} color="#636363" />
          <StatusComponent status={type === "individual" ? shipping?.status : shipping?.shippings[0]?.status} />

        </View>

        <Text style={{ color: colors.mutedForeground, fontSize: s(10) }}>{moment(type === "individual" ? shipping?.createdAt : shipping?.shippings[0]?.createdAt).format("lll")}</Text>
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

