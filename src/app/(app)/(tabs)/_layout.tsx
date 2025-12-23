import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { colors } from "@/theme";
import { Platform, Pressable } from "react-native";


enum NotificationType {
  SHIPPING_CREATED = 'shipping_created',
  SHIPPING_ASSIGNED = 'shipping_assigned',
  SHIPPING_ACCEPTED = 'shipping_accepted',
  SHIPPING_REJECTED = 'shipping_rejected',
  SHIPPING_STARTED = 'shipping_started',
  SHIPPING_PICKED_UP = 'shipping_picked_up',
  SHIPPING_DELIVERED = 'shipping_delivered',
  RIDER_LOCATION_UPDATED = 'rider_location_updated',
  PAYMENT_RECEIVED = 'payment_received',
  EARNINGS_RECEIVED = 'earnings_recieved',
  TRANSACTION_SUCCESS = 'TRANSACTION_SUCCESS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SYSTEM_UPDATE = 'system_update',
  SHIPPING_UNASSIGNED = 'SHIPPING_UNASSIGNED',
  SHIPPING_ASSIGNMENT_EXPIRED = 'SHIPPING_ASSIGNMENT_EXPIRED',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  PARTNER_RIDER_CHAT = 'PARTNER_RIDER_CHAT',
  RIDER_ARRIVED = 'RIDER_ARRIVED',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',
  KYC_REMINDER = 'KYC_REMINDER',
  PARTNER_RIDER_REGISTERED_WITH_CODE = 'partner_rider_registered_with_code',
}

export default function TabsLayout() {
  const router = useRouter();
 

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarStyle: {
            shadowColor: "transparent",
            borderTopWidth: 0.7,
            height: Platform.OS === 'ios' ? 95 : 80,
            paddingBottom: 4,
            paddingTop: 10,
            elevation: 2,
          },
          tabBarLabelStyle: {
            fontSize: 14,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons size={26} name="home-filled" color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                android_ripple={{ color: "transparent" }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ship"
          options={{
            title: "Ship",
            tabBarIcon: ({ color }) => (
              <Ionicons size={26} name="bicycle" color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                android_ripple={{ color: "transparent" }}
                onPress={() => {
                  router.replace("/ship");
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: "Track",
            tabBarIcon: ({ color }) => (
              <Ionicons size={26} name="location" color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                android_ripple={{ color: "transparent" }}
                onPress={() => {
                  router.replace("/track");
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color }) => (
              <Ionicons size={26} name="person" color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                android_ripple={{ color: "transparent" }}
                onPress={() => {
                  router.replace("/account");
                }}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}