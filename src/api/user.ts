import { Platform } from "react-native";

import { ApiResponse, axios_server } from ".";

type CustomerProfile = {
  id: string;
  fullName: string;
  referralCode: string;
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
  metadata: {
    id: string;
    profileImageUrl: string;
    additionalInfo: Record<string, any>;
    address: Record<string, any>;
    contactInfo: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  };
  shippings: any[];
  user: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    isVerified: boolean;
    status: string;
  };
};

type ShippingStats = {
  active: number;
  pending: number;
  completed: number;
  total: number;
  breakdown: any[];
};

export async function getUser(token: string) {
  const res = await axios_server.get<ApiResponse<CustomerProfile>>(
    "/customer/profile",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data;
}

export async function getShippingStats(token: string) {
  const res = await axios_server.get<ApiResponse<ShippingStats>>(
    "/shipping/customer/dashboard",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data;
}

export async function uploadProfileImage({
  file,
  token,
}: {
  file: { uri: string; name: string; type: string };
  token: string;
}) {
  const formData = new FormData();

  formData.append("file", {
    uri: Platform.OS === "android" ? file.uri : file.uri.replace("file://", ""),
    name: file.name,
    type: file.type,
  } as any);

  const res = await axios_server.post<ApiResponse<string>>(
    "/customer/upload-profile-image",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
}
