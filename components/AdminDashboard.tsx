import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Product, VerificationDocs, Commission, UserStatus, ProductStatus, Seller, Courier, Order, ProductData, CommissionStatus, ScamReport, ScamReportStatus } from '../types';
import AddAdminModal from './AddAdminModal';
import ApplicantDetailsModal from './ApplicantDetailsModal';
import CourierModal from './CourierModal';
import ProductEditModal from './ProductEditModal';
import ChartComponent from './ChartComponent';
import ScamReportDetailsModal from './ScamReportDetailsModal';


// Icons
const UsersIcon = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9 5.197" /></svg>
);
const PendingIcon = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ShippingIcon = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-9m17.25 9v-9m-17.25-1.5a1.5 1.5 0 013 0m-3 0a1.5 1.5 0 003 0m-12 6H4.5" />
    </svg>
);
const ProductIcon = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
);
const VerificationCheckIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
const WarningIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.008a1 1 0 011 1v3.083a1 1 0 01-1 1H9a1 1 0 01-1-1V5z" clipRule="evenodd" />
    </svg>
);
const PlusIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);
const CommissionIcon = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v-.75A.75.75 0 015.25 4.5h-.75m0 0H3.75m9 13.5h.008v.008H12.75v-.008zM12 15h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75v-.008zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5v-.008zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
);



