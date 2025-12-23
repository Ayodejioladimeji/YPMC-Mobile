import { Linking } from "react-native";
import { toast } from "sonner-native";

export const handleDial = (phoneNumber: string) => {
    if (!phoneNumber) {
        return toast.error("Phone number not available");
    }

    let formattedNumber = phoneNumber;

    if (phoneNumber.startsWith("+2340")) {
        formattedNumber = phoneNumber.replace("+2340", "+234");
    } else if (!phoneNumber.startsWith("+")) {
        formattedNumber = `+234${phoneNumber.startsWith("0") ? phoneNumber.substring(1) : phoneNumber}`;
    }

    Linking.openURL(`tel:${formattedNumber}`).catch(err =>
        console.error("Error opening dialer", err)
    );
};