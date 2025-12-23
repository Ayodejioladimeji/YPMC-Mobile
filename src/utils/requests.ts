import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { toast } from 'sonner-native';


const endpoint = process.env.EXPO_PUBLIC_BASE_URL;

export const PostRequest = async (url: string, data?: any, token?: string) => {
  try {
    const res = await axios.post(
      endpoint + url,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return res;
  } catch (error:any) {

    if (error?.response?.data?.message) {
      // Server responded but with an error
      toast.error(error.response.data.message, { duration: 5000 });
    } else if (error?.code === "ERR_NETWORK") {
      
      toast.error("Internet not available", { duration: 5000 });
    } else {
      // Some other unknown error
      toast.error("Something went wrong", { duration: 5000 });
    }

    return error?.response?.data?.message;
  
  }
};

// =================================
export const PatchRequest = async (url: string, data?: any, token?: string) => {
  try {
    const res = await axios.patch(
      endpoint + url,
      data,
       {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return res;
  } catch (error:any) {
    if (error?.response?.data?.message) {
      // Server responded but with an error
      toast.error(error.response.data.message, { duration: 5000 });
    } else if (error?.code === "ERR_NETWORK") {

      toast.error("Internet not available", { duration: 5000 });
    } else {
      // Some other unknown error
      toast.error("Something went wrong", { duration: 5000 });
    }

    return error?.response?.data?.message;
  }
};

export const PutRequest = async (url: string, data?: any, token?: string) => {
  try {
    const res = await axios.put(
      endpoint + url,
      data,
       {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return res;
  } catch (error:any) {

    if (error?.response?.data?.message) {
      // Server responded but with an error
      toast.error(error.response.data.message, { duration: 5000 });
    } else if (error?.code === "ERR_NETWORK") {

      toast.error("Internet not available", { duration: 5000 });
    } else {
      // Some other unknown error
      toast.error("Something went wrong", { duration: 5000 });
    }

    return error?.response?.data?.message;
  }
};

// =================================
export const GetRequest = async (url: string, token?: string) => {
  try {
    const res = await axios.get(
      endpoint + url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    // console.log('success fetching orders');
    return res;
  } catch (error:any) {
    await AsyncStorage.removeItem("token")
        return error?.response?.data?.message;
  }
};


export const DeleteRequest = async (url: string, token?: string) => {
  try {
    const res = await axios.delete(
      endpoint + url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return res;
  } catch (error: any) {

    if (error?.response?.data?.message) {
      // Server responded but with an error
      toast.error(error.response.data.message, { duration: 5000 });
    } else if (error?.code === "ERR_NETWORK") {

      toast.error("Internet not available", { duration: 5000 });
    } else {
      // Some other unknown error
      toast.error("Something went wrong", { duration: 5000 });
    }

    return error?.response?.data?.message;
  }
};