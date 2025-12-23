export const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

export const calculateDistanceAndTime = (
    startCoords: { latitude: number; longitude: number },
    endCoords: { latitude: number; longitude: number },
): { distanceKm: string; travelTime: string } => {
    
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const earthRadiusKm = 6371; // Radius of Earth in kilometers

    const dLat = toRadians(endCoords.latitude - startCoords.latitude);
    const dLon = toRadians(endCoords.longitude - startCoords.longitude);

    const startLatRad = toRadians(startCoords.latitude);
    const endLatRad = toRadians(endCoords.latitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(startLatRad) *
        Math.cos(endLatRad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceKm = earthRadiusKm * c;

    // Calculate travel time based on average speed (e.g., 60 km/h for a car)
    const averageSpeedKmh = 60; // Average speed in km/h
    const travelTimeHours = distanceKm / averageSpeedKmh;

    const hours = Math.floor(travelTimeHours);
    const minutes = Math.round((travelTimeHours - hours) * 60);

    return {
        distanceKm: distanceKm.toFixed(2), // Distance in kilometers rounded to 2 decimals
        travelTime: `${hours}hr ${minutes}mins`, // Travel time in "x hr y mins"
    };
};


type Coordinates = { latitude: number; longitude: number };

export const calculateTravelTime = (
    startCoords: Coordinates,
    endCoords: Coordinates,
    startTime: string,
    averageSpeedKmPerHour: number = 60 
): string => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const earthRadiusKm = 6371; 

    // Haversine formula to calculate distance between two points
    const dLat = toRadians(endCoords.latitude - startCoords.latitude);
    const dLon = toRadians(endCoords.longitude - startCoords.longitude);

    const startLatRad = toRadians(startCoords.latitude);
    const endLatRad = toRadians(endCoords.latitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(startLatRad) *
        Math.cos(endLatRad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = earthRadiusKm * c;

    // Calculate travel time in hours
    const travelTimeHours = distanceKm / averageSpeedKmPerHour;

    const travelHours = Math.floor(travelTimeHours);
    const travelMinutes = Math.round((travelTimeHours - travelHours) * 60);

    // Parse the start time
    const timeParts = startTime.match(/^(\d+):(\d+)\s*(am|pm)$/i);
    if (!timeParts) throw new Error("Invalid start time format");

    let [_, startHour, startMinute, meridian] = timeParts;
    let hour = parseInt(startHour, 10);
    const minute = parseInt(startMinute, 10);

    if (meridian.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (meridian.toLowerCase() === "am" && hour === 12) hour = 0;

    // Add travel time to the start time
    let arrivalHour = hour + travelHours;
    let arrivalMinute = minute + travelMinutes;

    // Adjust for minute overflow
    if (arrivalMinute >= 60) {
        arrivalHour += Math.floor(arrivalMinute / 60);
        arrivalMinute %= 60;
    }

    // Adjust for hour overflow (24-hour clock)
    arrivalHour %= 24;

    // Convert back to 12-hour format
    const arrivalMeridian = arrivalHour >= 12 ? "pm" : "am";
    if (arrivalHour > 12) arrivalHour -= 12;
    if (arrivalHour === 0) arrivalHour = 12;

    // Format the arrival time
    const formattedArrivalTime = `${arrivalHour}:${arrivalMinute
        .toString()
        .padStart(2, "0")} ${arrivalMeridian}`;

    return formattedArrivalTime;
};


export const formatMoney = (amount:number) => {
    let amountStr = amount?.toString();

    let parts = amountStr?.split(".");
    let integerPart = parts[0];
    let fractionalPart = parts?.length > 1 ? "." + parts[1] : "";

    // Add commas to the integer part
    let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    let formattedFractional =
        fractionalPart.length > 2 ? fractionalPart.slice(0, 3) : fractionalPart;

    let formattedAmount = formattedInteger + formattedFractional;

    return formattedAmount;
};

export function convertKmToMeters(km: number): string {
    const meters = km * 1000; 
    return meters.toFixed(1)
}

export function convertMinutes(minutes: number): string {
    if (minutes < 0) return "Invalid time";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    let result = "";
    if (hours > 0) {
        result += `${hours}hr${hours > 1 ? "s" : ""}`;
    }
    if (remainingMinutes > 0) {
        result += ` ${remainingMinutes} min`;
    }

    return result.trim();
}

// utils/objectUtils.ts

export function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (
        typeof obj1 !== 'object' ||
        obj1 === null ||
        typeof obj2 !== 'object' ||
        obj2 === null
    ) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

export function containsObject(array: any[], target: any): boolean {
    return array.some(item => deepEqual(item, target));
}


// AIzaSyBW0T3bIXscKaM_63GSCk8HowzL8Til6Z8