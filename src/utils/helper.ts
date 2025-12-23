import AsyncStorage from '@react-native-async-storage/async-storage';
// import {PostRequest} from './requests';

//
export const storeToken = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

export const retrieveToken = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
};

export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

export const retrieveData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
};

export const removeToken = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // remove error
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "TRANSACTION_SUCCESS":
      return "#4FB948";
    case "shipping_accepted":
      return "#1E83C5";
    case "shipping_rejected":
      return "red";
    default:
      return "gray";
  }
};


export const saveVisitedAddress = async (location: any) => {
  try {
    const existingAddresses = await AsyncStorage.getItem("visitedAddresses");
    const addresses = existingAddresses ? JSON.parse(existingAddresses) : [];

    // Prevent duplicates
    const isDuplicate = addresses.some(
      (addr:any) =>
        addr.latitude === location.latitude && addr.longitude === location.longitude
    );

    if (!isDuplicate) {
      addresses.push(location);
      await AsyncStorage.setItem("visitedAddresses", JSON.stringify(addresses));
    }
  } catch (error) {
    console.error("Error saving visited address:", error);
  }
};

export const getVisitedAddresses = async () => {
  try {
    const addresses = await AsyncStorage.getItem("visitedAddresses");
    return addresses ? JSON.parse(addresses) : [];
  } catch (error) {
    console.error("Error retrieving visited addresses:", error);
    return [];
  }
};