interface AdminDashboardProps {
    user: User;
    users: User[];
    products: Product[];
    orders: Order[];
    onUpdateUserStatus: (userId: string, newStatus: UserStatus) => void;
    commissions: Commission[];
    onAddNewProduct: (productData: ProductData, sellerId: string) => Promise<boolean>;
    onUpdateProduct: (productId: string, productData: ProductData) => Promise<boolean>;
    onUpdateProductStatus: (productId: string, newStatus: ProductStatus) => void;
    couriers: Courier[];
    onCourierUpdate: (courierData: Omit<Courier, 'id'>, courierId?: string) => Promise<boolean>;
    onCourierDelete: (courierId: string) => void;
    onOrderUpdate: (orderId: string, updates: Partial<Order>) => void;
    onCommissionVerification: (commissionId: string, isApproved: boolean) => void;
    scamReports: ScamReport[];
    onUpdateScamReportStatus: (reportId: string, newStatus: ScamReportStatus) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string; }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { user, users, products, orders, onUpdateUserStatus, commissions, onAddNewProduct, onUpdateProduct, onUpdateProductStatus, couriers, onCourierUpdate, onCourierDelete, onOrderUpdate, onCommissionVerification, scamReports, onUpdateScamReportStatus } = props;
    const [activeTab, setActiveTab] = useState('overview');
    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isCourierModalOpen, setCourierModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
    const [selectedReport, setSelectedReport] = useState<ScamReport | null>(null);
    const [isReportModalOpen, setReportModalOpen] = useState(false);


    const pendingUsers = users.filter(u => u.status === 'pending');
    const allUsers = users.filter(u => u.role !== 'admin');
    const sellers = users.filter(u => u.role === 'seller');
    const pendingProducts = products.filter(p => p.status === 'pending_approval');
    const shippingRequests = orders.filter(o => o.shippingMethod === 'lokal-market' && o.status === 'Awaiting Courier');
    const pendingVerifications = commissions.filter(c => c.status === 'pending_verification');
    const pendingScamReports = scamReports.filter(r => r.status === 'pending');

    const handleAddAdmin = async (newAdminData: { fullName: string, email: string, phone: string }) => {
        alert("Adding admins from the client-side is disabled for security. Please use the Firebase Admin SDK in a secure environment.");
        setAddAdminModalOpen(false);
    };
    
    const handleOpenEditModal = (product: Product | null) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleSaveProduct = (productData: ProductData, productId?: string) => {
        // The modal will handle closing itself upon success of this async operation.
        if (productId) {
            return onUpdateProduct(productId, productData);
        } else {
            return onAddNewProduct(productData, user.id);
        }
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setDetailsModalOpen(true);
    };
    
    const handleViewReport = (report: ScamReport) => {
        setSelectedReport(report);
        setReportModalOpen(true);
    };

    const handleOpenCourierModal = (courier: Courier | null = null) => {
        setSelectedCourier(courier);
        setCourierModalOpen(true);
    };
    
    const renderContent = () => {
        switch(activeTab) {
            case 'overview':
                return <DashboardOverview users={allUsers} products={products} commissions={commissions} />;
            case 'applicants':
                return <UserTable title="Pending Applications" users={pendingUsers} onViewUser={handleViewUser} onUpdateUserStatus={onUpdateUserStatus} />;
            case 'shippingRequests':
                return <ShippingRequestsView orders={shippingRequests} couriers={couriers} onOrderUpdate={onOrderUpdate} users={users} products={products} />;
            case 'productApprovals':
                return <ProductApprovalList products={pendingProducts} onUpdateStatus={onUpdateProductStatus} sellers={sellers} />;
            case 'commissions':
                return <CommissionsManagementView commissions={commissions} users={users} products={products} onVerification={onCommissionVerification} onUpdateUserStatus={onUpdateUserStatus} />;
            case 'scamReports':
                return <ScamReportsView reports={scamReports} onViewDetails={handleViewReport} />;
            case 'manageCouriers':
                return <CourierManagementView couriers={couriers} onEdit={handleOpenCourierModal} onDelete={onCourierDelete} />;
            case 'allProducts':
                return <ProductList title="All Products" products={products} sellers={sellers} onEdit={handleOpenEditModal} onUpdateStatus={onUpdateProductStatus} />;
            case 'allUsers':
                return <UserTable title="All Platform Users" users={allUsers} onViewUser={handleViewUser} onUpdateUserStatus={onUpdateUserStatus} />;
            default:
                return <div className="p-6 bg-white rounded-lg shadow-md mt-4"><p>Content for {activeTab} coming soon.</p></div>
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage user applications and platform operations.</p>
                </div>
                <div className="flex items-center space-x-2">
                     <button onClick={() => handleOpenCourierModal()} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center space-x-2">
                        <PlusIcon />
                        <span>Add Courier</span>
                    </button>
                    <button onClick={() => handleOpenEditModal(null)} className="bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-blue/90 transition flex items-center space-x-2 shadow-sm">
                        <PlusIcon />
                        <span>Add New Product</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    <TabButton title="Overview" count={allUsers.length} isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <TabButton title="Applicants" count={pendingUsers.length} isActive={activeTab === 'applicants'} onClick={() => setActiveTab('applicants')} />
                    <TabButton title="Shipping Requests" count={shippingRequests.length} isActive={activeTab === 'shippingRequests'} onClick={() => setActiveTab('shippingRequests')} />
                    <TabButton title="Product Approvals" count={pendingProducts.length} isActive={activeTab === 'productApprovals'} onClick={() => setActiveTab('productApprovals')} />
                    <TabButton title="Commissions" count={commissions.length} isActive={activeTab === 'commissions'} onClick={() => setActiveTab('commissions')} />
                    <TabButton title="Scam Reports" count={pendingScamReports.length} isActive={activeTab === 'scamReports'} onClick={() => setActiveTab('scamReports')} />
                    <TabButton title="Manage Couriers" count={couriers.length} isActive={activeTab === 'manageCouriers'} onClick={() => setActiveTab('manageCouriers')} />
                    <TabButton title="All Products" count={products.length} isActive={activeTab === 'allProducts'} onClick={() => setActiveTab('allProducts')} />
                    <TabButton title="All Users" count={allUsers.length} isActive={activeTab === 'allUsers'} onClick={() => setActiveTab('allUsers')} />
                </nav>
            </div>
            
            {/* Content */}
            <div>
                {renderContent()}
            </div>
            
            <AddAdminModal 
                isOpen={isAddAdminModalOpen} 
                onClose={() => setAddAdminModalOpen(false)} 
                onAddAdmin={handleAddAdmin} 
            />
             <ProductEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveProduct}
                product={selectedProduct}
                user={user}
            />
            {selectedUser && (
                 <ApplicantDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    user={selectedUser}
                    onUpdateStatus={onUpdateUserStatus}
                />
            )}
            <CourierModal
                isOpen={isCourierModalOpen}
                onClose={() => setCourierModalOpen(false)}
                onSave={onCourierUpdate}
                courier={selectedCourier}
            />
            {selectedReport && (
                <ScamReportDetailsModal
                    isOpen={isReportModalOpen}
                    onClose={() => setReportModalOpen(false)}
                    report={selectedReport}
                    onUpdateStatus={onUpdateScamReportStatus}
                />
            )}
        </div>
    );
};

