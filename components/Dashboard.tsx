import React, { useState, useEffect } from 'react';
import { User, Order, Product, Commission, UserStatus, ProductStatus, Seller, Courier, Notification, ProductData, Chat, ScamReport, ScamReportStatus } from '../types';
import AdminDashboard from './AdminDashboard';
import SellerDashboard from './SellerDashboard';
import BuyerDashboard from './BuyerDashboard';

interface DashboardProps {
    user: User;
    users: User[];
    orders: Order[];
    products: Product[];
    sellers: Seller[];
    commissions: Commission[];
    couriers: Courier[];
    notifications: Notification[];
    chats: Chat[];
    scamReports: ScamReport[];
    onUpdateUserStatus: (userId: string, newStatus: UserStatus) => void;
    onUpdateProductStatus: (productId: string, newStatus: ProductStatus) => void;
    onAddNewProduct: (productData: ProductData, sellerId: string) => Promise<boolean>;
    onUpdateProduct: (productId: string, productData: ProductData) => Promise<boolean>;
    onOrderUpdate: (orderId: string, updates: Partial<Order>) => void;
    onCourierUpdate: (courierData: Omit<Courier, 'id'>, courierId?: string) => Promise<boolean>;
    onCourierDelete: (courierId: string) => void;
    onSellerShipOrder: (orderId: string, courierName: string, trackingNumber: string) => void;
    onRequestRider: (order: Order) => void;
    onPayCommission: (commissionId: string, paymentProofFile: File) => Promise<boolean>;
    onCommissionVerification: (commissionId: string, isApproved: boolean) => void;
    onSendMessage: (recipientId: string, messageText: string) => void;
    onUpdateScamReportStatus: (reportId: string, newStatus: ScamReportStatus) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { user, users, orders, products, sellers, commissions, couriers, chats, onSendMessage, onUpdateUserStatus, onUpdateProductStatus, onAddNewProduct, onUpdateProduct, onOrderUpdate, onCourierUpdate, onCourierDelete, onSellerShipOrder, onRequestRider, onPayCommission, onCommissionVerification, scamReports, onUpdateScamReportStatus } = props;
    
    // State to manage which chat is currently active in the inbox view
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    
    // When the user clicks a notification for an unread chat, we want to open it.
    useEffect(() => {
        const unreadChats = chats.filter(chat => {
            // FIX: Add a guard to ensure lastMessage exists before accessing its timestamp.
            if (!chat.lastMessage) {
                return false;
            }
            const lastReadTimestamp = chat.lastRead?.[user.id] ? new Date(chat.lastRead[user.id]).getTime() : 0;
            const lastMessageTimestamp = new Date(chat.lastMessage.timestamp).getTime();
            return lastMessageTimestamp > lastReadTimestamp;
        });
        
        // If there's no active chat, default to opening the first unread one.
        if (!activeChatId && unreadChats.length > 0) {
            setActiveChatId(unreadChats[0].id);
        }
    }, [chats, user.id, activeChatId]);

    switch(user.role) {
        case 'admin':
            return <AdminDashboard 
                        user={user} 
                        users={users} 
                        products={products} 
                        orders={orders} 
                        onUpdateUserStatus={onUpdateUserStatus} 
                        commissions={commissions} 
                        onUpdateProductStatus={onUpdateProductStatus} 
                        couriers={couriers} 
                        onCourierUpdate={onCourierUpdate} 
                        onCourierDelete={onCourierDelete} 
                        onOrderUpdate={onOrderUpdate}
                        onAddNewProduct={onAddNewProduct}
                        onUpdateProduct={onUpdateProduct}
                        onCommissionVerification={onCommissionVerification}
                        scamReports={scamReports}
                        onUpdateScamReportStatus={onUpdateScamReportStatus}
                    />;
        case 'seller':
            const sellerCommissions = commissions.filter(c => c.sellerId === user.id);
            const sellerOrders = orders.filter(o => o.sellerId === user.id);
            const sellerProducts = products.filter(p => p.sellerId === user.id);
            let thisSeller = sellers.find(s => s.id === user.id);

            if (!thisSeller) {
                thisSeller = {
                    id: user.id,
                    name: user.penName || user.fullName,
                    isVerified: user.status === 'approved',
                    bannerUrl: `https://picsum.photos/seed/${user.id}/1200/400`,
                };
            }

            return <SellerDashboard 
                        user={user} 
                        orders={sellerOrders} 
                        products={sellerProducts} 
                        commissions={sellerCommissions} 
                        chats={chats}
                        activeChatId={activeChatId}
                        setActiveChatId={setActiveChatId}
                        onAddNewProduct={onAddNewProduct}
                        onUpdateProduct={onUpdateProduct}
                        onUpdateProductStatus={onUpdateProductStatus} 
                        onOrderUpdate={onOrderUpdate} 
                        users={users} 
                        onSellerShipOrder={onSellerShipOrder} 
                        onRequestRider={onRequestRider} 
                        onPayCommission={onPayCommission}
                        onSendMessage={onSendMessage}
                    />;
        case 'buyer':
            const buyerOrders = orders.filter(o => o.buyerId === user.id);
            return <BuyerDashboard 
                        user={user} 
                        orders={buyerOrders} 
                        products={products} 
                        sellers={sellers} 
                        couriers={couriers}
                        chats={chats}
                        activeChatId={activeChatId}
                        setActiveChatId={setActiveChatId}
                        users={users}
                        onSendMessage={onSendMessage}
                    />;
        default:
            return <div>Invalid user role.</div>;
    }
};

export default Dashboard;