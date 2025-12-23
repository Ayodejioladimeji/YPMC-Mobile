import { useForm, Controller } from "react-hook-form";
import images from "@/assets/images";
import { CreditCardIcon } from "@/assets/images/svgs";
import { colors, spacing } from "@/theme";
import React, { forwardRef, useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image, Alert, ActivityIndicator, Keyboard } from "react-native";
import { PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { ACTIONS } from "@/store/Actions";
import { useRouter } from "expo-router";
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { SharedValue } from "react-native-reanimated";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";


interface FormData {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

type CardProps = {
    index: SharedValue<number>;
    position: SharedValue<number>;
    user: any
};

const AddCard = forwardRef<BottomSheetModal, CardProps>(
    ({ index, position, user }, ref) => {
        const { state, dispatch } = useContext(DataContext)
        const [loading, setLoading] = useState(false)
        const router = useRouter()
        const headerHeight = useHeaderHeight();
        const [focusedField, setFocusedField] = useState<null | string>(null);
        const [snapPoints, setSnapPoints] = useState(["50%", "70%"]);
        const {
            control,
            handleSubmit,
            setValue,
            formState: { errors },
        } = useForm<FormData>();

         useEffect(() => {
              const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
                setSnapPoints(["70%"]);
                if (ref && "current" in ref && ref.current) {
                  ref.current.expand();
                }
              });
        
              const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
                setSnapPoints(["50%", "70%"]);
                if (ref && "current" in ref && ref.current) {
                  ref.current.snapToIndex(0);
                }
              });
        
              return () => {
                showSubscription.remove();
                hideSubscription.remove();
              };
            }, [ref]);

        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    enableTouchThrough={true}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                />
            ),
            [],
        );

        // handle submit
        const onSubmit = async (data: FormData) => {
            setLoading(true)

            const cardNumberWithoutSpaces = data.cardNumber.replace(/\s/g, "")
            const last4Digits = cardNumberWithoutSpaces.slice(-4);
            const [expiryMonth, expiryYear] = data.expiryDate.split("/").map(Number);

            const payload = {
                last4Digits,
                expiryMonth,
                expiryYear: 2000 + expiryYear,
                brand: "Visa",
                email: state?.user?.user?.email
            };

            const res = await PostRequest("/card/add", payload, state?.token)
            if (res?.status === 200 || res?.status === 201) {
                dispatch({ type: ACTIONS.CALLBACK, payload: !state?.callback })

                router.replace({
                    pathname: "/(app)/(tabs)/account/card-paystack",
                    params: { paystack_url: res?.data?.data?.data?.data?.authorization_url },
                });
            }
            setLoading(false)
        };

        // form expiry
        const formatExpiryDate = (value: string) => {
            // Remove all non-digit characters
            value = value.replace(/[^\d]/g, "");
            if (value.length > 2) {
                value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
            }
            // Strictly limit to "MM/YY"
            return value.slice(0, 5);
        };

        // format card number
        const formatCardNumber = (value: string) => {
            // Remove all non-digit characters
            value = value.replace(/\D/g, "");

            // Add space after every 4 digits
            return value.replace(/(\d{4})(?=\d)/g, "$1 ");
        };

        // 
        const closeSheet = () => {
            if (ref && "current" in ref && ref.current) ref.current.dismiss();
        }

        return (
            <BottomSheetModal
                animatedIndex={index}
                animatedPosition={position}
                enableDismissOnClose={true}
                enablePanDownToClose={true}
                key="TimelineSheet"
                ref={ref}
                snapPoints={snapPoints}
                style={styles.shadow}
                topInset={headerHeight}
                backdropComponent={renderBackdrop}
                index={1}
            >
                <BottomSheetScrollView
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps="never"
                    style={{ flex: 1 }}
                >
                    <View style={styles.textStyle}>
                        <Text style={{ fontSize: 16 }}>New Card</Text>
                        <TouchableOpacity onPress={closeSheet}>
                            <Feather name="x" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.container}>

                        <View style={styles.cardBox}>
                            <CreditCardIcon />
                            <Text style={styles.cardLabel}>Card Number</Text>
                        </View>

                        <Controller
                            control={control}
                            name="cardNumber"
                            rules={{
                                required: "Card number is required",
                                pattern: {
                                    value: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
                                    message: "Card number must be in the format 1234 5678 9012 3456",
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            errors.cardNumber && styles.inputError,
                                            focusedField === "cardNumber" && { borderColor: "#f97216", borderWidth: 1 },
                                        ]}
                                        keyboardType="numeric"
                                        placeholder="1234 5678 9012 3456"
                                        onFocus={() => setFocusedField("cardNumber")}
                                        onBlur={() => {
                                            onBlur();
                                            setFocusedField(null);
                                        }}
                                        onChangeText={(val) => {
                                            const formatted = formatCardNumber(val);
                                            onChange(formatted);
                                        }}
                                        value={value}
                                    />
                                    {errors.cardNumber && <Text style={styles.error}>{errors.cardNumber.message}</Text>}
                                </>
                            )}
                        />


                        {/* Expiry Date and CVV */}
                        <View style={styles.row}>
                            <View style={styles.rowItem}>
                                <Text style={styles.label}>Expiry Date</Text>
                                <Controller
                                    control={control}
                                    name="expiryDate"
                                    rules={{
                                        required: "Expiry date is required",
                                        pattern: {
                                            value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                                            message: "Enter a valid expiry date (MM/YY)",
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    errors.expiryDate && styles.inputError,
                                                    focusedField === "expiryDate" && { borderColor: "#f97216", borderWidth: 1 },
                                                ]}
                                                keyboardType="numeric"
                                                placeholder="MM/YY"
                                                onFocus={() => setFocusedField("expiryDate")}
                                                onBlur={() => {
                                                    onBlur();
                                                    setFocusedField(null);
                                                }}
                                                onChangeText={(val) => {
                                                    const formatted = formatExpiryDate(val);
                                                    onChange(formatted);
                                                    setValue("expiryDate", formatted, { shouldValidate: true });
                                                }}
                                                value={value}
                                            />
                                            {errors.expiryDate && <Text style={styles.error}>{errors.expiryDate.message}</Text>}
                                        </>
                                    )}
                                />

                            </View>

                            <View style={styles.rowItem}>
                                <Text style={styles.label}>CVV</Text>
                                <Controller
                                    control={control}
                                    name="cvv"
                                    rules={{
                                        required: "CVV is required",
                                        pattern: {
                                            value: /^\d{3}$/,
                                            message: "CVV must be 3 digits",
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    errors.cvv && styles.inputError,
                                                    focusedField === "cvv" && { borderColor: "#f97216", borderWidth: 1 },
                                                ]}
                                                keyboardType="numeric"
                                                secureTextEntry
                                                placeholder="***"
                                                onFocus={() => setFocusedField("cvv")}
                                                onBlur={() => {
                                                    onBlur();
                                                    setFocusedField(null);
                                                }}
                                                onChangeText={onChange}
                                                value={value}
                                                maxLength={3}
                                            />
                                            {errors.cvv && <Text style={styles.error}>{errors.cvv.message}</Text>}
                                        </>
                                    )}
                                />

                            </View>
                        </View>

                        {/* Supported Card Logos */}
                        <View style={styles.cardLogosContainer}>
                            <Image source={images.cards} style={styles.cardLogo} />
                        </View>

                        {/* Add Card Button */}
                        <TouchableOpacity disabled={loading} style={styles.button} onPress={handleSubmit(onSubmit)}>
                            <Text style={styles.buttonText}>+ Add Card</Text>
                            {loading && <ActivityIndicator color="white" size="small" />}
                        </TouchableOpacity>
                    </View>
                </BottomSheetScrollView>
            </BottomSheetModal>

        )
    })



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
        justifyContent: "center",
    },
    cardBox: {
        alignItems: "center",
        flexDirection: "row",
        columnGap: 5,
        marginBottom: 8,
    },
    cardLabel: {
        fontSize: 16,
        color: colors.mutedForeground,
    },
    label: {
        fontSize: 16,
        color: colors.mutedForeground,
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#f5f5f5",
        height: 48,
        paddingHorizontal: 16,
        borderRadius: 8,
        fontSize: 16,
        color: "#333",
        marginBottom: 16,
    },
    inputError: {
        borderColor: "red",
        borderWidth: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    rowItem: {
        flex: 1,
        marginRight: 8,
    },
    cardLogosContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
        marginBottom: 20,
    },
    cardLogo: {
        height: 30,
        resizeMode: "contain",
    },
    button: {
        marginTop: 24,
        backgroundColor: "#FF6600",
        borderRadius: 20,
        paddingVertical: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    error: {
        color: "red",
        fontSize: 12,
        marginTop: -10,
        marginBottom: 8,
    },
    shadow: {
        shadowColor: "#636363",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.9,
        shadowRadius: 25,
        elevation: 15,
    },
    textStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
    },

});

export default AddCard;
