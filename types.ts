export interface Seller {
  id: string;
  name: string;
  isVerified: boolean;
  bannerUrl: string;
}

export interface Location {
  province: string;
  city: string;
  barangay: string;
}

export interface ReviewSummary {
  count: number;
  rating: number; // out of 5
}

export interface ReviewDetail {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  productName?: string;
}

export type ProductStatus = 'pending_approval' | 'rejected' | 'available' | 'sold' | 'unavailable';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  sellerId: string;
  location: Location;
  reviewSummary: ReviewSummary;
  reviews: ReviewDetail[];
  postDate: string;
  status: ProductStatus;
  stock: number;
}

export type ProductData = {
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  location: Location;
  stock: number;
};

export interface UserLocation {
    province: string;
    city: string;
    barangay: string;
    address: string;
}

export interface VerificationDocs {
    validId: string | null;
    businessPermit?: string | null;
    dtiRegistration?: string | null;
    barangayClearance?: string | null;
}

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  id: string; // Firebase Auth UID
  fullName: string;
  penName?: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  location: UserLocation;
  verificationDocs: VerificationDocs;
  status: UserStatus;
  joinDate: string;
}

export type OrderStatus = 'Processing' | 'Awaiting Courier' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
    id: string;
    productId: string;
    buyerId: string;
    sellerId: string;
    quantity: number;
    totalPrice: number;
    status: OrderStatus;
    orderDate: string;
    shippedDate?: string;
    deliveredDate?: string;
    shippingMethod: 'seller-managed' | 'lokal-market';
    courierId?: string;
    courierName?: string;
    trackingNumber?: string;
}

export type CommissionStatus = 'unpaid' | 'pending_verification' | 'paid' | 'rejected';

export interface Commission {
    id: string;
    orderId: string;
    sellerId: string;
    productId: string;
    amount: number;
    status: CommissionStatus;
    dueDate: string;
    paidDate?: string;
    paymentProofUrl?: string;
}

export interface Message {
  id: string; // Firebase push key
  senderId: string;
  text: string;
  timestamp: string; // ISO String after processing
}

export interface Courier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface Notification {
  id: string;
  userId: string; // The user to be notified (e.g., an admin)
  message: string;
  orderId: string;
  isRead: boolean;
  timestamp: string; // ISO String
}

export interface ChatLastMessage {
    text: string;
    timestamp: any; // Can be number from server, becomes string on client
    senderId: string;
}

export interface ChatLastRead {
    [userId: string]: any; // Timestamp of the last read message by each user
}

export interface Chat {
    id: string;
    participants: { [userId: string]: true };
    lastMessage?: ChatLastMessage;
    lastRead?: ChatLastRead;
}

export type ScamReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export interface ScamReport {
    id: string;
    reporterUserId: string; // 'anonymous' if not logged in
    reporterName: string;
    reporterEmail: string;
    scammerName: string;
    scammerProfileLink?: string;
    issueType: string;
    description: string;
    evidenceUrls: string[];
    timestamp: string; // ISO string on client
    status: ScamReportStatus;
}