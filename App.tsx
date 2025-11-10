
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import ProductFeed from './components/ProductFeed';
import Footer from './components/Footer';
import ProductDetails from './components/ProductDetails';
import LoginModal from './components/LoginModal';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import SellerProfilePage from './components/SellerProfilePage';
import ReportScammerPage from './components/ReportScammerPage';
// FIX: Import OrderStatus type to be used when creating a new order.
import { Product, User, Order, UserStatus, Commission, Seller, ProductStatus, UserLocation, Courier, Notification, ProductData, Location, OrderStatus, Chat, ScamReport, ScamReportStatus } from './types';
import { auth, db, storage } from './components/firebaseConfig';
import { onAuthStateChanged, signOut, updateEmail } from 'firebase/auth';
import { ref, get, update, push, child, serverTimestamp, DataSnapshot, onValue, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';


type Page = 'marketplace' | 'product' | 'register' | 'dashboard' | 'profile' | 'terms' | 'privacy' | 'community' | 'sellerProfile' | 'reportScammer';

const StaticPage: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({ title, onBack, children }) => (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto animate-fade-in">
        <button 
            onClick={onBack} 
            className="flex items-center text-brand-blue font-semibold mb-6 hover:underline"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Marketplace
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">{title}</h1>
        <div className="prose lg:prose-xl max-w-none text-gray-700 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

// Helper to convert RTDB snapshot to an array
const snapshotToArray = (snapshot: DataSnapshot): any[] => {
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map(key => ({
    id: key,
    ...data[key],
  }));
};

// Helper to process RTDB timestamp-like fields (numbers) into ISO strings
const processDataObject = (data: any): any => {
    const processedData: { [key: string]: any } = {};
    const dateFields = ['joinDate', 'postDate', 'orderDate', 'deliveryDate', 'timestamp', 'shippedDate', 'deliveredDate'];
    for (const key in data) {
        if (dateFields.includes(key) && typeof data[key] === 'number') {
            processedData[key] = new Date(data[key]).toISOString();
        } else if (key === 'lastMessage' && data[key] && typeof data[key].timestamp === 'number') {
            // Handle nested timestamp in chat's lastMessage
            processedData[key] = {
                ...data[key],
                timestamp: new Date(data[key].timestamp).toISOString()
            };
        } else {
            processedData[key] = data[key];
        }
    }
    return processedData;
};

// Combines snapshotToArray and processDataObject
const snapshotToArrayWithTimestamps = (snapshot: DataSnapshot): any[] => {
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
        id: key,
        ...processDataObject(data[key])
    }));
};

// Processes a single snapshot record with timestamp conversion
const processSingleSnapshotWithTimestamps = (snapshot: DataSnapshot): any | null => {
    if (!snapshot.exists()) return null;
    const data = snapshot.val();
    return {
        id: snapshot.key,
        ...processDataObject(data)
    };
};


