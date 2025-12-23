import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import RatingStars from "./rating-stars";
import { s } from "react-native-size-matters";
import { colors } from "@/theme";
import images from "@/assets/images";

interface ReviewCardProps {
    rating: number;
    review: string;
    userName: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ rating, review, userName }) => {

    return (
        <View style={styles.card}>
            {/* Dynamic Star Rating */}
            <RatingStars rating={rating} />

            {/* Review Text */}
            {review && <Text style={styles.reviewText}>{review}</Text>}

            {/* User Info */}
            <View style={styles.userInfo}>
                <Image source={images?.user} style={styles.userImage} />
                <Text style={styles.userName}>{userName}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#F8F8F8",
        borderRadius: 15,
        padding: 15,
        marginVertical: 10,
        width: "90%",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 0.5,
        borderColor: colors.mutedForeground,
        marginBottom: 10
    },
    reviewText: {
        fontSize: s(14),
        color: "#333",
        marginVertical: 20,
        fontWeight: "500",
        lineHeight: 22

    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop:10
    },
    userImage: {
        width: 35,
        height: 35,
        borderRadius: 25,
        marginRight: 10,
        borderWidth:0.5,
        borderColor:colors.primary
    },
    userName: {
        fontSize: s(14),
        fontWeight: "bold",
        color: "#555",
    },
});

export default ReviewCard;
