import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { AntDesign, EvilIcons, Feather, Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  SCREEN_HEIGHT,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { useSharedValue } from "react-native-reanimated";
import { s } from "react-native-size-matters";
import WebView from "react-native-webview";
import { toast } from "sonner-native";
import { z } from "zod";

import { fundWallet } from "@/api/payment";
import { CreditCardIcon } from "@/assets/images/svgs";
import AddCard from "@/components/account/add-card";
import ModeOfPaymentSheet from "@/components/ship/mode-of-payment";
import TopNavigation from "@/components/TopNavigation";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Input from "@/components/ui/input";
import CustomModal from "@/components/ui/modal";
import Text from "@/components/ui/text";
import { DataContext } from "@/store/GlobalState";
import { colors, spacing } from "@/theme";
import { DeleteRequest, GetRequest, PostRequest } from "@/utils/requests";
import { ACTIONS } from "@/store/Actions";

const schema = z.object({
  amount: z.string().min(1, { message: "Amount is required" }),
  channel: z.string().min(1, { message: "Channel is required" }),
});

export default function Payment() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const { user } = state;
  const [loading, setLoading] = useState(true);
  const [fundLoading, setFundLoading] = useState(false);
  const [cards, setCards] = useState<any>(null);
  const paymentSheetRef = useRef<BottomSheetModal>(null);
  const paymentSheetIndex = useSharedValue<number>(0);
  const paymentSheetPosition = useSharedValue<number>(SCREEN_HEIGHT);
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [id, setId] = useState("")
  const [callback, setCallback] = useState(false)
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);


  // get cards

  const getCards = async () => {
    const res = await GetRequest("/card", state?.token);
    if (res?.status === 200 || res?.status === 201) {
      setCards(res?.data?.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state?.token) {
      getCards();
    }
  }, [state?.token, state?.callback, callback]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      channel: "PAYSTACK",
    },
    mode: "onSubmit",
  });

  // fund wallet
  const handleSubmit = async () => {
    setFundLoading(true);

    const payload = {
      amount: Number(form.getValues("amount")),
      channel: "PAYSTACK",
    };

    const res = await PostRequest(
      "/transactions/fund-wallet",
      payload,
      state?.token,
    );
    if (res?.status === 200 || res?.status === 201) {
      router.replace({
        pathname: "/(app)/(tabs)/account/paystack",
        params: {
          paystack_url: res?.data?.data?.authorization_url,
          amount: form.getValues("amount"),
        },
      });
      setIsModalVisible(false);
      form.reset();
    }
    setFundLoading(false);
  };

  // delete card
  const handleDelete = async () => {
    setDeleteLoading(true)

    const res = await DeleteRequest(`/card/${id}`, state?.token)
    if (res?.status === 200 || res?.status === 201) {
      setCallback(!callback)
      toast.success(res?.data?.message)
      setDeleteModal(false)
    }
    setDeleteLoading(false)
  };

  // on refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch({type:ACTIONS.CALLBACK, payload:!state?.callback})
    getCards()

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshing]);



  return (
    <SafeAreaView style={styles.container}>
      <TopNavigation title="Payment" />
      <ScrollView refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }>
        <View style={styles.container}>
          <View style={styles.walletContainer}>
            <View style={styles.wallet}>
              <Text style={styles.walletName}>{user?.fullName}</Text>

              <Text
                style={{
                  fontSize: 12,
                  letterSpacing: -0.5,
                  color: "#fff",
                  marginTop: 20,
                }}
              >
                Wallet Balance
              </Text>

              <Text style={styles.walletBalance}>
                {user?.walletBalance.toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}
              </Text>

              <Image
                source={require("@/assets/images/wallet.png")}
                style={styles.walletImage}
              />

              <Image
                source={require("@/assets/images/ring.png")}
                style={styles.ring}
              />
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.7} style={styles.itemContainer} onPress={() => setIsModalVisible(true)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="add" size={24} color="black" />
              <Text style={styles.itemText}>Fund Wallet</Text>
            </View>

              <Ionicons name="chevron-forward" size={18} color="black" />
          </TouchableOpacity>

          <View style={{ height: 2, backgroundColor: colors.muted }}></View>

          <TouchableOpacity activeOpacity={0.7} style={styles.savedCardStyle} onPress={() => paymentSheetRef?.current?.present()}>
            <Text style={{ fontFamily: "interMedium", color: "#636363" }}>
              Saved Cards
            </Text>

              <Ionicons name="chevron-forward" size={18} color="black" />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ alignSelf: "flex-start", paddingLeft: 20, marginTop: 15 }}
            />
          ) : (
            <>
              {cards?.length === 0 ? (
                  <TouchableOpacity activeOpacity={0.7} style={styles.itemContainer} onPress={() => paymentSheetRef?.current?.present()}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Ionicons name="add" size={24} color="black" />
                    <Text style={styles.itemText}>Add debit/credit card</Text>
                  </View>

                    <Ionicons name="chevron-forward" size={18} color="black" />
                </TouchableOpacity>
              ) : (
                <>
                  {cards?.map((item: any, index: number) => {
                    return (
                      <View style={styles.itemContainer} key={index}>
                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <CreditCardIcon />
                            <Text style={styles.itemText}>{item?.cardType}</Text>
                          </View>
                          <Text
                            style={styles.accountNumber}
                          >{`(**** **** **** ${item?.last4})`}</Text>
                        </View>

                        <TouchableOpacity activeOpacity={0.7} style={styles.deleteCard} onPress={() => { setDeleteModal(true), setId(item.id) }}>
                          <AntDesign name="delete" size={15} color="red" />
                          <Text style={styles.deleteText}>Delete Card</Text>
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {isModalVisible && (
        <CustomModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        >
          <View>
            <Text style={styles.modalTitle}>Fund Wallet</Text>

            <Form {...form}>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (NGN)</FormLabel>
                    <Input
                      style={{
                        backgroundColor: "#F3F3F3",
                        paddingHorizontal: spacing.sm,
                        borderColor: isFocused ? "#f97216" : "rgba(99, 99, 99, 0.5)",
                        borderWidth: 1
                      }}
                      autoCorrect={false}
                      placeholder="eg ₦1,000.00"
                      placeholderTextColor={"#63636380"}
                      onChangeText={field.onChange}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <View style={{ marginTop: 30 }}>
                <Button
                  onPress={handleSubmit}
                  size="sm"
                  disabled={fundLoading || form.getValues("amount") === ""}
                >
                  <ButtonText>Proceed</ButtonText>
                  {fundLoading && (
                    <ActivityIndicator color="white" size="small" />
                  )}
                </Button>
              </View>
            </Form>
          </View>
        </CustomModal>
      )}

      <AddCard
        ref={paymentSheetRef}
        index={paymentSheetIndex}
        position={paymentSheetPosition}
        user={user}
      />

      <CustomModal
        visible={deleteModal}
        onClose={() => setDeleteModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}> Are you sure?</Text>

          <Text style={styles.modalMessage}>
            Are you sure you want to delete this card? This action cannot be undone.
          </Text>

          <View style={{ marginTop: spacing.base, display: 'flex', flexDirection: "row", gap: spacing.xs }}>
            <Button
              variant="outline"
              size="sm"
              style={{ flex: 1, width: "50%" }}
              onPress={() => setDeleteModal(false)}
            >
              <ButtonText>No, Cancel</ButtonText>

            </Button>
            <Button variant='destructive' style={{ flex: 1, width: "50%" }} size="sm" onPress={handleDelete}>
              <ButtonText style={{ color: "#fff" }}>Yes, Delete</ButtonText>
              {deleteLoading && <ActivityIndicator size="small" color={colors.white} />}
            </Button>
          </View>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  walletContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    height: 190,
  },
  wallet: {
    position: "relative",
    height: 140,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
  },
  walletName: {
    fontFamily: "interMedium",
    fontSize: 12,
    color: "#fff",
    letterSpacing: 4,
  },
  walletBalance: {
    fontFamily: "interSemiBold",
    fontSize: 24,
    color: "#fff",
    marginTop: 10,
  },
  walletImage: {
    width: "100%",
    height: 126,
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  itemContainer: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  ring: {
    width: 176,
    height: 176,
    position: "absolute",
    top: -118,
    left: 20,
  },
  itemText: {
    fontSize: 16,
    textTransform: 'capitalize'
  },
  accountNumber: {
    fontSize: s(11),
    color: colors.mutedForeground,
    marginTop: 5,
  },
  savedCardStyle: {
    paddingHorizontal: spacing.md,
    marginTop: 30,
    marginBottom: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteCard: {
    backgroundColor: "#E733230D",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  deleteText: {
    fontSize: s(10),
    color: "red",
  },
  modalContent: {
    // padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "interSemiBold",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});
