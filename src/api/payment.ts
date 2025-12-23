import { ApiResponse, axios_server } from ".";

export type WalletResponse = {
  transactionReference: string;
  reference: string;
  authorization_url: string;
  access_code: string;
};

export async function fundWallet({
  data,
  token,
}: {
  data: {
    amount: string;
    channel: string;
  };
  token: string;
}) {
  const _data = {
    amount: Number(data.amount),
    channel: data.channel,
  };
  const res = await axios_server.post<ApiResponse<WalletResponse>>(
    "/transactions/fund-wallet",
    _data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
}
