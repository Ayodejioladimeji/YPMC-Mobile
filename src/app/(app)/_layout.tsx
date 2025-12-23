import { Slot } from "expo-router";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { useContext, useEffect, useRef } from "react";
import { OneSignal } from "react-native-onesignal";
import { ShowNotify } from "@/components/ui/Toasts";
import { ACTIONS } from "@/store/Actions";
import { DataContext } from "@/store/GlobalState";
import { SocketClient } from "@/components/socket-client";


enum NotificationType {
  SHIPPING_STARTED = 'shipping_started',
  SHIPPING_PICKED_UP = 'shipping_picked_up',
  SHIPPING_DELIVERED = 'shipping_delivered',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  RIDER_ARRIVED = 'RIDER_ARRIVED',
}

export default function AppLayout() {
  const router = useRouter()
  const { dispatch } = useContext(DataContext);
  const lastNotificationIdRef = useRef<string | null>(null);


  useEffect(() => {
    OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true);

    const handleClick = (event: any) => {
      const notification = event.notification;

      const notificationId = notification.notificationId || notification.id || Date.now().toString(); // fallback if no id
      if (notificationId === lastNotificationIdRef.current) return; 

      lastNotificationIdRef.current = notificationId; 

      const notificationData = notification.additionalData as {
        type?: NotificationType;
        shippingId?: string;
        messageId?: string;
        rider?: any;
        proposedRider?: any;
        [key: string]: any;
      };

      if (notificationData) {
        const type = notificationData.type;
        const shippingId = notificationData.shippingId;

        switch (type) {
          case NotificationType.SHIPPING_STARTED:
          case NotificationType.SHIPPING_PICKED_UP:
          case NotificationType.SHIPPING_DELIVERED:
          case NotificationType.RIDER_ARRIVED:

            const location = {
              pickupLatitude: notificationData?.pickupLatitude,
              dropoffLatitude: notificationData?.dropoffLatitude,
              pickupLongitude: notificationData?.pickupLongitude,
              dropoffLongitude: notificationData?.dropoffLongitude
            }
            dispatch({ type: ACTIONS.LOCATION, payload: location })
            router.replace(`/(app)/(tabs)/track/${shippingId}`);
            break;

          case NotificationType.CHAT_MESSAGE:
            dispatch({
              type: ACTIONS.RIDER_DETAIL,
              payload: notificationData?.rider || notificationData?.proposedRider,
            });

            if (shippingId) {
              router.replace(`/track/chat/${shippingId}`);
            } else {
              router.replace("/home");
            }
            break;

          default:
            router.replace("/home");
            break;
        }
      }
    };


    const handleForeground = (event: any) => {
      dispatch({ type: ACTIONS.MESSAGE, payload: event?.notification });

      console.log(event?.notification?.additionalData)

      if (event?.notification?.additionalData?.tag === "rider_accepted") {
        dispatch({ type: ACTIONS.ACCEPTED, payload: true });
      }

      if (event?.notification?.title === "Rider Assignment Timed Out" || event?.notification?.title?.includes("Rejected")) {
        dispatch({ type: ACTIONS.REJECTED, payload: true });
      }

      dispatch({ type: ACTIONS.REPLY, payload: true });

      if (Platform.OS === "android") {
        ShowNotify(
          'toast',
          event?.notification?.title,
          event?.notification?.body,
        );
      }

      setTimeout(() => {
        dispatch({ type: ACTIONS.REJECTED, payload: false });
        dispatch({ type: ACTIONS.ACCEPTED, payload: false });
      }, 3000);

      event.getNotification().display();
    };

    // Add listeners
    OneSignal.Notifications.addEventListener('click', handleClick);
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', handleForeground);

    // Cleanup listeners
    return () => {
      OneSignal.Notifications.removeEventListener('click', handleClick);
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', handleForeground);
    };
  }, []);

  return (
    <>
      <SocketClient />
      <Slot />
    </>
  )
}
