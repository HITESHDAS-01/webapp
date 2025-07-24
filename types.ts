
export enum TransactionType {
    Sale = 'sale',
    Purchase = 'purchase',
  }
  
  export enum PaymentMode {
    Cash = 'cash',
    Credit = 'credit',
  }
  
  export enum ContactType {
    Customer = 'customer',
    Supplier = 'supplier',
  }
  
  export enum BusinessType {
    Pharmacy = 'pharmacy',
    Kirana = 'kirana',
    Electronics = 'electronics',
    HotelRestaurant = 'hotel_restaurant',
    Other = 'other'
  }
  
  export enum Unit {
    Piece = 'piece',
    Kg = 'kg',
    Gram = 'g',
    Litre = 'l',
    Ml = 'ml',
    Packet = 'packet',
    Box = 'box',
  }
  
  export interface Contact {
    id: string;
    name: string;
  }
  
  export interface Transaction {
    id: string;
    type: TransactionType;
    paymentMode: PaymentMode;
    amount: number;
    date: string; // ISO 8601 format
    itemName: string;
    quantity: number;
    unit: Unit;
    contactId?: string;
  }
  
  export interface Settlement {
    id:string;
    type: 'settlement_received' | 'settlement_paid';
    contactId: string;
    amount: number;
    date: string; // ISO 8601 format
  }
  
  export type HistoryItem = Transaction | Settlement;
  
  export interface CreditBalance {
    contact: Contact;
    balance: number;
    type: 'receivable' | 'payable';
  }
  
  export type Language = 'en' | 'hi' | 'as';
  
  export type ReportPeriod = 'today' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'last_30_days';
  
  export interface ReportData {
    period: string;
    totalSales: number;
    totalPurchases: number;
    netProfit: number;
    topProductsByValue: { name: string; value: number }[];
  }