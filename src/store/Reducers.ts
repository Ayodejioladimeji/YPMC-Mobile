import { ACTIONS } from "./Actions";

const reducers = (state: any, action: any) => {
  const { type, payload } = action;
  switch (type) {
    case ACTIONS.USER:
      return {
        ...state,
        user: payload,
      };
    case ACTIONS.TOKEN:
      return {
        ...state,
        token: payload,
      };
    case ACTIONS.CALLBACK:
      return {
        ...state,
        callback: payload,
      };
    case ACTIONS.PROFILE_LOADING:
      return {
        ...state,
        profileLoading: payload,
      };
    case ACTIONS.ORDER_DATA:
      return {
        ...state,
        orderData: payload ? { ...state?.orderData, ...payload } : null,
      };

    case ACTIONS.MULTIPLE_DATA: {
      const newOrder = payload;

      // If payload is invalid, skip
      if (!newOrder || typeof newOrder !== 'object') {
        console.warn("Skipping invalid MULTIPLE_DATA payload:", newOrder);
        return state;
      }

      const existingData = Array.isArray(state.multipleData) ? state.multipleData : [];

      const alreadyExists = existingData.some(
        (item) => JSON.stringify(item) === JSON.stringify(newOrder)
      );

      return {
        ...state,
        multipleData: alreadyExists
          ? existingData
          : [...existingData, newOrder],
      };
    }


    case ACTIONS.CLEAR_MULTIPLE_DATA:
      return {
        ...state,
        multipleData: [], 
      };

    case ACTIONS.MULTIPLE_QUOTE_DATA:
      return {
        ...state,
        multipleQuoteData: payload
      };
    case ACTIONS.DELETE_DATA:
      return {
        ...state,
        multipleData: payload
      };
    case ACTIONS.QUOTE_DATA:
      return {
        ...state,
        quoteData: payload ? { ...state?.quoteData, ...payload } : null,
      };
    case ACTIONS.SHIPPING_ID:
      return {
        ...state,
        shippingId: payload,
      };
    case ACTIONS.AUTHORIZATION_URL:
      return {
        ...state,
        authorizationUrl: payload,
      };
    case ACTIONS.PROPOSED_RIDER:
      return {
        ...state,
        proposedRider: payload,
      };
    case ACTIONS.SHIPPING:
      return {
        ...state,
        shipping: payload,
      };
    case ACTIONS.SHIPPING_TYPE:
      return {
        ...state,
        shippingType: payload,
      };
    case ACTIONS.MESSAGE:
      return {
        ...state,
        message: payload,
      };
    case ACTIONS.REPLY:
      return {
        ...state,
        reply: payload,
      };
    case ACTIONS.VALIDATED:
      return {
        ...state,
        validated: payload,
      };
    case ACTIONS.REJECTED:
      return {
        ...state,
        rejected: payload,
      };
    case ACTIONS.ACCEPTED:
      return {
        ...state,
        accepted: payload,
      };
    case ACTIONS.RATE_LOADING:
      return {
        ...state,
        rateLoading: payload,
      };
    case ACTIONS.RIDER_DETAIL:
      return {
        ...state,
        riderDetail: payload,
      };
    case ACTIONS.SOCKET:
      return {
        ...state,
        socket: payload,
      };
    case ACTIONS.RIDER_SOCKET:
      return {
        ...state,
        riderSocket: payload,
      };
    case ACTIONS.CHATS:
      return {
        ...state,
        chats: payload,
      };
    case ACTIONS.RIDER_LOCATION:
      return {
        ...state,
        riderLocation: payload,
      };

    case ACTIONS.NEW_MESSAGE:
      return {
        ...state,
        chats: [...state.chats.filter(msg => msg.id !== payload.id), payload], // Add only if not already present
      };

    case ACTIONS.PENDING_ID:
      return {
        ...state,
        pendingId: payload,
      };
    case ACTIONS.MORE_ORDER:
      return {
        ...state,
        moreOrder: payload,
      };
    case ACTIONS.DEVICE_INFO:
      return {
        ...state,
        deviceInfo: payload,
      };
    case ACTIONS.NOTIFICATIONS:
      return {
        ...state,
        notifications: payload,
      };
    case ACTIONS.NOTIFICATION_CALLBACK:
      return {
        ...state,
        notificationCallback: payload,
      };
    case ACTIONS.RECONNECT:
      return {
        ...state,
        notificationCallback: payload,
      };
    case ACTIONS.MULTIPLE:
      return {
        ...state,
        multiple: payload,
      };
    case ACTIONS.PENDING_PAYMENT:
      return {
        ...state,
        pendingPayment: payload,
      };
    case ACTIONS.LOCATION:
      return {
        ...state,
        location: payload,
      };
    case ACTIONS.FIRST_TIME:
      return {
        ...state,
        firstTime: payload,
      };
    case ACTIONS.DELIVERY_MODE:
      return {
        ...state,
        deliveryMode: payload,
      };
    case ACTIONS.GENERAL_CALLBACK:
      return {
        ...state,
        generalCallback: payload,
      };
    default:
      return state;
  }
};

export default reducers;
