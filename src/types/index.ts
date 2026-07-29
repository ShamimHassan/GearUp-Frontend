export enum UserRole {
  CUSTOMER = "CUSTOMER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

export enum RentalStatus {
  PLACED = "PLACED",
  CONFIRMED = "CONFIRMED",
  PAID = "PAID",
  PICKED_UP = "PICKED_UP",
  RETURNED = "RETURNED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  STRIPE = "STRIPE",
  SSLCOMMERZ = "SSLCOMMERZ",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserWithRelations extends User {
  gearItems?: GearItem[];
  rentalOrders?: RentalOrder[];
  reviews?: Review[];
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CategoryWithRelations extends Category {
  gearItems?: GearItem[];
}

export interface GearItem {
  id: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  price: number;
  stock: number;
  images: string[];
  isAvailable: boolean;
  providerId: string;
  categoryId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GearItemWithRelations extends GearItem {
  provider?: User;
  category?: Category;
  rentalOrders?: RentalOrder[];
  reviews?: Review[];
}

export interface RentalOrder {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  totalAmount: number;
  status: RentalStatus;
  customerId: string;
  gearId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RentalOrderWithRelations extends RentalOrder {
  customer?: User;
  gear?: GearItemWithRelations;
  payment?: Payment;
}

export interface Payment {
  id: string;
  transactionId: string;
  rentalOrderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: Date | string | null;
  gatewayResponse?: Record<string, unknown> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaymentWithRelations extends Payment {
  rentalOrder?: RentalOrderWithRelations;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  gearId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ReviewWithRelations extends Review {
  user?: User;
  gear?: GearItem;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorDetails?: unknown;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface AuthResponse extends ApiResponse<AuthPayload> {}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface GearFilters extends PaginationParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
  isAvailable?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "rating";
}

export interface UserFilters extends PaginationParams {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

export interface PaymentFilters extends PaginationParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole.CUSTOMER | UserRole.PROVIDER;
  phone?: string;
  address?: string;
}

export interface ProfileFormData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GearFormData {
  name: string;
  description?: string;
  brand?: string;
  price: number;
  stock: number;
  images?: string[];
  categoryId: string;
  isAvailable?: boolean;
}

export interface RentalFormData {
  startDate: string;
  endDate: string;
  gearId: string;
}

export interface ReviewFormData {
  rating: number;
  comment?: string;
  gearId: string;
}

export interface CreatePaymentFormData {
  rentalOrderId: string;
  method: PaymentMethod;
}

export interface ConfirmPaymentQuery {
  tran_id?: string;
  val_id?: string;
  amount?: string;
  card_type?: string;
  status?: string;
  tran_date?: string;
}

export interface UpdateUserStatusFormData {
  isActive: boolean;
}

export interface UpdateOrderStatusFormData {
  status: RentalStatus;
}

export type StatusBadgeVariant =
  | RentalStatus
  | PaymentStatus
  | "active"
  | "suspended";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

export interface Option<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export type RentalStatusStep =
  | RentalStatus.PLACED
  | RentalStatus.CONFIRMED
  | RentalStatus.PAID
  | RentalStatus.PICKED_UP
  | RentalStatus.RETURNED;

export const RENTAL_STATUS_FLOW: RentalStatusStep[] = [
  RentalStatus.PLACED,
  RentalStatus.CONFIRMED,
  RentalStatus.PAID,
  RentalStatus.PICKED_UP,
  RentalStatus.RETURNED,
];

export interface PaymentInitiationResult {
  gatewayUrl: string;
  transactionId?: string;
  sessionId?: string;
}

export interface DecodedJwt {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}
