import React, { useState, useMemo } from 'react';
import { User, Order, OrderStatus, Product, Seller, Courier, Chat } from '../types';
import InboxView from './InboxView';

interface BuyerDashboardProps {
    user: User;
    orders: Order[];
    products: Product[];
    sellers: Seller[];
    couriers: Courier[];
    chats: Chat[];
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
    users: User[];
    onSendMessage: (recipientId: string, messageText: string) => void;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = (props) => {
    const [view, setView] = useState<'orders' | 'inbox'>('orders');
    const { user, chats } = props;

    const unreadChatCount = useMemo(() => {
        return chats.filter(chat => {
            if (!chat.lastMessage) return false;
            const lastReadTimestamp = chat.lastRead?.[user.id] ? new Date(chat.lastRead[user.id]).getTime() : 0;
            const lastMessageTimestamp = new Date(chat.lastMessage.timestamp).getTime();
            return lastMessageTimestamp > lastReadTimestamp;
        }).length;
    }, [chats, user.id]);

    const renderContent = () => {
        switch (view) {
            case 'inbox':
                return <InboxView {...props} />;
            case 'orders':
            default:
                return <OrderHistoryView {...props} />;
        }
    };

    return (
        <div className="flex">
            <SideNav activeView={view} onNavigate={setView} unreadChatCount={unreadChatCount} />
            <main className="flex-grow p-4 sm:p-6 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

const SideNav: React.FC<{ activeView: string, onNavigate: (view: 'orders' | 'inbox') => void, unreadChatCount: number }> = ({ activeView, onNavigate, unreadChatCount }) => (
    <nav className="w-64 bg-white p-4 shadow-md rounded-lg flex-shrink-0">
        <h2 className="text-xl font-bold mb-6">My Account</h2>
        <ul>
            <NavItem label="Order History" view="orders" activeView={activeView} onNavigate={onNavigate} />
            <NavItem label="Inbox" view="inbox" activeView={activeView} onNavigate={onNavigate} count={unreadChatCount} />
        </ul>
    </nav>
);

const NavItem: React.FC<{ label: string, view: 'orders' | 'inbox', activeView: string, onNavigate: (view: 'orders' | 'inbox') => void, count?: number }> = ({ label, view, activeView, onNavigate, count }) => (
    <li className="mb-2">
        <button
            onClick={() => onNavigate(view)}
            className={`w-full text-left px-4 py-2 rounded-lg flex justify-between items-center transition-colors ${
                activeView === view ? 'bg-brand-blue text-white font-semibold' : 'hover:bg-gray-100'
            }`}
        >
            <span>{label}</span>
            {count > 0 && <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{count}</span>}
        </button>
    </li>
);

const OrderHistoryView: React.FC<BuyerDashboardProps> = ({ user, orders, products, sellers, couriers }) => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
                <p className="mt-2 text-lg text-gray-600">Welcome, <span className="font-semibold">{user.fullName}</span>!</p>
            </div>

            <div className="space-y-6">
                {orders.length > 0 ? orders.map(order => {
                    const product = products.find(p => p.id === order.productId);
                    const seller = sellers.find(s => s.id === order.sellerId);
                    const courier = couriers.find(c => c.id === order.courierId);
                    const imageUrl = product?.imageUrls?.[0] || 'https://via.placeholder.com/300';
                    return (
                         <div key={order.id} className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-md">
                            <div className="md:w-48 flex-shrink-0">
                                <img src={imageUrl} alt={product?.name} className="w-full h-48 md:h-full object-cover bg-gray-200"/>
                            </div>
                            <div className="flex-grow p-4 sm:p-5 flex flex-col justify-between w-full">
                                <div>
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 leading-tight">{product?.name || 'Product not found'}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Sold by <span className="font-semibold text-brand-blue">{seller?.name || 'Unknown Seller'}</span>
                                            </p>
                                            {courier && <p className="text-xs text-gray-500 mt-1">Shipped via: <span className="font-semibold">{courier.name}</span></p>}
                                        </div>
                                        <div className="flex-shrink-0">
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 mt-2 space-x-4 border-b pb-3">
                                        <span>Order ID: <span className="font-mono text-gray-800">#{order.id.substring(0,5)}...</span></span>
                                        <span>Placed on: <span className="font-medium">{new Date(order.orderDate).toLocaleString()}</span></span>
                                        <span>Total: <span className="font-bold text-gray-800">₱{order.totalPrice.toLocaleString()}</span></span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 space-x-4">
                                        {order.shippedDate && <span>Shipped: <span className="font-medium">{new Date(order.shippedDate).toLocaleString()}</span></span>}
                                        {order.deliveredDate && <span>Delivered: <span className="font-medium">{new Date(order.deliveredDate).toLocaleString()}</span></span>}
                                    </div>
                                </div>
                                <div className="mt-4">
                                     <OrderStatusTracker status={order.status} />
                                </div>
                            </div>
                        </div>
                    )
                }) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                       <p className="text-gray-500 font-semibold">You haven't placed any orders yet.</p>
                       <p className="text-sm text-gray-400 mt-2">Start shopping in the marketplace!</p>
                    </div>
                )}
            </div>
            <div>
                <h2 className="text-xl font-semibold">Your account status is: <span className="capitalize text-primary">{user.status}</span></h2>
                {user.status === 'pending' && <p className="text-yellow-600 bg-yellow-100 p-3 rounded-md mt-2">Your account is currently under review. We will notify you once the verification is complete.</p>}
            </div>
        </div>
    );
};


// Visual component for the order status progress
const OrderStatusTracker: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const statuses: OrderStatus[] = ['Processing', 'Awaiting Courier', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(status);

    if (status === 'Cancelled') {
        return (
            <div className="flex items-center space-x-2 text-red-600 font-semibold my-4 justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Order Cancelled</span>
            </div>
        )
    }

    return (
        <div className="w-full pt-2">
            <div className="flex items-center">
                {statuses.map((s, index) => (
                    <React.Fragment key={s}>
                        <div className="flex flex-col items-center text-center w-1/4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${index <= currentIndex ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
                                {index < currentIndex ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <span className="font-bold">{index + 1}</span>
                                )}
                            </div>
                            <p className={`text-xs mt-2 font-semibold ${index <= currentIndex ? 'text-primary' : 'text-gray-500'}`}>{s.replace(' ', '\n')}</p>
                        </div>
                        {index < statuses.length - 1 && (
                            <div className={`flex-grow h-1 transition-colors duration-300 ${index < currentIndex ? 'bg-primary' : 'bg-gray-300'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
};

// Visual component for the order status badge
const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const statusStyles: Record<OrderStatus, { text: string, bg: string }> = {
        Processing: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
        'Awaiting Courier': { text: 'text-blue-800', bg: 'bg-blue-100' },
        Shipped: { text: 'text-purple-800', bg: 'bg-purple-100' },
        Delivered: { text: 'text-green-800', bg: 'bg-green-100' },
        Cancelled: { text: 'text-red-800', bg: 'bg-red-100' },
    };
    const style = statusStyles[status] || { text: 'text-gray-800', bg: 'bg-gray-100' };
    return <span className={`text-xs font-bold capitalize px-3 py-1 rounded-full ${style.bg} ${style.text}`}>{status}</span>;
};

export default BuyerDashboard;