import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { toast } from "sonner-native";
import images from "@/assets/images";

export default function UploadPicture() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const { state } = useContext(DataContext)
  const [loading, setLoading] = useState(false)


  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return false;
      }
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      if (cameraStatus !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
        return false;
      }
    }
    return true;
  };

  const pickImage = async (): Promise<void> => {
    if (await requestPermissions()) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 1,
        base64:false
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    }
  };

  const takePhoto = async (): Promise<void> => {
    if (await requestPermissions()) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    }
  };

  // upload profile image
  const handleSave = async () => {
    if (image) {
      setLoading(true);

      // Create FormData object for multipart/form-data
      const formData:any = new FormData();
      formData.append('file', {
        uri: image.uri,
        type: 'image/png',
        name: 'profile-image.png',
      });

      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/customer/upload-profile-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state?.token}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (res.status === 200 || res.status === 201) {
          toast.success(data?.message);
          router.push('/(app)/(tabs)/home');
        } 
      } catch (error:any) {
        toast.error(error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    }
  }

  // 

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:15, marginTop:15}}>
        {image && <Pressable
          onPress={() => {
            setImage(null)
          }}
          style={{ alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal:10, paddingVertical:10, elevation:0.5, borderRadius:'50%'}}
        >
          <MaterialIcons name="arrow-back" size={20} color="#000000" />
        </Pressable>}

        <View></View>

        <Pressable
          onPress={() => {
            router.push("/(app)/(tabs)/home")
          }}
          style={{ flexDirection: 'row', alignItems: 'center', columnGap:3}}
        >
          <Text style={{ fontSize: 16, fontFamily: "interBold" }}>Skip</Text>
          <MaterialIcons name="arrow-right-alt" size={20} color="#000000" />
        </Pressable>
      </View>

      <Text style={styles.heroText}>Upload profile picture</Text>
      <Text style={styles.subText}>Tap below to upload or take a photo.</Text>

      <View style={styles.imageOuterContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} />
          ) : (
            <Image
              source={images.user}
              style={styles.image}
            />
          )}
        </TouchableOpacity>

      </View>

      <View style={styles.buttonContainer}>
        {image ? (
          <Button onPress={handleSave}>
            <ButtonText>Save</ButtonText>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <AntDesign name="check" size={18} color="white" />
            )}
          </Button>

        ) : (
          <>
            <Button onPress={pickImage}>
              <ButtonText>Upload Photo</ButtonText>
              <Feather name="download" size={18} color="white" />
            </Button>

            <Button variant="outline" onPress={takePhoto}>
              <ButtonText>Take Photo</ButtonText>
              <Feather name="camera" size={18} color="black" />
            </Button>
          </>
        )}
      </View>

      {image && <TouchableOpacity style={{ marginVertical: 30 }} onPress={() => setImage(null)}>
        <Text style={{ textAlign: 'center', textDecorationLine: 'underline' }}>Change picture</Text>
      </TouchableOpacity>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skip: {
    alignSelf: "flex-end",
  },
  skipText: {
    fontFamily: "interMedium",
  },
  heroText: {
    fontSize: 30,
    fontFamily: "interMedium",
    maxWidth: 300,
    marginBottom: 10,
    marginLeft: 15,
    marginTop: 40
  },
  subText: {
    marginBottom: 20,
    marginLeft: 15,
  },
  imageOuterContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 30,
  },
  imageContainer: {
    marginTop: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    // backgroundColor: "#EEEEEE",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",


  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
  },
  checkmarkContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
    marginHorizontal: 15,
  },
  button: {
    marginBottom: 10,
  },
});
