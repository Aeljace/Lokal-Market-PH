import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { Seller, User, Message } from '../types';
import { db } from './firebaseConfig';
import { ref, onValue, off, DataSnapshot } from 'firebase/database';

// Helper to convert RTDB snapshot with timestamps to a sorted array of messages
const snapshotToMessagesArray = (snapshot: DataSnapshot): Message[] => {
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
        id: key,
        senderId: data[key].senderId,
        text: data[key].text,
        timestamp: new Date(data[key].timestamp).toISOString(),
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: Seller;
  currentUser: User | null;
  onSendMessage: (sellerId: string, messageText: string) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, seller, currentUser, onSendMessage }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let messagesRef: any;
        if (!isOpen || !currentUser) {
            // Detach listener if modal is closed or user logs out
            if (currentUser) {
                const chatId = [currentUser.id, seller.id].sort().join('_');
                messagesRef = ref(db, `chats/${chatId}/messages`);
                off(messagesRef);
            }
            setMessages([]); // Clear messages on close
            return;
        }

        setIsLoading(true);
        const chatId = [currentUser.id, seller.id].sort().join('_');
        messagesRef = ref(db, `chats/${chatId}/messages`);

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const fetchedMessages = snapshotToMessagesArray(snapshot);
            setMessages(fetchedMessages);
            setIsLoading(false);
        });

        // Cleanup function to detach the listener when the component unmounts or dependencies change
        return () => {
            off(messagesRef);
        };

    }, [isOpen, currentUser, seller.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentUser) return;
        
        onSendMessage(seller.id, newMessage);
        setNewMessage('');
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Chat with ${seller.name}`}>
            <div className="flex flex-col h-[60vh] max-h-[500px]">
                {/* Message Display Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white rounded-t-lg">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-gray-500">Loading chat history...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                           <p className="text-gray-500 text-center px-4">No messages yet. Send a message to start the conversation!</p>
                        </div>
                    ) : (
                        messages.map(message => (
                            <div key={message.id} className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                                    message.senderId === currentUser?.id
                                    ? 'bg-brand-blue text-white rounded-br-none' 
                                    : 'bg-gray-200 text-dark-gray rounded-bl-none'
                                }`}>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={currentUser ? "Type your message..." : "Please log in to chat"}
                            className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-brand-blue focus:border-brand-blue transition"
                            autoComplete="off"
                            disabled={!currentUser}
                        />
                        <button
                            type="submit"
                            disabled={!currentUser || newMessage.trim() === ''}
                            className="bg-brand-blue text-white rounded-full p-2.5 hover:bg-brand-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue flex-shrink-0 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ChatModal;