import React from "react";

import ProfileSettings from "./profile";
import TopNavigation from "@/components/TopNavigation";
import { SafeAreaView } from "react-native";

const Account = () => {

  // 

  return (
    <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
    <TopNavigation title="My Profile" arrow={false}/>
    <ProfileSettings />
    </SafeAreaView>
  );
};


export default Account;