const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  
  const [page, setPage] = useState<Page>('marketplace');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [scamReports, setScamReports] = useState<ScamReport[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prefilledReport, setPrefilledReport] = useState<{ name: string; link: string } | null>(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setIsLoading(true);
        if (user) {
            // Avoid refetching if currentUser is already set by the registration flow
            if (currentUser && currentUser.id === user.uid) {
                setIsLoading(false);
                return;
            }
            const userRef = ref(db, 'users/' + user.uid);
            const userSnap = await get(userRef);
            if (userSnap.exists()) {
                const userData = processSingleSnapshotWithTimestamps(userSnap) as User;
                setCurrentUser(userData);
            } else {
                console.warn("User profile not found in Realtime Database.");
                setCurrentUser(null);
            }
        } else {
            setCurrentUser(null);
        }
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time data fetching from Realtime Database
  useEffect(() => {
    setIsLoading(true);
    
    const refsToListen = {
        products: ref(db, 'products'),
        users: ref(db, 'users'),
        orders: ref(db, 'orders'),
        commissions: ref(db, 'commissions'),
        sellers: ref(db, 'sellers'),
        couriers: ref(db, 'couriers'),
        scamReports: ref(db, 'scamReports'),
    };

    const unsubscribes = [
        onValue(refsToListen.products, (snapshot) => setProducts(snapshotToArrayWithTimestamps(snapshot) as Product[]), { onlyOnce: false }),
        onValue(refsToListen.users, (snapshot) => setUsers(snapshotToArrayWithTimestamps(snapshot) as User[]), { onlyOnce: false }),
        onValue(refsToListen.orders, (snapshot) => setOrders(snapshotToArrayWithTimestamps(snapshot) as Order[]), { onlyOnce: false }),
        onValue(refsToListen.commissions, (snapshot) => setCommissions(snapshotToArray(snapshot) as Commission[]), { onlyOnce: false }),
        onValue(refsToListen.sellers, (snapshot) => setSellers(snapshotToArray(snapshot) as Seller[]), { onlyOnce: false }),
        onValue(refsToListen.couriers, (snapshot) => setCouriers(snapshotToArray(snapshot) as Courier[]), { onlyOnce: false }),
        onValue(refsToListen.scamReports, (snapshot) => setScamReports(snapshotToArrayWithTimestamps(snapshot) as ScamReport[]), { onlyOnce: false })
    ];

    const timer = setTimeout(() => setIsLoading(false), 2000);

    return () => {
        unsubscribes.forEach(unsubscribe => unsubscribe());
        clearTimeout(timer);
    };
  }, []);

  // Real-time listener for notifications
    useEffect(() => {
        if (currentUser?.role === 'admin') {
            const notificationsRef = query(ref(db, 'notifications'), orderByChild('userId'), equalTo(currentUser.id));
            const unsubscribe = onValue(notificationsRef, (snapshot) => {
                const notifs = snapshotToArrayWithTimestamps(snapshot)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setNotifications(notifs as Notification[]);
            });
            return () => unsubscribe();
        } else {
            setNotifications([]);
        }
    }, [currentUser]);

    // Real-time listener for chats
    useEffect(() => {
        if (!currentUser) {
            setChats([]);
            return;
        }

        const chatsRef = query(ref(db, 'chats'), orderByChild(`participants/${currentUser.id}`), equalTo(true));
        const unsubscribe = onValue(chatsRef, (snapshot) => {
            const userChats = snapshotToArrayWithTimestamps(snapshot) as Chat[];
            setChats(userChats);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Automatic suspension/re-instatement for sellers based on commissions
    useEffect(() => {
        if (currentUser?.role === 'seller') {
            const unpaid = commissions.filter(c => c.sellerId === currentUser.id && c.status === 'unpaid');
            const hasOverdue = unpaid.some(c => {
                const dueDate = new Date(c.dueDate);
                const today = new Date();
                dueDate.setHours(0, 0, 0, 0); // Compare dates only
                today.setHours(0, 0, 0, 0);
                return dueDate < today;
            });

            if (hasOverdue && currentUser.status === 'approved') {
                alert("Your account has been suspended due to overdue commission payments. Please pay them to re-activate your account.");
                handleUserStatusUpdate(currentUser.id, 'suspended');
            } else if (!hasOverdue && currentUser.status === 'suspended') {
                alert("Thank you for settling your overdue commissions. Your account has been re-activated.");
                handleUserStatusUpdate(currentUser.id, 'approved');
            }
        }
    }, [currentUser, commissions]);

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      if (product.status !== 'available') return false;
      
      const seller = sellers.find(s => s.id === product.sellerId);
      const sellerName = seller ? seller.name : 'Unknown';

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.province.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProvince = province ? product.location.province === province : true;
      const matchesCity = city ? product.location.city === city : true;
      
      return matchesSearch && matchesProvince && matchesCity;
    });
  }, [searchTerm, province, city, products, sellers]);

  const handleNavigate = (newPage: Page) => {
    if (newPage !== 'reportScammer') {
        setPrefilledReport(null);
    }
    setPage(newPage);
    setSelectedProduct(null);
    setSelectedSeller(null);
    window.scrollTo(0, 0);
  };
  
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setPage('product');
    window.scrollTo(0, 0);
  };
  
  const handleSellerSelect = (seller: Seller) => {
    setSelectedSeller(seller);
    setPage('sellerProfile');
    window.scrollTo(0, 0);
  };
    
  const handleInitiateReport = (seller: Seller) => {
    setPrefilledReport({ name: seller.name, link: `/seller/${seller.id}` });
    handleNavigate('reportScammer');
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    handleNavigate('dashboard');
  };

  const handleRegisterSuccess = (newUser: User) => {
    setCurrentUser(newUser);
    if (newUser.role === 'seller') {
        const newSeller: Seller = {
            id: newUser.id,
            name: newUser.penName || newUser.fullName,
            isVerified: false,
            bannerUrl: `https://picsum.photos/seed/${newUser.id}/1200/400`,
        };
        setSellers(prev => [newSeller, ...prev]);
    }
    handleNavigate('marketplace');
  };

  const handleLogout = async () => {
    try {
        await signOut(auth);
        setCurrentUser(null);
        handleNavigate('marketplace');
    } catch (error) {
        console.error("Error signing out: ", error);
        alert("Failed to log out. Please try again.");
    }
  };

  const handleUserStatusUpdate = async (userId: string, newStatus: UserStatus) => {
    const userRef = ref(db, 'users/' + userId);
    try {
        await update(userRef, { status: newStatus });
        // No alert here to avoid spamming the user on auto-suspension/re-activation
    } catch (error) {
        console.error("Error updating user status:", error);
        alert("Failed to update user status.");
    }
  };

  const handleUpdateUserProfile = async (updatedData: { 
    fullName: string; 
    penName?: string; 
    phone: string; 
    location: UserLocation;
    email: string;
}) => {
    if (!currentUser) return false;
    const userRef = ref(db, 'users/' + currentUser.id);
    try {
        if (updatedData.email && updatedData.email !== currentUser.email) {
            if (auth.currentUser) {
                await updateEmail(auth.currentUser, updatedData.email);
            } else {
                throw new Error("Not authenticated.");
            }
        }

        const dbUpdateData = {
            fullName: updatedData.fullName,
            penName: updatedData.penName || '',
            phone: updatedData.phone,
            location: updatedData.location,
            email: updatedData.email
        };

        await update(userRef, dbUpdateData);
        
        const updatedUser = { ...currentUser, ...dbUpdateData };
        setCurrentUser(updatedUser);
        alert("Profile updated successfully!");
        return true;
    } catch (error: any) {
        console.error("Error updating profile:", error);
        if (error.code === 'auth/requires-recent-login') {
            alert("This is a sensitive action. Please log out and log back in before changing your email.");
        } else if (error.code === 'auth/email-already-in-use') {
             alert("This email is already in use by another account.");
        } else if (error.code === 'auth/invalid-email') {
            alert("The email address is not valid.");
        } else {
            alert("Failed to update profile. Please try again.");
        }
        return false;
    }
  };

  const handleProductStatusUpdate = async (productId: string, newStatus: ProductStatus) => {
    const productRef = ref(db, 'products/' + productId);
    try {
        await update(productRef, { status: newStatus });
    } catch (error) {
        console.error("Error updating product status:", error);
        alert("Failed to update product status.");
    }
  };

    const handleAddNewProduct = async (productData: ProductData, sellerId: string) => {
        try {
            const price = Number(productData.price);
            const stock = Number(productData.stock);
            if (isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
                alert("Invalid price or stock provided. Please enter positive numbers.");
                return false;
            }

            const newProductData = {
                ...productData,
                price: price,
                stock: stock,
                sellerId,
                reviewSummary: { count: 0, rating: 0 },
                reviews: [],
                postDate: serverTimestamp(),
                status: 'pending_approval',
            };
            await push(ref(db, 'products'), newProductData);
            alert(`Product "${productData.name}" has been submitted for approval.`);
            return true;
        } catch (error) {
            console.error("Error adding new product:", error);
            alert("Failed to add product.");
            return false;
        }
    };
  
    const handleUpdateProduct = async (productId: string, productData: ProductData) => {
        if (!currentUser) {
            alert("You must be logged in to update a product.");
            return false;
        }
    
        const productRef = ref(db, `products/${productId}`);
        try {
            const price = Number(productData.price);
            const stock = Number(productData.stock);
            if (isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
                alert("Invalid price or stock provided. Please enter valid numbers.");
                return false;
            }
    
            const updates: Partial<Product> = {
                name: productData.name,
                description: productData.description,
                price: price,
                stock: stock,
                imageUrls: productData.imageUrls || [],
            };
    
            // Only require re-approval if a seller edits the product.
            // Admins can edit without changing the approval status.
            if (currentUser.role === 'seller') {
                updates.status = 'pending_approval';
            }
    
            await update(productRef, updates);
            
            if (currentUser.role === 'seller') {
                alert("Product updated successfully and is now pending re-approval.");
            } else {
                alert("Product updated successfully.");
            }
            return true;
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product. An unexpected error occurred.");
            return false;
        }
    };

    const handleMarkAsSold = async (product: Product, quantity: number) => {
        if (!currentUser) return;
        try {
            // Re-fetch product to prevent race conditions on stock
            const productRef = ref(db, `products/${product.id}`);
            const productSnapshot = await get(productRef);
            if (!productSnapshot.exists()) {
                throw new Error("Product no longer exists.");
            }
            const currentProduct = processSingleSnapshotWithTimestamps(productSnapshot) as Product;
    
            if (currentProduct.stock < quantity) {
                alert(`Sorry, there are only ${currentProduct.stock} items left in stock.`);
                return;
            }
    
            const newOrderData = {
                productId: product.id,
                buyerId: currentUser.id,
                sellerId: product.sellerId,
                quantity,
                totalPrice: product.price * quantity,
                status: 'Processing' as OrderStatus,
                orderDate: serverTimestamp(),
                shippingMethod: 'seller-managed' as 'seller-managed' | 'lokal-market',
            };
            const newOrderRef = push(ref(db, 'orders'), newOrderData);
            if (!newOrderRef.key) throw new Error("Failed to create order.");
    
            // Update product stock and status
            const newStock = currentProduct.stock - quantity;
            const newStatus = newStock > 0 ? currentProduct.status : 'sold';
            await update(productRef, { stock: newStock, status: newStatus });
            
            // Commission logic: 1% of total price, due in 5 days
            const commissionAmount = newOrderData.totalPrice * 0.01;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 5);
            const newCommissionData = {
                orderId: newOrderRef.key,
                sellerId: product.sellerId,
                productId: product.id,
                amount: commissionAmount,
                status: 'unpaid',
                dueDate: dueDate.toISOString().split('T')[0],
            };
            await push(ref(db, 'commissions'), newCommissionData);
    
            alert(`Purchase successful! Your order is now processing. You can track it in your dashboard.`);
            handleNavigate('dashboard');
        } catch(error) {
            console.error("Error completing purchase:", error);
            alert(`There was an error processing your purchase. ${error instanceof Error ? error.message : ''}`);
        }
    };

    const handlePayCommission = async (commissionId: string, paymentProofFile: File) => {
        if (!paymentProofFile) {
            alert("Please upload a proof of payment.");
            return false;
        }
    
        const commissionRef = ref(db, `commissions/${commissionId}`);
        const commissionSnap = await get(commissionRef);
        if (!commissionSnap.exists()) {
             alert("Commission not found.");
             return false;
        }
        const commissionData = commissionSnap.val();

        try {
            const proofRef = storageRef(storage, `commissionProofs/${commissionData.sellerId}/${commissionId}-${paymentProofFile.name}`);
            await uploadBytes(proofRef, paymentProofFile);
            const downloadUrl = await getDownloadURL(proofRef);

            await update(commissionRef, {
                status: 'pending_verification',
                paymentProofUrl: downloadUrl,
            });

            alert("Payment proof submitted for verification. Thank you!");
            return true;
        } catch (error) {
            console.error("Error submitting payment proof:", error);
            alert("Failed to submit payment proof.");
            return false;
        }
    };

    const handleCommissionVerification = async (commissionId: string, isApproved: boolean) => {
        const commissionRef = ref(db, `commissions/${commissionId}`);
        try {
            const newStatus = isApproved ? 'paid' : 'rejected';
            const updates: { status: string, paidDate?: string } = { status: newStatus };
            if (isApproved) {
                updates.paidDate = new Date().toISOString().split('T')[0];
            }
            await update(commissionRef, updates);
            alert(`Commission has been ${isApproved ? 'approved' : 'rejected'}.`);
        } catch (error) {
            console.error("Error verifying commission:", error);
            alert("Failed to update commission status.");
        }
    };

  const handleSendMessage = async (recipientId: string, messageText: string) => {
    if (!currentUser) {
        alert("You must be logged in to send a message.");
        return;
    }
    const senderId = currentUser.id;
    const chatId = [senderId, recipientId].sort().join('_');
    const chatRef = ref(db, `chats/${chatId}`);
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const chatSnap = await get(chatRef);

    try {
        const lastMessageData = {
            senderId,
            text: messageText,
            timestamp: serverTimestamp(),
        };

        if (!chatSnap.exists()) {
            // Create new chat if it doesn't exist
            await set(chatRef, {
                participants: {
                    [senderId]: true,
                    [recipientId]: true,
                },
                lastMessage: lastMessageData,
                lastRead: {
                    [senderId]: serverTimestamp()
                }
            });
        } else {
            // Update last message if chat exists
            await update(ref(db, `chats/${chatId}/lastMessage`), lastMessageData);
        }
        
        // Push the new message to the messages sub-collection
        await push(messagesRef, {
            senderId,
            text: messageText,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message.");
    }
  };
  
    const handleOrderUpdate = async (orderId: string, updates: Partial<Order>) => {
        const orderRef = ref(db, `orders/${orderId}`);
        try {
            const finalUpdates = { ...updates };
            if (updates.status === 'Shipped') {
                finalUpdates.shippedDate = serverTimestamp();
            }
            if (updates.status === 'Delivered') {
                finalUpdates.deliveredDate = serverTimestamp();
            }
            await update(orderRef, finalUpdates);
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Failed to update order.");
        }
    };
    
    const handleSellerShipOrder = async (orderId: string, courierName: string, trackingNumber: string) => {
        await handleOrderUpdate(orderId, {
            status: 'Shipped',
            shippingMethod: 'seller-managed',
            courierName,
            trackingNumber,
        });
    };
    
    const createNotification = async (userId: string, message: string, orderId: string) => {
        const notificationsRef = ref(db, 'notifications');
        const newNotification = {
            userId,
            message,
            orderId,
            isRead: false,
            timestamp: serverTimestamp(),
        };
        await push(notificationsRef, newNotification);
    };

    const sendEmailNotificationToAdmins = (order: Order, requestingSeller: User) => {
        const product = products.find(p => p.id === order.productId);
        const buyer = users.find(u => u.id === order.buyerId);
        const adminUsers = users.filter(u => u.role === 'admin');
        const adminEmails = adminUsers.map(u => u.email).join(', ');

        if (!product || !buyer || adminEmails.length === 0) {
            console.error("Could not gather all info for email notification.");
            return;
        }

        const subject = `Rider Request for Order #${order.id.substring(0, 5)}`;
        const body = `
            Hello Admin,

            A new rider has been requested by a seller.

            Order Details:
            - Order ID: ${order.id}
            - Product: ${product.name}
            - Total Price: ₱${order.totalPrice.toLocaleString()}

            Seller Information:
            - Name: ${requestingSeller.fullName}
            - Phone: ${requestingSeller.phone}
            - Email: ${requestingSeller.email}

            Buyer Information:
            - Name: ${buyer.fullName}
            - Address: ${buyer.location.address}, ${buyer.location.barangay}, ${buyer.location.city}, ${buyer.location.province}

            Please assign a courier in the admin dashboard.

            Thank you,
            Lokal Market PH System
        `;

        console.log("--- SIMULATING EMAIL ---");
        console.log(`To: ${adminEmails}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log("------------------------");
        // In a real application, you would use a backend service (like Firebase Functions)
        // to send this email via an SMTP provider (e.g., SendGrid, Mailgun).
    };

    const handleRequestRider = async (order: Order) => {
        if (!currentUser) return;
        await handleOrderUpdate(order.id, {
            shippingMethod: 'lokal-market',
            status: 'Awaiting Courier'
        });

        const adminUsers = users.filter(u => u.role === 'admin');
        const message = `Rider requested by ${currentUser.fullName} for order #${order.id.substring(0, 5)}`;
        for (const admin of adminUsers) {
            await createNotification(admin.id, message, order.id);
        }
        
        sendEmailNotificationToAdmins(order, currentUser);
        
        alert("Admin has been notified of your shipping request.");
    };

    const handleMarkNotificationAsRead = async (notificationId: string) => {
        const notifRef = ref(db, `notifications/${notificationId}`);
        await update(notifRef, { isRead: true });
    };

    const handleCourierUpdate = async (courierData: Omit<Courier, 'id'>, courierId?: string) => {
        try {
            const id = courierId || push(child(ref(db), 'couriers')).key;
            if (!id) throw new Error("Could not generate courier ID.");
            const courierRef = ref(db, `couriers/${id}`);
            await set(courierRef, courierData);
            alert(`Courier ${courierId ? 'updated' : 'added'} successfully.`);
            return true;
        } catch (error) {
            console.error("Error saving courier:", error);
            alert("Failed to save courier.");
            return false;
        }
    };
    
    const handleCourierDelete = async (courierId: string) => {
        if (window.confirm("Are you sure you want to delete this courier? This cannot be undone.")) {
            try {
                const courierRef = ref(db, `couriers/${courierId}`);
                await remove(courierRef);
                alert("Courier deleted successfully.");
            } catch (error) {
                console.error("Error deleting courier:", error);
                alert("Failed to delete courier.");
            }
        }
    };
    
    const handleScamReportSubmit = async (
        reportData: Omit<ScamReport, 'id' | 'timestamp' | 'status' | 'evidenceUrls' | 'reporterUserId'>,
        evidenceFiles: File[]
    ): Promise<boolean> => {
        try {
            const newReportRef = push(child(ref(db), 'scamReports'));
            if (!newReportRef.key) throw new Error("Could not generate report ID.");
            
            let evidenceUrls: string[] = [];
            if (evidenceFiles.length > 0) {
                const uploadPromises = evidenceFiles.map(file => {
                    const fileRef = storageRef(storage, `scamReports/${newReportRef.key}/${file.name}`);
                    return uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef));
                });
                evidenceUrls = await Promise.all(uploadPromises);
            }
    
            const newReportData = {
                ...reportData,
                reporterUserId: currentUser?.id || 'anonymous',
                evidenceUrls,
                status: 'pending' as ScamReportStatus,
                timestamp: serverTimestamp()
            };
    
            await set(newReportRef, newReportData);
            return true;
        } catch (error) {
            console.error("Error submitting scam report:", error);
            alert("Failed to submit your report. Please try again.");
            return false;
        }
    };

    const handleUpdateScamReportStatus = async (reportId: string, newStatus: ScamReportStatus) => {
        const reportRef = ref(db, `scamReports/${reportId}`);
        try {
            await update(reportRef, { status: newStatus });
            alert(`Report status updated to ${newStatus}.`);
        } catch (error) {
            console.error("Error updating report status:", error);
            alert("Failed to update report status.");
        }
    };


  const renderContent = () => {
    if (isLoading) {
        return <div className="text-center py-20 text-xl font-semibold">Loading Local Market...</div>
    }

    switch(page) {
      case 'product':
        if (selectedProduct) {
          let seller: Seller | undefined = sellers.find(s => s.id === selectedProduct.sellerId);
          // Fallback for admin-created products
          if (!seller) {
            const userAsSeller = users.find(u => u.id === selectedProduct.sellerId);
            if (userAsSeller) {
              seller = {
                id: userAsSeller.id,
                name: userAsSeller.penName || userAsSeller.fullName,
                isVerified: true, // Admins are implicitly verified
                bannerUrl: `https://picsum.photos/seed/${userAsSeller.id}/1200/400`,
              };
            }
          }
          
          return (
            <ProductDetails 
              product={selectedProduct} 
              seller={seller} // Pass the found or constructed seller
              onBack={() => handleNavigate('marketplace')}
              currentUser={currentUser}
              onLoginClick={() => setLoginModalOpen(true)}
              onMarkAsSold={handleMarkAsSold}
              onSellerSelect={handleSellerSelect}
              onSendMessage={handleSendMessage}
              onReportSeller={handleInitiateReport}
            />
          );
        }
        return <ProductFeed products={filteredProducts} sellers={sellers} users={users} onProductSelect={handleProductSelect} onSellerSelect={handleSellerSelect} />;
      
      case 'sellerProfile':
          return selectedSeller ? (
              <SellerProfilePage 
                seller={selectedSeller}
                products={products}
                sellers={sellers}
                onProductSelect={handleProductSelect}
                onBack={() => handleNavigate('marketplace')}
                onSellerSelect={handleSellerSelect}
                onReportSeller={handleInitiateReport}
              />
          ) : <ProductFeed products={filteredProducts} sellers={sellers} users={users} onProductSelect={handleProductSelect} onSellerSelect={handleSellerSelect} />;
      case 'register':
        return <RegisterPage onSwitchToLogin={() => setLoginModalOpen(true)} onNavigate={handleNavigate} onRegisterSuccess={handleRegisterSuccess}/>;
      case 'dashboard':
        return currentUser ? <Dashboard user={currentUser} users={users} orders={orders} products={products} sellers={sellers} commissions={commissions} couriers={couriers} notifications={notifications} chats={chats} scamReports={scamReports} onUpdateScamReportStatus={handleUpdateScamReportStatus} onSendMessage={handleSendMessage} onAddNewProduct={handleAddNewProduct} onUpdateProduct={handleUpdateProduct} onUpdateUserStatus={handleUserStatusUpdate} onUpdateProductStatus={handleProductStatusUpdate} onOrderUpdate={handleOrderUpdate} onCourierUpdate={handleCourierUpdate} onCourierDelete={handleCourierDelete} onSellerShipOrder={handleSellerShipOrder} onRequestRider={handleRequestRider} onPayCommission={handlePayCommission} onCommissionVerification={handleCommissionVerification} /> : <p>Please log in to view your dashboard.</p>;
      case 'profile':
          return currentUser ? <ProfilePage user={currentUser} onBack={() => handleNavigate('dashboard')} onUpdateProfile={handleUpdateUserProfile} /> : <p>Please log in to view your profile.</p>;
      case 'reportScammer':
          return <ReportScammerPage 
                    currentUser={currentUser} 
                    onSubmit={handleScamReportSubmit}
                    onBack={() => handleNavigate('marketplace')} 
                    prefilledData={prefilledReport}
                />;
      case 'terms':
          return (
            <StaticPage title="Terms & Conditions" onBack={() => handleNavigate('marketplace')}>
                <p className="text-sm text-gray-600">Effective Date: November 9, 2025</p>
                <p className="text-sm text-gray-600">Company Name: Lokal Market</p>
                <p className="text-sm text-gray-600">Website: https://lokal-market.shop/</p>
                
                <h3 className="font-bold text-xl mt-6">1.1 Overview</h3>
                <p>Lokal Market PH (“we,” “our,” or “us”) operates an online marketplace platform where sellers can list and sell their products to buyers within their local area, including filtering by municipality and barangay. By registering, accessing, or using our platform, you agree to comply with these Terms and Conditions.</p>

                <h3 className="font-bold text-xl mt-6">1.2 Eligibility</h3>
                <p>You must be at least 18 years old to use Lokal Market PH. Sellers must provide valid information during registration and may be required to submit proof of identity or business registration (DTI or business permit).</p>

                <h3 className="font-bold text-xl mt-6">1.3 Account Registration</h3>
                <p>Sellers and Buyers must create an account to access full marketplace features.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Sellers are responsible for the accuracy of product listings and compliance with applicable laws.</li>
                    <li>Admin approval is required for any profile updates or new listings.</li>
                </ul>

                <h3 className="font-bold text-xl mt-6">1.4 Fees and Commissions</h3>
                <p>Lokal Market PH charges a 1% commission fee only after a product is sold.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>The commission must be paid via QR code payment provided after marking an item as “Sold.”</li>
                    <li>Non-payment of commission fees may result in suspension or account termination.</li>
                </ul>

                <h3 className="font-bold text-xl mt-6">1.5 Seller Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Sellers must ensure that all products listed are accurate, lawful, and in sellable condition.</li>
                    <li>Sellers agree to fulfill orders promptly and maintain transparent communication with buyers.</li>
                    <li>Prohibited listings include counterfeit, illegal, or unsafe goods.</li>
                </ul>

                <h3 className="font-bold text-xl mt-6">1.6 Buyer Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Buyers are responsible for verifying product details before purchasing.</li>
                    <li>Lokal Market PH is not directly involved in the transaction, but facilitates communication between sellers and buyers.</li>
                    <li>Buyers should report disputes or fraudulent behavior immediately.</li>
                </ul>

                <h3 className="font-bold text-xl mt-6">1.7 Disputes and Refunds</h3>
                <p>Disputes must first be resolved directly between buyer and seller. Lokal Market PH may mediate if necessary but does not guarantee refunds unless policies are violated.</p>

                <h3 className="font-bold text-xl mt-6">1.8 Account Termination</h3>
                <p>Lokal Market PH reserves the right to suspend or delete any account that violates these terms, engages in fraudulent activity, or refuses to comply with marketplace rules.</p>
                
                <h3 className="font-bold text-xl mt-6">1.9 Limitation of Liability</h3>
                <p>Lokal Market PH is not responsible for product quality, delivery issues, or damages caused by third-party sellers. The platform functions as a venue, not the direct seller.</p>

                <h3 className="font-bold text-xl mt-6">1.10 Changes to Terms</h3>
                <p>We reserve the right to modify these Terms at any time. Updates will be posted on our website and take effect immediately upon publication.</p>
            </StaticPage>
          );
      case 'privacy':
          return (
            <StaticPage title="Privacy Policy" onBack={() => handleNavigate('marketplace')}>
                <h3 className="font-bold text-xl mt-6">2.1 Information We Collect</h3>
                <p>We collect personal and transactional information necessary for account registration and platform operations:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Name, email, and contact number</li>
                    <li>Municipality and barangay</li>
                    <li>Product listings and order details</li>
                    <li>Payment confirmations (for commission purposes)</li>
                </ul>
                
                <h3 className="font-bold text-xl mt-6">2.2 How We Use Your Information</h3>
                <p>Your data is used to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Create and manage accounts</li>
                    <li>Facilitate communication between sellers and buyers</li>
                    <li>Process commission payments</li>
                    <li>Prevent fraud and ensure platform security</li>
                    <li>Improve platform functionality</li>
                </ul>
                
                <h3 className="font-bold text-xl mt-6">2.3 Data Sharing</h3>
                <p>We do not sell or rent user data. Information may be shared only with:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Payment providers for processing transactions</li>
                    <li>Law enforcement when legally required</li>
                    <li>Internal analytics to improve services</li>
                </ul>

                <h3 className="font-bold text-xl mt-6">2.4 Data Retention</h3>
                <p>We retain user information for as long as your account remains active or as required by law. Users may request data deletion at any time via email: [Insert Support Email].</p>

                <h3 className="font-bold text-xl mt-6">2.5 Cookies and Tracking</h3>
                <p>Lokal Market PH uses cookies for login sessions, performance analytics, and remembering user preferences.</p>

                <h3 className="font-bold text-xl mt-6">2.6 Data Security</h3>
                <p>We implement standard security practices including encrypted connections (SSL), secure servers, and restricted admin access.</p>

                <h3 className="font-bold text-xl mt-6">2.7 User Rights</h3>
                <p>Users have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Access or update their personal data</li>
                    <li>Request data deletion</li>
                    <li>Withdraw consent for communication or marketing</li>
                </ul>
                <p className="mt-4">Requests may be sent to [Insert Support Email].</p>
            </StaticPage>
          );
      case 'community':
          return (
            <StaticPage title="Shipping & Community Guidelines" onBack={() => handleNavigate('marketplace')}>
                <h2 className="font-bold text-2xl mt-4">Shipping Policy</h2>
                
                <h3 className="font-bold text-xl mt-6">3.1 Overview</h3>
                <p>Lokal Market PH supports community-based selling. Delivery or pickup arrangements are agreed upon between the seller and buyer directly. Lokal Market PH does not handle physical shipping but provides a channel for coordination.</p>

                <h3 className="font-bold text-xl mt-6">3.2 Delivery Methods</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Meet-up / Local Delivery</strong> – Buyers and sellers can arrange pickup within their barangay or municipality.</li>
                    <li><strong>Third-Party Couriers</strong> – Sellers may use local delivery apps or couriers at their discretion.</li>
                    <li><strong>Tracking</strong> – If a courier is used, tracking numbers should be shared via chat.</li>
                </ul>

                <h3 className="font-bold text-xl mt-6">3.3 Shipping Fees</h3>
                <p>All delivery or courier fees are negotiated directly between the seller and buyer. Lokal Market PH does not charge or collect shipping fees.</p>

                <h3 className="font-bold text-xl mt-6">3.4 Delivery Time</h3>
                <p>Delivery times vary depending on the seller’s location and chosen delivery method. Buyers should coordinate directly with sellers for estimates.</p>

                <h3 className="font-bold text-xl mt-6">3.5 Lost or Damaged Items</h3>
                <p>Lokal Market PH is not responsible for loss or damage during delivery. Sellers are encouraged to document items before shipment and use reputable couriers.</p>

                <h3 className="font-bold text-xl mt-6">3.6 Contact</h3>
                <p>For any platform-related concerns (not shipping disputes), contact: 📧 lokal-market.shop or visit <a href="https://lokal-market.shop/" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">https://lokal-market.shop/</a></p>

                <div className="border-t my-8"></div>
                
                <h2 className="font-bold text-2xl mt-4">Community Guidelines</h2>
                <p>Our community is built on trust and respect. We ask all our users to adhere to the following guidelines to ensure a safe and positive experience for everyone:</p>
                 <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Be Respectful:</strong> Treat all members of the community with kindness and respect. Harassment, hate speech, or bullying will not be tolerated.</li>
                    <li><strong>Communicate Clearly:</strong> Provide accurate descriptions for products and be clear about transaction details like price, condition, and meet-up/delivery arrangements.</li>
                    <li><strong>Transact Safely:</strong> We recommend meeting in public places for local pickups. Never share sensitive personal information like bank account details in public chats.</li>
                    <li><strong>Be Honest:</strong> Do not list counterfeit, illegal, or prohibited items. Misleading listings will be removed, and your account may be suspended.</li>
                    <li><strong>Honor Commitments:</strong> If you agree to a sale or purchase, follow through with the transaction in a timely manner.</li>
                    <li><strong>Report Issues:</strong> If you encounter a user who violates these guidelines or engages in suspicious activity, please report them to our admin team immediately.</li>
                </ul>
            </StaticPage>
          );
      case 'marketplace':
      default:
        return <ProductFeed products={filteredProducts} sellers={sellers} users={users} onProductSelect={handleProductSelect} onSellerSelect={handleSellerSelect} />;
    }
  };

  return (
    <div className="bg-light-gray min-h-screen flex flex-col font-sans text-dark-gray">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        province={province}
        setProvince={setProvince}
        city={city}
        setCity={setCity}
        currentUser={currentUser}
        onLoginClick={() => setLoginModalOpen(true)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        chats={chats}
        users={users}
      />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-[1200px]">
        {renderContent()}
      </main>
      <Footer onNavigate={handleNavigate}/>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
            setLoginModalOpen(false);
            handleNavigate('register');
        }}
      />
    </div>
  );
};

export default App;