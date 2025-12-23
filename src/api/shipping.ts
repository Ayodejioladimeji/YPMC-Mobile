import { ApiResponse, axios_server } from ".";

export enum ShippingStatus {
  PENDING = "PENDING",
  RIDER_ASSIGNED = "RIDER_ASSIGNED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
}

export type PackageDetails = {
  packageName: string;
  packageSize: "SMALL" | "MEDIUM" | "LARGE";
  isSecurityShipping: boolean;
  isFragile: boolean;
  pickupStreet: string;
  pickupArea: string;
  pickupState: string;
  pickupLongitude: number;
  pickupLatitude: number;
  dropoffStreet: string;
  dropoffArea: string;
  dropoffState: string;
  dropoffLongitude: number;
  dropoffLatitude: number;
  senderName: string;
  senderPhoneNumber: string;
  receiverName: string;
  receiverPhoneNumber: string;
  pickupTime:any;
  pickupDate:any;
  deliveryTime:any
  deliveryDate:any
};

export type ShippingOrder = {
  id: string;
  packageDetails: {
    name: string;
    isFragile: boolean;
  };
  deliveryCode: string | null;
  orderInMultiShipping: string | null;
  pickupStreet: string;
  pickupArea: string;
  pickupState: string;
  pickupLocation: {
    type: string;
    coordinates: [number, number];
  };
  dropoffStreet: string;
  dropoffArea: string;
  dropoffState: string;
  dropoffLocation: {
    type: string;
    coordinates: [number, number];
  };
  distanceInKilometers: number | null;
  senderInfo: {
    name: string;
    contactInfo: { phoneNumber: string };
  };
  receiverInfo: {
    name: string;
    contactInfo: { phoneNumber: string };
  };
  estimatedPriceInKobo: string;
  actualPriceInNaira: string;
  actualPriceInKobo: string | null;
  trackingId: string;
  status: string;
  riderAssignmentStatus: string;
  isSecurityShipping: boolean;
  deliveryQuoteGenerated: boolean;
  estimatedPickupTime: string;
  actualPickupTime: string | null;
  estimatedDeliveryTime: string;
  actualDeliveryTime: string | null;
  riderStartTime: string | null;
  estimatedDuration: number;
  scheduleType: string;
  scheduledPickupTime: string | null;
  isScheduledShipping: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Rider = {
  averageRating: string;
  firstName: string;
  picture: string;
  id: string;
  lastName: string;
  status: string;
  user: any;
  vehiclePlateNumber: string;
  vehicleType: string;
  partnerCompany: string;
  actualPrice: number;
  totalActualPrice:number,
  distance:string,
  proximity:string
};

export async function createSingleShippingOrder({
  data,
  token,
}: {
  data: PackageDetails;
  token: string;
}) {
  const res = await axios_server.post<ApiResponse<ShippingOrder>>(
    "/shipping",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
}

export async function createMultipleShippingOrder({
  data,
  token,
}: {
  data: { shippings: PackageDetails[] };
  token: string;
}) {
  const res = await axios_server.post<ApiResponse<ShippingOrder[]>>(
    "/shipping/multiple",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
}

export async function getNearbyRiders({
  radius,
  shippingId,
  token,
}: {
  shippingId: string;
  radius: number;
  token: string;
}) {
  const res = await axios_server.get<ApiResponse<Rider[]>>(
    `/shipping/nearby-riders?shippingId=${shippingId}&radius=${radius}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
}
export async function assignRiderToShipping({
  shippingId,
  riderId,
  token,
}: {
  shippingId: string;
  riderId: string;
  token: string;
}) {
  const res = await axios_server.post<ApiResponse<ShippingOrder>>(
    `/shipping/${shippingId}/assign-rider/${riderId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
}

export async function getShippingOrders({ token }: { token: string }) {
  const res = await axios_server.get<ApiResponse<ShippingOrder[]>>(
    "/shipping/customer",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
}

export async function getShippingOrder({
  shippingId,
  token,
}: {
  shippingId: string;
  token: string;
}) {
  const res = await axios_server.get<ApiResponse<ShippingOrder>>(
    `/shipping/customer/${shippingId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
}
