import type {
  OrderStatus,
  PaymentStatus,
} from "@/types/order";

export interface AnalyticsMetric {
  value: number;
  previousValue: number;
  changePercentage: number | null;
}

export interface SalesTrendPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface CustomerGrowthPoint {
  date: string;
  label: string;
  customers: number;
}

export interface CategorySalesItem {
  category: string;
  revenue: number;
  quantity: number;
  percentage: number;
}

export interface TopProductItem {
  productId: string | null;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface OrderStatusDistributionItem {
  status: OrderStatus;
  count: number;
  percentage: number;
}

export interface AdminAnalyticsData {
  periodDays: number;
  startDate: string;
  endDate: string;

  summary: {
    revenue: AnalyticsMetric;
    orders: AnalyticsMetric;
    customers: AnalyticsMetric;
    averageOrderValue: AnalyticsMetric;
  };

  salesTrend: SalesTrendPoint[];
  customerGrowth: CustomerGrowthPoint[];
  salesByCategory: CategorySalesItem[];
  topProducts: TopProductItem[];
  orderStatusDistribution:
    OrderStatusDistributionItem[];
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  createdAt: string;
}

export interface DashboardLowStockItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  image: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface DashboardActivityItem {
  id: string;
  userName: string;
  action: string;
  entity: string;
  description: string;
  status: "SUCCESS" | "FAILED";
  ipAddress: string | null;
  createdAt: string;
}

export interface AdminDashboardData {
  periodDays: number;

  stats: {
    revenue: AnalyticsMetric;
    orders: AnalyticsMetric;
    products: AnalyticsMetric;
    customers: AnalyticsMetric;
  };

  salesTrend: SalesTrendPoint[];

  orderStatusDistribution:
    OrderStatusDistributionItem[];

  recentOrders: DashboardRecentOrder[];
  lowStock: DashboardLowStockItem[];
  recentActivity: DashboardActivityItem[];
}