import React, { useContext, useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import StarRating from "react-native-star-rating-widget";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import CustomModal from "../ui/modal";
import { s } from "react-native-size-matters";
import { PostRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import { toast } from "sonner-native";
import images from "@/assets/images";
import { ACTIONS } from "@/store/Actions";


const RatingModal = ({ ratingModal, setRatingModal, id, rider }: any) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const { state, dispatch } = useContext(DataContext)
    const [buttonLoading, setButtonLoading] = useState(false)

    // handle submit review
    const handleSubmit = async () => {
        const payload = {
            shippingId: id,
            rating,
            reviewText: review
        }

        setButtonLoading(true)

        const res = await PostRequest("/reviews", payload, state?.token)
        if (res?.status === 200 || res?.status === 201) {
            dispatch({type:ACTIONS.CALLBACK, payload: !state?.callback})
            toast.success(res?.data?.message)
            setRatingModal(false)
        }

        setButtonLoading(false)
    }

    // 

    return (
        <CustomModal
            visible={ratingModal}
            onClose={() => setRatingModal(false)}
        >
            <View style={styles.modalContainer}>

                {/* User Profile Image */}
                {rider?.profileImageUrl ?
                    <Image source={{ uri: rider?.profileImageUrl }} alt="" style={styles.userImage} />
                    :
                    <Image source={images?.user} alt="" style={styles.userImage} />
                }

                {/* Header Text */}
                <Text style={styles.title}>Rate Your Delivery Experience</Text>
                <Text style={styles.subtitle}>
                    {rider?.firstName} {rider?.lastName} delivered your package ✨
                </Text>

                {/* Star Rating */}
                <StarRating rating={rating} onChange={setRating} starSize={40} color="#FF7D1A" enableHalfStar={false}/>

                {/* Review Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Add a review (Optional)"
                    placeholderTextColor="#A9A9A9"
                    multiline
                    value={review}
                    onChangeText={setReview}
                />

                {/* Submit Button */}
                <TouchableOpacity activeOpacity={0.7} style={styles.submitButton} onPress={handleSubmit} disabled={rating === 0}>
                    <Text style={styles.submitText}>Submit</Text>
                    {buttonLoading && <ActivityIndicator color="white" />}
                </TouchableOpacity>
            </View>
        </CustomModal>

    );
};

export default RatingModal;

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: "white",
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: "center",
        width: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 15,
        right: 15,
    },
    userImage: {
        width: 80,
        height: 80,
        borderRadius: 35,
        marginBottom: 25,
    },
    title: {
        fontSize: s(16),
        fontWeight: "bold",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: s(13),
        color: "#666",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        backgroundColor: "#F2F2F2",
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        minHeight: 90,
    },
    submitButton: {
        backgroundColor: "#FF7D1A",
        width: "100%",
        paddingVertical: 15,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',

    },
    submitText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
