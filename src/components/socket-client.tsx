import { useContext, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { io, Socket } from "socket.io-client";
import { ACTIONS } from "@/store/Actions";
import { DataContext } from "@/store/GlobalState";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

export const SocketClient = () => {
    const { state, dispatch } = useContext(DataContext);
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const chatSocketRef = useRef<Socket | null>(null);
    const riderSocketRef = useRef<Socket | null>(null);

    const connectSockets = () => {
        if (!state?.token) return;

        // Clean up old sockets before creating new ones
        chatSocketRef.current?.disconnect();
        riderSocketRef.current?.disconnect();

        const newChatSocket = io(`${SOCKET_URL}/chat`, {
            transports: ["websocket"],
            auth: { token: `Bearer ${state?.token}` },
        });

        const newRiderSocket = io(`${SOCKET_URL}/rider-location`, {
            transports: ["websocket"],
            auth: { token: `Bearer ${state?.token}` },
        });

        newChatSocket.on("connect", () => {
            console.log("Connected to chat WebSocket");
            dispatch({ type: ACTIONS.SOCKET, payload: newChatSocket });
        });

        newRiderSocket.on("connect", () => {
            console.log("Connected to rider WebSocket");
            dispatch({ type: ACTIONS.RIDER_SOCKET, payload: newRiderSocket });
        });

        const handleError = (err: any) => console.error("WebSocket error:", err);
        newChatSocket.on("connect_error", handleError);
        newRiderSocket.on("connect_error", handleError);

        // Save to ref for cleanup
        chatSocketRef.current = newChatSocket;
        riderSocketRef.current = newRiderSocket;
    };

    // Initial connect on mount or token change
    useEffect(() => {
        if (!state?.token) return;

        connectSockets();

        return () => {
            chatSocketRef.current?.disconnect();
            riderSocketRef.current?.disconnect();
        };
    }, [state?.token]);

    // Listen for app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                console.log("App has come to the foreground. Reconnecting sockets...");
                connectSockets();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return null;
};
