import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface RatingStarsProps {
    rating: number;
    starSize?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, starSize = 20 }) => {
    const totalStars = 5;

    // SVG paths for stars
    const fullStarPath = "M12 .587l3.668 7.431 8.167 1.191-5.917 5.763 1.396 8.138L12 18.896l-7.314 3.857 1.396-8.138L.165 9.209l8.167-1.191L12 .587z";
    const halfStarPath = "M12 .587v17.73l-7.314 3.857 1.396-8.138L.165 9.209l8.167-1.191L12 .587z";

    return (
        <View style={{ flexDirection: "row" }}>
            {Array.from({ length: totalStars }).map((_, index) => {
                const starValue = index + 1;
                let starType: "full" | "half" | "empty" = "empty";

                if (rating >= starValue) {
                    starType = "full";
                } else if (rating >= starValue - 0.5) {
                    starType = "half";
                }

                return (
                    <Svg
                        key={index}
                        width={starSize}
                        height={starSize}
                        viewBox="0 0 24 24"
                        fill={starType === "full" ? "#F97216" : starType === "half" ? "#63636333" : "#63636333"}
                        style={{ marginHorizontal: 2 }}
                    >
                        {starType === "half" && (
                            <Path
                                d={halfStarPath}
                                fill="#F97216"
                            />
                        )}
                        <Path d={fullStarPath} />
                    </Svg>
                );
            })}
        </View>
    );
};

export default RatingStars;
