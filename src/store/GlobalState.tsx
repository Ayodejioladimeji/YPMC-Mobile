"use client";

import { createContext, useReducer, ReactNode } from "react";
import reducers from "./Reducers";

// Create the context with a default value
export const DataContext = createContext<any>(undefined);

// Define the type for the provider props
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const initialState = {
    user: null,
    token: null,
    callback: false,
    profileLoading:true,
    orderData:null,
    quoteData:null,
    shippingId:null,
    authorizationUrl:null,
    proposedRider:null, 
    shipping:null,
    shippingType:"basic",
    multipleData:[], 
    multipleQuoteData:[], 
    multiple:[], 
    message:null,
    reply:false,
    validated:false,
    rejected:false,
    accepted:false,
    rateLoading:true,
    riderDetail:null,
    chats:null,
    newMessage:null,
    socket:null,
    riderSocket:null,
    riderLocation:null,
    pendingId:null,
    moreOrder:false,
    deviceInfo:null,
    notifications:[],
    notificationCallback:false,
    reconnect:false, 
    pendingPayment:false,
    location:null,
    firstTime:false,
    deliveryMode:false,
    generalCallback:false
  };

  const [state, dispatch] = useReducer(reducers, initialState);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};
