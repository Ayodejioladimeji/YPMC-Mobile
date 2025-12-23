import { ACTIONS } from "@/store/Actions";
import { DataContext } from "@/store/GlobalState";
import { useContext, useEffect } from "react";

const UseLocation = ({ shippingId }: any) => {
    const { state, dispatch } = useContext(DataContext);

    useEffect(() => {
        if (!state?.riderSocket || !shippingId) return;

        // console.log("Emitting getRiderLocation for:");
        state.riderSocket.emit("getRiderLocation", { shippingId: shippingId });

    }, [state?.riderSocket, shippingId]);

    useEffect(() => {
        if (!state?.riderSocket) return;

        state.riderSocket.on("riderLocation", (location) => {
            dispatch({ type: ACTIONS.RIDER_LOCATION, payload: location });
        });

    }, [state?.riderSocket]);

    return <></>;
};

export default UseLocation;
