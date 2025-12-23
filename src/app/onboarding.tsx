import { Slide } from '@/components/auth/onboarding-carousel';
import { storeData } from '@/utils/helper';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

type OnboardingItem = {
  id: string;
  image: any; 
  title: string;
  description: string;
  buttonLabel: string;
  buttonLabel2: string;
};

const onboardingData: OnboardingItem[] = [
  {
    id: "onboarding-1",
    image: require("@/assets/images/onboarding-2.png"),
    title: "Easily Create Shipments and Get Instant Quotes",
    description:
      "Schedule new shipments and optimize your logistics with just a few taps.",
    buttonLabel: "Get Started",
    buttonLabel2: "",
  },
  {
    id: "onboarding-2",
    image: require("@/assets/images/onboarding-3.png"),
    title: "Track Your Shipments in Real-Time.",
    description:
      "Stay updated with live tracking and status updates for all your deliveries.",
    buttonLabel: "Continue",
    buttonLabel2: "",
  },
  {
    id: "onboarding-3",
    image: require("@/assets/images/onboarding-4.png"),
    title: "Streamline Your Deliveries",
    description:
      "Join us today to manage your shipments effortlessly. Sign in now!",
    buttonLabel: "Create Account",
    buttonLabel2: "Sign In",
  },
];


const OnboardingScreen = () => {
  const flatlistRef = useRef<FlatList>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const router = useRouter()

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const handleNextSlide = () => {
    if (isScrolling) return;

    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < onboardingData.length) {
      setIsScrolling(true);
      flatlistRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      // console.log('Onboarding finished');
      // Navigate to home screen or next step
    }
  };

  const handleSkip = () => {
    setIsScrolling(true);
    flatlistRef.current?.scrollToIndex({
      index: onboardingData.length - 1,
      animated: true,
    });
  };

  const handlePress = async () => {
    router.replace("/(auth)/sign-in");
    await storeData("firstTime", "true")
  };

  const handleCreateAccount = async () => {
    router.replace("/(auth)/sign-up");
    await storeData("firstTime", "true")
  };

  const renderItem = ({ item, index }:any) => (
    <Slide
      item={item}
      index={index}
      handlePress={handlePress}
      handleNextSlide={handleNextSlide}
      isLastSlide={index === onboardingData.length - 1}
      createAccount={handleCreateAccount}
    />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleSkip}
        style={

            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              marginRight: 10,
              marginVertical:20,
            }
          }
      >
        <Text style={{ fontSize: 16, fontFamily: "interMedium" }}> Skip </Text>
        < MaterialIcons name="arrow-right-alt" size={20} color="#000000" />
      </TouchableOpacity>

      <FlatList
        ref={flatlistRef}
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={(e) => {
          updateCurrentSlideIndex(e);
          setIsScrolling(false);
        }}
        onScrollBeginDrag={() => setIsScrolling(true)}
        onScrollEndDrag={() => setIsScrolling(false)}
        onMomentumScrollBegin={() => setIsScrolling(true)}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  skipButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
