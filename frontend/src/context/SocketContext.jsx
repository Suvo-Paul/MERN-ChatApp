import { useAppStore } from '@/store';
import { HOST } from '@/utils/constants';
import React, { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const socket = useRef();

    const { userInfo } = useAppStore();

    useEffect(() => {
        if (userInfo) {
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id }
            });

            socket.current.on("connect", () => {
                console.log("Connected to socket server")
            });

            const handleRecieveMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage, addContactsInDMContacts } = useAppStore.getState();

                if (selectedChatType !== undefined && (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id)) {
                    // console.log("Message recieved", message);

                    addMessage(message);
                }
                addContactsInDMContacts(message);
            };

            const handleRecieveChannleMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage, addChannelInChannelList } = useAppStore.getState();

                if (selectedChatType !== undefined && selectedChatData._id === message.channelId) {
                    addMessage(message);
                }
                addChannelInChannelList(message);
            }

            socket.current.on("receiveMessage", handleRecieveMessage);

            socket.current.on("receive-channel-message", handleRecieveChannleMessage);

            return () => {
                socket.current.disconnect();
            }
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    )
}