import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal, SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useSharedValue } from "react-native-reanimated";
import { toast } from "sonner-native";

import images from "@/assets/images";
import { EditProfileIcon } from "@/assets/images/svgs";
import UpdateProfile from "@/components/account/update-profile";
import SafeAreaViews from "@/components/safe-area-view";
import { Button, ButtonText } from "@/components/ui/button";
import CustomModal from "@/components/ui/modal";
import Text from "@/components/ui/text";
import { DataContext } from "@/store/GlobalState";
import { colors, spacing } from "@/theme";
import { GetRequest } from "@/utils/requests";
import TopNavigation from "@/components/TopNavigation";
import { ACTIONS } from "@/store/Actions";

//

export default function ProfileDetails() {
  const [user, setUser] = useState<any>(null);
  const { state, dispatch } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const riderInfoSheetRef = useRef<BottomSheetModal>(null);
  const riderInfoSheetIndex = useSharedValue<number>(0);
  const riderInfoSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [callback, setCallback] = useState(false)

  // get user profile
  useEffect(() => {
    if (state?.token) {
      const getProfile = async () => {
        const res = await GetRequest("/customer/profile", state?.token);
        if (res?.status === 200 || res?.status === 201) {
          setUser(res?.data?.data);
        }
        setLoading(false);
      };
      getProfile();
    }
  }, [state?.token, state?.callback]);

  const handleDeleteAccount = () => {
    setIsModalVisible(false);
  };

  const pickImage = async (): Promise<void> => {
    setImage(null);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
      setCallback((prev) => !prev)

    }
  };

  useEffect(() => {
    if (image) {
      handleSave()
    }
  }, [callback])

  // upload profile image
  const handleSave = async () => {

    setImageLoading(true);

    // Create FormData object for multipart/form-data
    const formData: any = new FormData();
    formData.append("file", {
      uri: image?.uri,
      type: "image/png",
      name: "profile-image.png",
    });

    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/customer/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${state?.token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();

      dispatch({ type: ACTIONS.CALLBACK, payload: !state?.callback })

      toast.success(data?.message);

    } catch (error: any) {
      // console.log(error)
      toast.error(error?.response?.data?.message);
    } finally {
      setImageLoading(false);
    }
  };

  //

  return (
    <SafeAreaViews>
      <TopNavigation title="Profile Details" />
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ textAlign: "center" }}>Loading Profile</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 }}
        >
          <View style={{ marginTop: 20 }}>
            <View
              style={{
                marginBottom: 10,
                borderWidth: 1,
                borderRadius: 50,
                height: 110,
                width: 110,
                alignSelf: "center",
                alignItems: "center",
                justifyContent: "center",
                padding: 10,
                borderColor: colors.muted,
              }}
            >
              {image ? (
                <Image
                  source={image?.uri}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 50,
                    borderWidth: 0.5,
                  }}
                />
              ) : (

                <Image
                  source={user?.metadata?.profileImageUrl || images.user}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 50,
                    borderWidth: 0.5,
                  }}
                />
              )}

              {imageLoading ? <View style={styles.profileLoading}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
                :
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{ position: "absolute", bottom: 10, right: 0 }}
                  onPress={pickImage}
                >
                  <EditProfileIcon />
                </TouchableOpacity>}

            </View>

            <Text
              style={{
                fontSize: 16,
                fontFamily: "interMedium",
                textAlign: "center",
              }}
            >
              {user?.fullName}
            </Text>
            <Text
              style={{ color: "#636363", marginTop: 5, textAlign: "center" }}
            >
              {user?.user.phoneNumber}
            </Text>
          </View>

          <View style={{ marginTop: 50, gap: 12 }}>
            <View style={styles.field}>
              <View>
                <Text style={styles.fieldText}>First Name</Text>
                <Text style={styles.fieldValue}>{user?.user.firstName}</Text>
              </View>

              <Button
                size="icon"
                variant="ghost"
                onPress={() => riderInfoSheetRef.current?.present()}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={24}
                  color="black"
                />
              </Button>
            </View>

            <View style={styles.field}>
              <View>
                <Text style={styles.fieldText}>Last Name</Text>
                <Text style={styles.fieldValue}>{user?.user.lastName}</Text>
              </View>

              {/* <Button size="icon" variant="ghost" onPress={() => { }}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={24}
                  color="black"
                />
              </Button> */}
            </View>

            <View style={styles.field}>
              <View>
                <Text style={styles.fieldText}>Phone Number</Text>
                <Text style={styles.fieldValue}>{user?.user.phoneNumber}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <View>
                <Text style={styles.fieldText}>Email</Text>
                <Text style={styles.fieldValue}>{user?.user.email}</Text>
              </View>
            </View>
          </View>

          <Button
            variant="ghost"
            onPress={() => setIsModalVisible(true)}
            style={{ marginTop: 50 }}
          >
            <Feather name="trash-2" size={18} color={colors.destructive} />
            <ButtonText style={{ color: colors.destructive }}>
              Delete Account
            </ButtonText>
          </Button>

          <CustomModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
          >
            <View style={{ paddingHorizontal: 10 }}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalDescription}>
                Are you sure you want to delete thus account?
              </Text>

              <View style={{ marginTop: 50 }}>
                <Button
                  size="sm"
                  variant="destructive"
                  onPress={handleDeleteAccount}
                >
                  <ButtonText style={{ color: "#fff" }}>Delete</ButtonText>
                  <Feather name="trash-2" size={18} color="white" />
                </Button>

                <Button
                  variant="outline"
                  style={{ marginTop: 10 }}
                  onPress={() => setIsModalVisible(false)}
                >
                  <ButtonText>Cancel </ButtonText>
                </Button>
              </View>
            </View>
          </CustomModal>

          <UpdateProfile
            ref={riderInfoSheetRef}
            index={riderInfoSheetIndex}
            position={riderInfoSheetPosition}
            user={user}
          />
        </ScrollView>
      )}
    </SafeAreaViews>
  );
}

const styles = StyleSheet.create({
  field: {
    borderRadius: 10,
    backgroundColor: "#F3F3F3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  fieldText: {
    fontSize: 14,
    letterSpacing: -0.5,
  },
  fieldValue: { fontSize: 12, color: "#636363", marginTop: 5 },
  modalTitle: {
    fontSize: 16,
    fontFamily: "interSemiBold",
    textAlign: "center",
  },
  modalDescription: {
    marginTop: 20,
    color: "#636363",
    fontSize: 14,
    fontFamily: "interRegular",
    textAlign: "center",
  },
  profileLoading: {
    backgroundColor: colors.primary,
    height: 30,
    width: 30,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    right: 0,
  },
});