const TabButton: React.FC<{title: string, count: number, isActive: boolean, onClick: () => void}> = ({ title, count, isActive, onClick }) => (
    <button onClick={onClick} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
        isActive 
        ? 'border-brand-blue text-brand-blue' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}>
        {title} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
            isActive ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-600'
        }`}>{count}</span>
    </button>
);

const UserStatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const baseStyle = 'text-xs font-semibold capitalize px-2 py-0.5 rounded-full';
    const statusStyles: Record<UserStatus, string> = {
        approved: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        rejected: 'bg-red-100 text-red-800',
        suspended: 'bg-gray-200 text-gray-800',
    };
    return <span className={`${baseStyle} ${statusStyles[status]}`}>{status}</span>;
};


const VerificationBadge: React.FC<{ docs?: VerificationDocs }> = ({ docs }) => {
    const hasId = !!docs?.validId;

    if (hasId) {
        return (
            <div title="Valid ID submitted" className="flex items-center space-x-1 text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                <VerificationCheckIcon className="w-3.5 h-3.5" />
                <span>ID Submitted</span>
            </div>
        );
    }
    
    return (
        <div title={`Valid ID missing`} className="flex items-center space-x-1 text-xs font-semibold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">
            <WarningIcon className="w-3.5 h-3.5" />
            <span>No ID</span>
        </div>
    );
};


const UserTable: React.FC<{title: string, users: User[], onViewUser: (user: User) => void, onUpdateUserStatus: (userId: string, newStatus: UserStatus) => void}> = ({ title, users, onViewUser, onUpdateUserStatus }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">{title}</h3>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docs</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                    {users.length > 0 ? users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                 <span className="text-sm font-semibold capitalize bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{user.role}</span>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.joinDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><VerificationBadge docs={user.verificationDocs} /></td>
                            <td className="px-6 py-4 whitespace-nowrap"><UserStatusBadge status={user.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               <div className="flex items-center space-x-2">
                                    <button onClick={() => onViewUser(user)} className="text-indigo-600 hover:text-indigo-900 font-semibold">View Docs</button>
                                    {user.status === 'pending' ? (
                                        <>
                                            <button onClick={() => onUpdateUserStatus(user.id, 'approved')} className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200">Approve</button>
                                            <button onClick={() => onUpdateUserStatus(user.id, 'rejected')} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200">Reject</button>
                                        </>
                                    ) : user.status === 'approved' ? (
                                        <button onClick={() => onUpdateUserStatus(user.id, 'suspended')} className="px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full hover:bg-yellow-200">Suspend</button>
                                    ) : user.status === 'suspended' ? (
                                        <button onClick={() => onUpdateUserStatus(user.id, 'approved')} className="px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full hover:bg-blue-200">Re-instate</button>
                                    ) : user.status === 'rejected' ? (
                                        <button onClick={() => onUpdateUserStatus(user.id, 'approved')} className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200">Re-Approve</button>
                                    ) : null}
                               </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} className="text-center py-10 px-6 text-gray-500">
                                <p className="font-semibold">No users to display.</p>
                                <p className="text-sm mt-1">There are no users in this category.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

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


const ProductList: React.FC<{title: string, products: Product[], sellers: User[], onEdit: (product: Product) => void, onUpdateStatus: (id: string, status: ProductStatus) => void}> = ({ title, products, sellers, onEdit, onUpdateStatus }) => {
    const getSellerName = (id: string) => sellers.find(s => s.id === id)?.fullName || 'Unknown Seller';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">{title}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.length > 0 ? products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrls?.[0] || 'https://via.placeholder.com/150'} alt={product.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getSellerName(product.sellerId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">₱{product.price.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><ProductStatusBadge status={product.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.postDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900 font-semibold">Edit</button>
                                        {product.status === 'pending_approval' && (
                                            <>
                                                <button onClick={() => onUpdateStatus(product.id, 'available')} className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200">Approve</button>
                                                <button onClick={() => onUpdateStatus(product.id, 'rejected')} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200">Reject</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-10 px-6 text-gray-500">
                                    <p className="font-semibold">No products to display.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ProductApprovalList: React.FC<{products: Product[], onUpdateStatus: (id: string, status: ProductStatus) => void, sellers: User[]}> = ({ products, onUpdateStatus, sellers }) => {
    const getSellerName = (id: string) => sellers.find(s => s.id === id)?.fullName || 'Unknown Seller';
    
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Products Pending Approval</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.length > 0 ? products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrls?.[0] || 'https://via.placeholder.com/150'} alt={product.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">{new Date(product.postDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getSellerName(product.sellerId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">₱{product.price.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => onUpdateStatus(product.id, 'available')} className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200">Approve</button>
                                    <button onClick={() => onUpdateStatus(product.id, 'rejected')} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200">Reject</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 px-6 text-gray-500">
                                    <p className="font-semibold">No products are pending approval.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CommissionsManagementView: React.FC<{ commissions: Commission[], users: User[], products: Product[], onVerification: (commissionId: string, isApproved: boolean) => void, onUpdateUserStatus: (userId: string, newStatus: UserStatus) => void }> = ({ commissions, users, products, onVerification, onUpdateUserStatus }) => {
    const getInfo = (id: string, collection: (User|Product)[], field: 'fullName' | 'name') => collection.find(item => item.id === id)?.[field] || 'N/A';
    const sortedCommissions = [...commissions].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    const commissionStatusData = useMemo(() => {
        const counts = commissions.reduce((acc, c) => {
            const status = c.status.replace('_', ' ');
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Commission Status',
                data: Object.values(counts),
                backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#f97316'],
                hoverOffset: 4
            }]
        }
    }, [commissions]);

    const commissionRevenueData = useMemo(() => {
        const monthlyRevenue: { [key: string]: number } = {};
        const labels: string[] = [];
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear().toString().slice(-2);
            const label = `${month} '${year}`;
            labels.push(label);
            monthlyRevenue[label] = 0;
        }

        commissions.forEach(c => {
            if (c.status === 'paid' && c.paidDate) {
                const paidDate = new Date(c.paidDate);
                const month = paidDate.toLocaleString('default', { month: 'short' });
                const year = paidDate.getFullYear().toString().slice(-2);
                const label = `${month} '${year}`;
                if (label in monthlyRevenue) {
                    monthlyRevenue[label] += c.amount;
                }
            }
        });

        return {
            labels,
            datasets: [{
                label: 'Commission Revenue (₱)',
                data: Object.values(monthlyRevenue),
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                fill: true,
                tension: 0.3
            }]
        };
    }, [commissions]);


    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">All Commissions</h3>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedCommissions.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getInfo(c.sellerId, users, 'fullName')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getInfo(c.productId, products, 'name')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₱{c.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.dueDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><CommissionStatusBadge status={c.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                        {c.status === 'pending_verification' && (
                                            <>
                                                <a href={c.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 font-semibold">View Proof</a>
                                                <button onClick={() => onVerification(c.id, true)} className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200">Approve</button>
                                                <button onClick={() => onVerification(c.id, false)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200">Reject</button>
                                            </>
                                        )}
                                        {(() => {
                                            const seller = users.find(u => u.id === c.sellerId);
                                            if (!seller) return null;

                                            if (seller.status === 'approved') {
                                                return <button onClick={() => onUpdateUserStatus(seller.id, 'suspended')} className="px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full hover:bg-yellow-200">Suspend Seller</button>;
                                            } else if (seller.status === 'suspended') {
                                                return <button onClick={() => onUpdateUserStatus(seller.id, 'approved')} className="px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full hover:bg-blue-200">Re-instate Seller</button>;
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-center mb-2">Revenue Over Time</h4>
                    <ChartComponent config={{ type: 'line', data: commissionRevenueData, options: { responsive: true, plugins: { legend: { display: false } } } }} />
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <h4 className="font-semibold text-center mb-2">Status Breakdown</h4>
                    <div className="max-w-[250px] mx-auto">
                        <ChartComponent config={{ type: 'pie', data: commissionStatusData, options: { responsive: true, plugins: { legend: { position: 'top' } } } }} />
                    </div>
                </div>
            </div>
        </div>
    );
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


const ShippingRequestsView: React.FC<{ orders: Order[], couriers: Courier[], onOrderUpdate: (orderId: string, updates: Partial<Order>) => void, users: User[], products: Product[] }> = ({ orders, couriers, onOrderUpdate, users, products }) => {
    const [selectedCouriers, setSelectedCouriers] = useState<{ [orderId: string]: string }>({});

    const handleAssign = (orderId: string) => {
        const courierId = selectedCouriers[orderId];
        if (courierId) {
            onOrderUpdate(orderId, { courierId, status: 'Shipped' });
        } else {
            alert('Please select a courier.');
        }
    };

    const getInfo = (id: string, collection: (User|Product)[]) => collection.find(item => item.id === id);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Shipping Requests</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Courier</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length > 0 ? orders.map(order => {
                            const product = getInfo(order.productId, products) as Product;
                            const seller = getInfo(order.sellerId, users) as User;
                            const buyer = getInfo(order.buyerId, users) as User;
                            return (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-bold">{product?.name}</p>
                                        <p className="text-sm text-gray-600">From: {seller?.fullName} ({seller?.location.city})</p>
                                        <p className="text-sm text-gray-600">To: {buyer?.fullName} ({buyer?.location.address}, {buyer?.location.city})</p>
                                        <p className="text-xs font-mono text-gray-500 mt-1">Order ID: {order.id}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <select
                                                value={selectedCouriers[order.id] || ''}
                                                onChange={(e) => setSelectedCouriers(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                <option value="" disabled>Select Courier</option>
                                                {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <button onClick={() => handleAssign(order.id)} className="px-4 py-2 text-sm font-semibold text-white bg-brand-blue rounded-md hover:bg-brand-blue/90">Assign</button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan={2} className="text-center py-10 text-gray-500">No pending shipping requests.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CourierManagementView: React.FC<{ couriers: Courier[], onEdit: (courier: Courier) => void, onDelete: (courierId: string) => void }> = ({ couriers, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Manage Couriers</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {couriers.map(courier => (
                        <tr key={courier.id}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{courier.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm">{courier.contactPerson}</p>
                                <p className="text-sm text-gray-500">{courier.phone}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                <button onClick={() => onEdit(courier)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                <button onClick={() => onDelete(courier.id)} className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const DashboardOverview: React.FC<{ users: User[], products: Product[], commissions: Commission[] }> = ({ users, products, commissions }) => {
    
    const pendingUsers = users.filter(u => u.status === 'pending');
    const pendingVerifications = commissions.filter(c => c.status === 'pending_verification');

    const userRoleData = useMemo(() => {
        const counts = users.reduce((acc, user) => {
            if (user.role === 'buyer' || user.role === 'seller') {
                acc[user.role] = (acc[user.role] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        return {
            labels: ['Sellers', 'Buyers'],
            datasets: [{
                label: 'User Roles',
                data: [counts.seller || 0, counts.buyer || 0],
                backgroundColor: ['#4F46E5', '#7C3AED'],
                borderColor: ['#FFFFFF'],
                borderWidth: 2,
            }]
        };
    }, [users]);
    
    const productStatusData = useMemo(() => {
        const counts = products.reduce((acc, product) => {
            const status = product.status.replace('_', ' ');
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Product Count',
                data: Object.values(counts),
                backgroundColor: ['#10B981', '#F59E0B', '#6366F1', '#9CA3AF', '#EF4444'],
                borderRadius: 4,
            }]
        };
    }, [products]);

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<UsersIcon />} title="Total Users" value={users.length} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<PendingIcon />} title="Pending Apps" value={pendingUsers.length} color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<CommissionIcon />} title="Pending Verifications" value={pendingVerifications.length} color="bg-orange-100 text-orange-600" />
                <StatCard icon={<ProductIcon />} title="Total Products" value={products.length} color="bg-purple-100 text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 text-center">Users by Role</h3>
                    <div className="max-w-[280px] mx-auto mt-4">
                        <ChartComponent config={{ type: 'doughnut', data: userRoleData, options: { responsive: true, plugins: { legend: { position: 'bottom' }}}}} />
                    </div>
                </div>
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800">Products by Status</h3>
                     <div className="mt-4 h-64">
                        <ChartComponent config={{ type: 'bar', data: productStatusData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } }} />
                    </div>
                </div>
            </div>
        </div>
    )
};

const ScamReportStatusBadge: React.FC<{ status: ScamReportStatus }> = ({ status }) => {
    const statusStyles: Record<ScamReportStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        under_review: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
        dismissed: 'bg-gray-200 text-gray-800',
    };
    return <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${statusStyles[status]}`}>{status.replace('_', ' ')}</span>;
};

const ScamReportsView: React.FC<{ reports: ScamReport[], onViewDetails: (report: ScamReport) => void }> = ({ reports, onViewDetails }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Scam & Fraud Reports</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accused</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {reports.length > 0 ? reports.map(report => (
                        <tr key={report.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{report.reporterName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{report.scammerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{report.issueType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(report.timestamp).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><ScamReportStatusBadge status={report.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => onViewDetails(report)} className="text-indigo-600 hover:text-indigo-900">View Details</button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-500">No scam reports have been filed.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);


export default AdminDashboard;