import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export const calculateDistanceAndTime = async (pickupCoord, dropoffCoord) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupCoord.latitude},${pickupCoord.longitude}&destinations=${dropoffCoord.latitude},${dropoffCoord.longitude}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;

        const response = await axios.get(url);
        const data = response.data;

        if (data.status === "OK" && data.rows.length > 0 && data.rows[0].elements.length > 0) {
            const element = data.rows[0].elements[0];

            if (element.status === "OK") {
                return {
                    distance: element.distance.text,
                    duration: element.duration.text,
                };
            }
        }

        throw new Error("Invalid response from Google Maps API");
    } catch (error) {
        return null;
    }
};
