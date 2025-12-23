import { Redirect } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { DataContext } from "@/store/GlobalState";
import { retrieveData, retrieveToken } from "@/utils/helper";
import { ActivityIndicator, View } from "react-native";
import { ACTIONS } from "@/store/Actions";

export default function Index() {
  const { dispatch } = useContext(DataContext);
  const [firstTime, setFirstTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const firsttime = await retrieveData("firstTime");
        const token = await retrieveToken("token");

        dispatch({ type: ACTIONS.TOKEN, payload: token });

        setFirstTime(firsttime);
        setToken(token);
      } catch (err) {
        // console.log("Error retrieving data", err);
      } finally {
        setLoading(false);
        setCheckedStorage(true); 
      }
    })();
  }, []);

  if (loading || !checkedStorage) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="black" size="large" />
      </View>
    );
  }


  if (token) {
    // Token exists, even if network is bad, stay inside app
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  if (!token && !firstTime) {
    // First time user (onboarding)
    return <Redirect href="/onboarding" />;
  }

  if (!loading && !token) {
    // Not first time, but no token: user logged out manually
    return <Redirect href="/(auth)/sign-in" />;
  }

  return null;
}
