import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PasswordForm from "@/components/auth/password-form";
import PersonalInfoForm from "@/components/auth/personal-info-form";
import Text from "@/components/ui/text";
import { useRegistrationStore } from "@/store/register";
import { colors, spacing } from "@/theme";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useContext } from "react";
import { DataContext } from "@/store/GlobalState";

const steps = [
  { step: 1, title: "Personal Info" },
  { step: 2, title: "Password Info" },
];

function renderForms(step: number) {
  switch (step) {
    case 1:
      return <PersonalInfoForm />;
    case 2:
      return <PasswordForm />;
    default:
      return <PersonalInfoForm />;
  }
}

export default function SignUp() {
  const { top } = useSafeAreaInsets();
  const step = useRegistrationStore((state) => state.step);
  const { setStep } = useRegistrationStore((state) => state.actions);
  const router = useRouter();
  const { state } = useContext(DataContext)

  const handleNavigate = () => {
    if (state?.validated === true) {
      setStep(2)
    }
  }


  return (
    <SafeAreaView style={{ backgroundColor: 'white' }}>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 30 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("@/assets/images/onboarding-1.png")}
          style={styles.logo}
          contentFit="cover"
        />

        <View
          style={{
            flex: 1,
            marginTop: spacing.huge,
            marginBottom: spacing.base,
          }}
        >
          <Text style={styles.description}>
            Kindly Provide these details to complete your Account Set Up
          </Text>

          <View style={styles.stepsContainer}>

            <TouchableOpacity activeOpacity={0.9} onPress={() =>
              setStep(1)
            }
              style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Personal Info</Text>
              <Pressable
                onPress={() => {
                  setStep(1)
                  // goToPrevStep
                }
                }
                style={[
                  styles.step,
                  {
                    backgroundColor:
                      step === 1
                        ? colors.primary
                        : "rgba(243, 243, 243, 1)",
                  },
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={handleNavigate}
              style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Password Info</Text>
              <Pressable
                onPress={handleNavigate}
                style={[
                  styles.step,
                  {
                    backgroundColor:
                      step === 2
                        ? colors.primary
                        : "rgba(243, 243, 243, 1)",
                  },
                ]}
              />
            </TouchableOpacity>
          </View>

          {renderForms(step)}
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: spacing.md,
            marginBottom: 70

          }}
        >
          <Text style={styles.accountText}>Already have an account?</Text>

          <TouchableOpacity onPress={() => router.push("/sign-in")}>
            <Text style={styles.accountLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "flex-start",
    // paddingBottom: 150
  },
  logo: {
    width: "100%",
    height: 200,
  },
  heading: {
    fontFamily: "interMedium",
    fontSize: 36,
  },
  description: {
    color: "rgba(99, 99, 99, 1)",
    fontFamily: "interRegular",
    fontSize: 16,
  },
  stepsContainer: { marginTop: spacing.huge, flexDirection: "row", gap: 10 },
  step: {
    backgroundColor: "rgba(243, 243, 243, 1)",
    height: 5,
    flex: 1,
    borderRadius: 8,
    marginTop: 10
  },
  wrapper: {
    marginTop: spacing.huge,
    gap: spacing.md,
  },
  label: {
    fontSize: 16,
  },
  input: {
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderColor: "rgba(99, 99, 99, 0.5)",
    borderRadius: 0,
  },
  button: {
    marginTop: spacing.huge,
  },
  link: {
    alignSelf: "flex-end",
    fontFamily: "interMedium",
  },
  accountText: {
    color: "rgba(99, 99, 99, 1)",
    textAlign: "center",
    fontFamily: "interMedium",
  },
  accountLink: {
    color: colors.primary,
  },
});
