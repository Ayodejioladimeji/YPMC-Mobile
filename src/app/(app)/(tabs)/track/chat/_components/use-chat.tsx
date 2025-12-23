import { DataContext } from "@/store/GlobalState";
import { useContext, useEffect, useState } from "react";


export const UseChat = ({shippingId}: any) => {
    const { state, dispatch } = useContext(DataContext)


    useEffect(() => {
        if (!state?.token) return;
        // Request chat history when connected
        if(state?.socket){
            // console.log("get history emitted")
            state?.socket?.emit("getHistory", { shippingId, limit: 10 });
        }

    }, [shippingId, state?.token, state?.socket])
 
    // 

    return <></>;
};

export default UseChat
