import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/index";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const WSContext = createContext();

export const WSProvider = ({ children }) => {
    const socket = useRef(undefined);
    const [connected, setConnected] = useState(false);
    useEffect(() => {
        //console.log("Initializing WebSocket connection to:", SOCKET_URL);

        socket.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socket.current.on('connect', () => {
            console.log('WebSocket connected:', socket?.current?.id);
            setConnected(true);
        });

        socket.current.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        socket.current.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
        });
        on("ping", () => {
            //  console.log("Received ping from server");
            emit("pong", { message: "Pong from client!" });
        });
        return () => {
            //console.log("Cleaning up WebSocket connection");
            if (socket.current) {
                socket.current?.disconnect();
                setConnected(false);
                socket.current = undefined;
            }
        };
    }, []);

    const emit = (event, data) => {
        if (socket.current) {
            console.log(`Emitting event: ${event}`, data);
            socket.current?.emit(event, data);
        } else {
            console.warn(`Cannot emit ${event}: socket not connected`);
        }
    };

    const on = (event, cb) => {
        if (socket.current) {
            console.log(`Registering listener for: ${event}`);
            socket.current?.on(event, cb);
        } else {
            console.warn(`Cannot register listener for ${event}: socket not initialized`);
        }
    };

    const off = (event) => {
        if (socket.current) {
            console.log(`Removing listener for: ${event}`);
            socket.current?.off(event);
        }
    };



    const disconnect = () => {
        console.log("Manual disconnect called");

        if (socket.current) {
            socket.current?.disconnect();
            socket.current = undefined;
        }

    };


    const socketServices = {
        emit,
        on,
        off,
        disconnect,
        connected: connected,
    };

    return (
        <WSContext.Provider value={socketServices}>
            {children}
        </WSContext.Provider>
    );
};

export const useWS = () => {
    const socketContext = useContext(WSContext);
    // console.log("useWS called, isConnected:", typeof socketContext);
    // console.log("useWS called, isConnected:", Object.keys(socketContext));
    // console.log("useWS called, isConnected:", Object.values(socketContext));
    // console.log("useWS called, isConnected:", socketContext.isConnected());
    if (!socketContext) {
        throw new Error("useWS must be used within WSProvider");
    }
    return socketContext;
};