import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { Image } from "expo-image";

import Text from "@/components/ui/text";
import { colors, spacing } from "@/theme";
import TopNavigation from "@/components/TopNavigation";
import SafeAreaViews from "@/components/safe-area-view";
import { useContext, useEffect, useState } from "react";
import { GetRequest } from "@/utils/requests";
import { DataContext } from "@/store/GlobalState";
import Transactions from "@/components/account/transactions";

interface TransactionProps{
  status:string,
  transaction_type:string,
  card_details:any,
  card_brand:string,
  createdAt:string
  amountInNaira:number
  card_last4:string,
  shipping:any

}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<any>(null)
  const { state } = useContext(DataContext)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 30;
  const [status, setStatus] = useState("ALL")


  // get transactions
  useEffect(() => {
    if (state?.token) {
      const fetchInitialTransactions = async () => {
        setLoading(true);
        
        const endpoint = status === "ALL"
          ? `/transactions?page=${page}&limit=50`
          : `/transactions?page=${page}&status=${status}&limit=50`;

        const res = await GetRequest(endpoint, state.token);

        if (res?.status === 200 || res?.status === 201) {
          setTransactions(res?.data?.data)
          // setTransactions((prev: any) => [...(prev || []), ...res?.data?.data])
          setTotal(res.data.total);
        }
        setLoading(false);
        setIsLoadingMore(true);
      };
      fetchInitialTransactions();
    }
  }, [state?.token, state?.callback]);

  const fetchMoreData = () => {
    if (transactions.length < total && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  // 

  return (
    <SafeAreaViews>
      <TopNavigation title="Transaction History" />

      {loading ? <ActivityIndicator color={colors.primary} style={{marginTop:50}} />
        :
        <>
          {transactions?.length === 0 ? <View style={styles.emptyStateStyle}>
            <Image
              source={require("@/assets/images/empty-wallet.png")}
              style={{
                width: 184,
                height: 184,
              }}
            />

            <Text style={{ fontSize: 16, marginTop: spacing.md, color: "#636363" }}>
              No transactions found
            </Text>
          </View>
            :
            <Transactions data={transactions} isLoading={isLoadingMore} fetchMoreData={fetchMoreData} setLoading={setLoading} setStatus={setStatus} status={status}/>
            }
        </>
      }

    </SafeAreaViews>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: "#fff",
  },
  emptyStateStyle: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 70
  },
});
