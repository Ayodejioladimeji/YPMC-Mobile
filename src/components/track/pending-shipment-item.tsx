import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { s } from "react-native-size-matters";
import ShipmentIcon from "../shipment-icon";
import StatusComponent from "../status";
import moment from "moment";
import { colors } from "@/theme";
import { useContext } from "react";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";



export default function PendingShipmentItem({shipment}:any) {
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
    dispatch({type:ACTIONS.SHIPPING_TYPE, payload:type === "individual" ? "basic" : "multi"})
    router.push(`/(app)/(tabs)/track/pending/${shipping.id}`)
    dispatch({type:ACTIONS.DELIVERY_MODE, payload: false})
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
          backgroundColor: colors.primary, padding: 5, paddingHorizontal:8, position: 'absolute', top: 0, right: 0, borderBottomLeftRadius: 10
        }}>
        <Text style={{ color: 'white', fontFamily: 'interSemiBold', textAlign: 'center', fontSize: s(10) }}>Multiple (+{shipping?.shippings?.length})</Text>
      </View>}

      <View>
        <ShipmentIcon status={type === "individual" ? shipping?.status : shipping?.shippings[0].status} type={type === "individual" ? shipping?.scheduleType : shipping?.shippings[0].scheduleType} />

        <Text style={{ fontFamily: "interMedium", fontSize: s(14), marginTop: 8 }}
          numberOfLines={1}
          ellipsizeMode="tail" >
          {type === "individual" ? shipping?.packageDetails?.name : shipping?.shippings[0].packageDetails?.name}
        </Text>

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
          <StatusComponent status={type === "individual" ? shipping?.status : shipping?.shippings[0].status} />

        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: s(10) }}>{moment(type === "individual" ? shipping?.createdAt : shipping?.shippings[0].createdAt).format("LT")}</Text>
      </View>

      <View style={{ gap: 4 }}>
        <TouchableOpacity
          onPress={handleRoute}
        >
          <Text style={{ fontSize: s(12), color: "#F97216" }}>View details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity >
  );
}

