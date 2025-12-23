import { ApiResponse, axios_server } from ".";

type LoginResponseData = {
  accessToken: string;
  userRole: string;
  userId: string;
};

type RegistrationResponseData = {
  customerId: string;
  userId: string;
};

type OTPResponseData = {
  accessToken: string;
  userRole: string;
  userId: string;
};

export async function login(data: { email: string; password: string }) {
  const res = await axios_server.post<ApiResponse<LoginResponseData>>(
    "/auth/login/customer",
    data
  );

  return res.data;
}

export async function registerCustomer(data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  referral?: string;
}) {
  const res = await axios_server.post<ApiResponse<RegistrationResponseData>>(
    "/auth/register/customer",
    data
  );
  return res.data;
}

export async function forgotPassword(data: { email: string }) {
  const res = await axios_server.post<ApiResponse>(
    "/auth/forgot-password",
    data
  );

  return res.data;
}

export async function verifyOTP(data: { email: string; otp: string }) {
  const res = await axios_server.post<ApiResponse<OTPResponseData>>(
    "/auth/verify-otp",
    data
  );

  return res.data;
}

export async function resendOTP(data: { email: string }) {
  const res = await axios_server.post<ApiResponse<any>>(
    "/auth/resend-otp",
    data
  );

  return res.data;
}

export async function resetPassword(data: {
  newPassword: string;
  token: string;
}) {
  const res = await axios_server.post<ApiResponse>(
    "/auth/reset-password",
    data
  );

  return res.data;
}
