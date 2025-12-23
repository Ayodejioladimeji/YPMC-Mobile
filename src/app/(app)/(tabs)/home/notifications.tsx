import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";

import { Image } from "expo-image";

import Text from "@/components/ui/text";
import SafeAreaViews from "@/components/safe-area-view";
import TopNavigation from "@/components/TopNavigation";
import { GetRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { colors } from "@/theme";
import NotificationComponent from "@/components/home/notification";

interface NotificationsProps {
  id: string,
  createdAt: string,
  message: string,
  isRead: boolean,
  title: string,
  type: string,
}

const Notifications = () => {
  const { state } = useContext(DataContext)
  const { notifications } = state


  // 

  return (
    <SafeAreaViews>
      <TopNavigation title="Notifications" />

      {notifications?.length === 0 ? <View
        style={{
          backgroundColor: "#FFF",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={require("@/assets/images/notifications.png")}
          style={{
            width: 184,
            height: 184,
          }}
          contentFit="contain"
        />
        <Text style={{ color: "#636363", fontSize: 16 }}>
          No notifications at the moment
        </Text>
      </View>

        :

        <NotificationComponent notifications={notifications} />

      }

    </SafeAreaViews>
  );
};

export default Notifications;
