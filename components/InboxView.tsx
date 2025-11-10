import React, { useState, useEffect, useRef } from 'react';
import { Chat, User, Message } from '../types';
import { db } from './firebaseConfig';
import { ref, onValue, off, DataSnapshot, update, serverTimestamp } from 'firebase/database';

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

interface InboxViewProps {
    user: User;
    users: User[];
    chats: Chat[];
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
    onSendMessage: (recipientId: string, messageText: string) => void;
}

const InboxView: React.FC<InboxViewProps> = (props) => {
    const { user, users, chats, activeChatId, setActiveChatId, onSendMessage } = props;
    const [isContactingAdmin, setIsContactingAdmin] = useState(false);
    
    const sortedChats = [...chats].sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return timeB - timeA;
    });

    const getOtherParticipant = (chat: Chat) => {
        const otherId = Object.keys(chat.participants).find(id => id !== user.id);
        return users.find(u => u.id === otherId);
    };
    
    const handleAdminContact = (admin: User) => {
        onSendMessage(admin.id, `Hello, I have a question.`);
        const chatId = [user.id, admin.id].sort().join('_');
        setActiveChatId(chatId);
        setIsContactingAdmin(false);
    };

    return (
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-md overflow-hidden">
            {/* Left Pane: Conversation List */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Inbox</h2>
                     <button 
                        onClick={() => setIsContactingAdmin(true)} 
                        className="w-full mt-2 text-sm bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                        Contact an Admin
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {sortedChats.map(chat => {
                        const otherUser = getOtherParticipant(chat);
                        const isUnread = chat.lastMessage && new Date(chat.lastMessage.timestamp).getTime() > (chat.lastRead?.[user.id] ? new Date(chat.lastRead[user.id]).getTime() : 0);
                        return (
                            <button
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${activeChatId === chat.id ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex justify-between items-center">
                                    <p className={`font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{otherUser?.fullName || 'Unknown'}</p>
                                    {isUnread && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>}
                                </div>
                                <p className={`text-sm truncate ${isUnread ? 'font-bold text-gray-700' : 'text-gray-500'}`}>
                                    {chat.lastMessage?.text || 'No messages yet.'}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Pane: Chat Window */}
            <div className="w-2/3 flex flex-col">
                {activeChatId ? (
                    <ChatWindow 
                        chatId={activeChatId} 
                        currentUser={user} 
                        onSendMessage={onSendMessage} 
                        otherUser={getOtherParticipant(chats.find(c => c.id === activeChatId)!)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>

            {isContactingAdmin && (
                <AdminContactModal 
                    onClose={() => setIsContactingAdmin(false)}
                    admins={users.filter(u => u.role === 'admin')}
                    onSelectAdmin={handleAdminContact}
                />
            )}
        </div>
    );
};


interface ChatWindowProps {
    chatId: string;
    currentUser: User;
    otherUser: User | undefined;
    onSendMessage: (recipientId: string, messageText: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, currentUser, otherUser, onSendMessage }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const messagesRef = ref(db, `chats/${chatId}/messages`);
        
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            setMessages(snapshotToMessagesArray(snapshot));
            setIsLoading(false);
            
            // Mark chat as read
            const lastReadRef = ref(db, `chats/${chatId}/lastRead/${currentUser.id}`);
            update(ref(db), {[`chats/${chatId}/lastRead/${currentUser.id}`]: serverTimestamp()});
        });
        
        return () => off(messagesRef);
    }, [chatId, currentUser.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !otherUser) return;
        onSendMessage(otherUser.id, newMessage);
        setNewMessage('');
    };

    return (
        <>
            <div className="p-4 border-b font-bold text-lg">{otherUser?.fullName || 'Chat'}</div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                {isLoading ? <p>Loading messages...</p> : messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md px-4 py-2 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-brand-blue text-white rounded-br-none' : 'bg-white border rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t bg-white">
                <div className="flex items-center space-x-2">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-brand-blue" />
                    <button type="submit" className="bg-brand-blue text-white rounded-full p-2.5 hover:bg-brand-blue/90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </div>
            </form>
        </>
    );
};

const AdminContactModal: React.FC<{ onClose: () => void, admins: User[], onSelectAdmin: (admin: User) => void }> = ({ onClose, admins, onSelectAdmin }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">Contact an Admin</h2>
                <button onClick={onClose}>&times;</button>
            </div>
            <div className="p-4">
                <p className="text-sm mb-2">Select an admin to start a conversation:</p>
                <ul>
                    {admins.map(admin => (
                        <li key={admin.id}>
                            <button onClick={() => onSelectAdmin(admin)} className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                                {admin.fullName}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);


export default InboxView;