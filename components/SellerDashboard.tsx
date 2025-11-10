import React, { useState, useMemo } from 'react';
import { User, Order, OrderStatus, Commission, Product, ProductStatus, ProductData, CommissionStatus, Chat } from '../types';
import ShipOrderModal from './ShipOrderModal';
import ProductEditModal from './ProductEditModal';
import ProductImportModal from './ProductImportModal';
import CommissionPaymentModal from './CommissionPaymentModal';
import InboxView from './InboxView';

type SellerDashboardView = 'dashboard' | 'myProducts' | 'sales' | 'commissions' | 'inbox';

interface SellerDashboardProps {
    user: User;
    orders: Order[];
    products: Product[];
    users: User[];
    commissions: Commission[];
    chats: Chat[];
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
    onUpdateProductStatus: (productId: string, newStatus: ProductStatus) => void;
    onAddNewProduct: (productData: ProductData, sellerId: string) => Promise<boolean>;
    onUpdateProduct: (productId: string, productData: ProductData) => Promise<boolean>;
    onOrderUpdate: (orderId: string, updates: Partial<Order>) => void;
    onSellerShipOrder: (orderId: string, courierName: string, trackingNumber: string) => void;
    onRequestRider: (order: Order) => void;
    onPayCommission: (commissionId: string, paymentProofFile: File) => Promise<boolean>;
    onSendMessage: (recipientId: string, messageText: string) => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = (props) => {
    const [view, setView] = useState<SellerDashboardView>('dashboard');
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const { user, chats } = props;
    const isSuspended = user.status === 'suspended';

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
            case 'myProducts':
                return <MyProductsView {...props} onBack={() => setView('dashboard')} onOpenImport={() => setImportModalOpen(true)} />;
            case 'sales':
                return <SalesView {...props} onBack={() => setView('dashboard')} />;
            case 'commissions':
                return <CommissionsView {...props} onBack={() => setView('dashboard')} />;
            case 'inbox':
                return <InboxView {...props} />;
            case 'dashboard':
            default:
                return <DashboardHome {...props} onNavigate={setView} unreadChatCount={unreadChatCount} />;
        }
    };
    
    return (
        <>
            <div className="flex">
                <SideNav activeView={view} onNavigate={setView} unreadChatCount={unreadChatCount} />
                <main className="flex-grow p-4 sm:p-6 md:p-8">
                    {isSuspended && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6" role="alert">
                            <p className="font-bold">Account Suspended</p>
                            <p>Your account is currently disabled due to overdue commission payments. Please settle your outstanding balance to restore full access.</p>
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>
            <ProductImportModal 
                isOpen={isImportModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={async (productsToImport) => {
                    for (const productData of productsToImport) {
                        await props.onAddNewProduct(productData, props.user.id);
                    }
                    alert(`${productsToImport.length} products have been imported and are pending approval.`);
                    setImportModalOpen(false);
                }}
                user={props.user}
            />
        </>
    );
};

const SideNav: React.FC<{ activeView: string, onNavigate: (view: SellerDashboardView) => void, unreadChatCount: number }> = ({ activeView, onNavigate, unreadChatCount }) => (
    <nav className="w-64 bg-white p-4 shadow-md rounded-lg flex-shrink-0">
        <h2 className="text-xl font-bold mb-6">Seller Menu</h2>
        <ul>
            <NavItem label="Dashboard" view="dashboard" activeView={activeView} onNavigate={onNavigate} />
            <NavItem label="My Products" view="myProducts" activeView={activeView} onNavigate={onNavigate} />
            <NavItem label="Sales & Orders" view="sales" activeView={activeView} onNavigate={onNavigate} />
            <NavItem label="Commissions" view="commissions" activeView={activeView} onNavigate={onNavigate} />
            <NavItem label="Inbox" view="inbox" activeView={activeView} onNavigate={onNavigate} count={unreadChatCount} />
        </ul>
    </nav>
);

const NavItem: React.FC<{ label: string, view: SellerDashboardView, activeView: string, onNavigate: (view: SellerDashboardView) => void, count?: number }> = ({ label, view, activeView, onNavigate, count }) => (
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

const DashboardHome: React.FC<SellerDashboardProps & { onNavigate: (view: SellerDashboardView) => void, unreadChatCount: number }> = ({ user, onNavigate, products, orders, commissions, unreadChatCount }) => {
    const unpaidCommissions = commissions.filter(c => c.status === 'unpaid');
    const totalUnpaid = unpaidCommissions.reduce((sum, c) => sum + c.amount, 0);

    return (
         <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
                <p className="mt-2 text-lg text-gray-600">Welcome back, <span className="font-semibold">{user.fullName}</span>!</p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Products" value={products.length} />
                <StatCard title="Active Listings" value={products.filter(p => p.status === 'available').length} />
                <StatCard title="Unread Messages" value={unreadChatCount} />
                <StatCard title="Unpaid Commissions" value={`₱${totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            </div>
             <div className="border-t pt-6">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => onNavigate('myProducts')} className="bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-blue/90 transition text-center">Manage My Products</button>
                    <button onClick={() => onNavigate('sales')} className="bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition text-center">View Sales & Orders</button>
                    <button onClick={() => onNavigate('commissions')} className="bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition text-center">View Commissions</button>
                    <button onClick={() => onNavigate('inbox')} className="bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition text-center relative">
                        Go to Inbox
                        {unreadChatCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{unreadChatCount}</span>}
                    </button>
                </div>
            </div>
         </div>
    )
};

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-gray-50 p-6 rounded-xl border">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
);


const MyProductsView: React.FC<SellerDashboardProps & { onBack: () => void; onOpenImport: () => void; }> = ({ user, onBack, products, onUpdateProductStatus, onAddNewProduct, onUpdateProduct, onOpenImport }) => {
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const isSuspended = user.status === 'suspended';

    const handleOpenEditModal = (product: Product | null) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleSaveProduct = (productData: ProductData, productId?: string) => {
        if (productId) {
            return onUpdateProduct(productId, productData);
        } else {
            return onAddNewProduct(productData, user.id);
        }
    };

    return (
        <>
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={onOpenImport} disabled={isSuspended} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            Import Products
                        </button>
                        <button onClick={() => handleOpenEditModal(null)} disabled={isSuspended} className="bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-blue/90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            Add New Product
                        </button>
                    </div>
                </div>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col bg-white">
                                <img src={product.imageUrls?.[0] || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-40 object-cover bg-gray-200" />
                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                        <ProductStatusBadge status={product.status} />
                                    </div>
                                    <p className="text-secondary font-semibold mt-1">₱{product.price.toLocaleString()}</p>
                                    <p className={`text-xs mt-1 font-semibold ${product.stock <= 0 ? 'text-red-600' : product.stock <= 5 ? 'text-orange-600' : 'text-gray-500'}`}>{product.stock} in stock</p>
                                    <div className="mt-auto pt-4 space-y-3">
                                        <ProductVisibilityToggle product={product} onUpdateStatus={onUpdateProductStatus} disabled={isSuspended} />
                                        <button 
                                            onClick={() => handleOpenEditModal(product)}
                                            disabled={isSuspended}
                                            className="w-full text-center text-sm font-semibold bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Edit Product
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50">
                        <p className="text-gray-500 font-semibold">You haven't added any products yet.</p>
                        <button onClick={() => handleOpenEditModal(null)} disabled={isSuspended} className="mt-2 text-brand-blue font-semibold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed">
                            Add your first product
                        </button>
                    </div>
                )}
            </div>
            <ProductEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveProduct}
                product={selectedProduct}
                user={user}
            />
        </>
    );
};

const ProductStatusBadge: React.FC<{ status: ProductStatus }> = ({ status }) => {
    const statusStyles: Record<ProductStatus, { text: string, bg: string }> = {
        pending_approval: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
        rejected: { text: 'text-red-800', bg: 'bg-red-100' },
        available: { text: 'text-green-800', bg: 'bg-green-100' },
        unavailable: { text: 'text-gray-800', bg: 'bg-gray-200' },
        sold: { text: 'text-gray-800', bg: 'bg-gray-100' },
    };
    const style = statusStyles[status] || { text: 'text-gray-800', bg: 'bg-gray-100' };
    const label = status.replace('_', ' ');

    return <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-0.5 capitalize ${style.bg} ${style.text}`}>{label}</span>;
};

const ProductVisibilityToggle: React.FC<{ product: Product, onUpdateStatus: (id: string, status: ProductStatus) => void, disabled: boolean }> = ({ product, onUpdateStatus, disabled }) => {
    const canToggle = (product.status === 'available' || product.status === 'unavailable') && !disabled;
    const isVisible = product.status === 'available';

    const handleToggle = () => {
        if (!canToggle) return;
        const newStatus = isVisible ? 'unavailable' : 'available';
        onUpdateStatus(product.id, newStatus);
    };

    return (
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
            <span className={`text-sm font-medium ${canToggle ? 'text-gray-700' : 'text-gray-400'}`}>
                {isVisible ? 'Shown' : 'Hidden'} in Marketplace
            </span>
            <button
                type="button"
                onClick={handleToggle}
                disabled={!canToggle}
                aria-label={isVisible ? "Hide product from marketplace" : "Show product in marketplace"}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:cursor-not-allowed ${isVisible ? 'bg-green-600' : 'bg-gray-300'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );
};

const SalesView: React.FC<SellerDashboardProps & { onBack: () => void; }> = ({ onBack, orders, products, users, onSellerShipOrder, onRequestRider }) => {
    
    const [isShipModalOpen, setShipModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const getProductName = (id: string) => products.find(p => p.id === id)?.name || "Unknown";
    const getBuyerName = (id: string) => users.find(u => u.id === id)?.fullName || "Unknown";

    const handleOpenShipModal = (order: Order) => {
        setSelectedOrder(order);
        setShipModalOpen(true);
    };

    const handleConfirmShipment = (orderId: string, courierName: string, trackingNumber: string) => {
        onSellerShipOrder(orderId, courierName, trackingNumber);
        setShipModalOpen(false);
        setSelectedOrder(null);
    };

    const handleExport = () => {
        const headers = ['Order ID', 'Order Date', 'Shipped Date', 'Delivered Date', 'Product Name', 'Quantity', 'Total Price', 'Buyer Name', 'Status'];
        const rows = orders.map(order => [
            order.id,
            order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A',
            order.shippedDate ? new Date(order.shippedDate).toLocaleString() : 'N/A',
            order.deliveredDate ? new Date(order.deliveredDate).toLocaleString() : 'N/A',
            getProductName(order.productId),
            order.quantity,
            order.totalPrice,
            getBuyerName(order.buyerId),
            order.status
        ]);
    
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales-export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderActions = (order: Order) => {
        switch(order.status) {
            case 'Processing':
                return (
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={() => handleOpenShipModal(order)} className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md transition">Ship Order</button>
                        <button onClick={() => onRequestRider(order)} className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition">Request Rider</button>
                    </div>
                );
            case 'Awaiting Courier':
                return <p className="text-sm font-semibold text-blue-700">Admin Notified</p>;
            case 'Shipped':
                return (
                     <div>
                        <p className="text-sm font-semibold text-purple-700">Shipped</p>
                        {order.courierName && <p className="text-xs text-gray-500">{order.courierName}</p>}
                        {order.trackingNumber && <p className="text-xs font-mono text-gray-500">{order.trackingNumber}</p>}
                     </div>
                );
            case 'Delivered':
                 return <p className="text-sm font-semibold text-green-700">Completed</p>;
            default:
                return null;
        }
    };

    return (
        <>
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Sales & Orders</h2>
                <button onClick={handleExport} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    Export Sales to CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length > 0 ? orders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 align-top">
                                    <p className="text-sm font-semibold">{getProductName(order.productId)}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleString()}</p>
                                    <p className="text-xs font-mono text-gray-400 mt-1">{order.id}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-800 align-top">{getBuyerName(order.buyerId)}</td>
                                <td className="px-6 py-4 text-sm font-bold align-top">₱{order.totalPrice.toLocaleString()}</td>
                                <td className="px-6 py-4 align-top"><OrderStatusBadge status={order.status} /></td>
                                <td className="px-6 py-4 text-sm align-top">
                                    {renderActions(order)}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-10 text-gray-500">No sales yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        {selectedOrder && (
            <ShipOrderModal 
                isOpen={isShipModalOpen}
                onClose={() => setShipModalOpen(false)}
                onConfirmShipment={handleConfirmShipment}
                order={selectedOrder}
            />
        )}
        </>
    );
};

const CommissionsView: React.FC<SellerDashboardProps & { onBack: () => void }> = ({ onBack, commissions, products, onPayCommission }) => {
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

    const handlePayClick = (commission: Commission) => {
        setSelectedCommission(commission);
        setPaymentModalOpen(true);
    };

    const handleConfirmPayment = async (commissionId: string, paymentProofFile: File) => {
        const success = await onPayCommission(commissionId, paymentProofFile);
        if (success) {
            setPaymentModalOpen(false);
            setSelectedCommission(null);
        }
        return success;
    };

    const getProductName = (id: string) => products.find(p => p.id === id)?.name || "N/A";

    const sortedCommissions = [...commissions].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    return (
        <>
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">My Commissions</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedCommissions.length > 0 ? sortedCommissions.map(commission => {
                                const isOverdue = new Date(commission.dueDate) < new Date() && commission.status === 'unpaid';
                                return (
                                <tr key={commission.id} className={`${isOverdue ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{getProductName(commission.productId)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₱{commission.amount.toFixed(2)}</td>
                                    <td className={`px-6 py-4 text-sm ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-600'}`}>{new Date(commission.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4"><CommissionStatusBadge status={commission.status} /></td>
                                    <td className="px-6 py-4">
                                        {(commission.status === 'unpaid' || commission.status === 'rejected') && (
                                            <button onClick={() => handlePayClick(commission)} className="px-4 py-1 text-sm font-semibold text-white bg-primary rounded-md hover:bg-green-700 transition">
                                                {commission.status === 'rejected' ? 'Re-submit' : 'Pay Now'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}) : (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-500">You have no commissions yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedCommission && (
                <CommissionPaymentModal 
                    isOpen={isPaymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    commission={selectedCommission}
                    onConfirmPayment={handleConfirmPayment}
                />
            )}
        </>
    );
};


const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const statusStyles: Record<OrderStatus, { text: string, bg: string }> = {
        Processing: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
        'Awaiting Courier': { text: 'text-blue-800', bg: 'bg-blue-100' },
        Shipped: { text: 'text-purple-800', bg: 'bg-purple-100' },
        Delivered: { text: 'text-green-800', bg: 'bg-green-100' },
        Cancelled: { text: 'text-red-800', bg: 'bg-red-100' },
    };
    const style = statusStyles[status] || { text: 'text-gray-800', bg: 'bg-gray-100' };
    return <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-0.5 capitalize ${style.bg} ${style.text}`}>{status}</span>;
};

const CommissionStatusBadge: React.FC<{ status: CommissionStatus }> = ({ status }) => {
    const statusStyles: Record<CommissionStatus, { text: string, bg: string }> = {
        unpaid: { text: 'text-red-800', bg: 'bg-red-100' },
        pending_verification: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
        paid: { text: 'text-green-800', bg: 'bg-green-100' },
        rejected: { text: 'text-orange-800', bg: 'bg-orange-100' },
    };
    const style = statusStyles[status];
    return <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-0.5 capitalize ${style.bg} ${style.text}`}>{status.replace('_', ' ')}</span>;
};

export default SellerDashboard;