import axios from "axios";

export type ApiResponse<T = undefined> = {
  statusCode: number;
  message: string;
  data: T extends undefined ? undefined : T;
};

export const BASE_URL = "https://api.ypmcommunity.com/api/v1";

export const axios_server = axios.create({ baseURL: BASE_URL });
