// Types for POS Invoice System

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  logo?: string;
}

export interface BankInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceInfo {
  invoiceNumber: string;
  cashier: string;
  table: string;
  checkInTime: string;
  checkOutTime: string;
  date: string;
}

export interface Invoice {
  store: StoreInfo;
  bank: BankInfo;
  info: InvoiceInfo;
  items: OrderItem[];
  subtotal: number;
  total: number;
  note: string;
}

export interface AppSettings {
  store: StoreInfo;
  bank: BankInfo;
  defaultCashier: string;
  vatNote: string;
  thankYouMessage: string;
}

// Default settings
export const defaultSettings: AppSettings = {
  store: {
    name: "LALA QUÁN",
    address: "02 Lê Thanh Nghị, Hải Châu, Đà Nẵng",
    phone: "0905886007",
    logo: "",
  },
  bank: {
    bankName: "VPBank",
    accountName: "TRAN THI THUY",
    accountNumber: "0905886007",
    phone: "0905886007",
  },
  defaultCashier: "Thu ngân",
  vatNote: "Giá trên chưa bao gồm VAT",
  thankYouMessage: "Cảm ơn Quý Khách và Hẹn gặp lại!",
};

// Generate unique invoice number
export function generateInvoiceNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "#";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

// Format time
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format date
export function formatDate(date: Date): string {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Generate QR code URL for VietQR
export function generateVietQRUrl(
  bankId: string,
  accountNumber: string,
  amount: number,
  description: string
): string {
  // VietQR API format
  const template = "compact2";
  const encodedDesc = encodeURIComponent(description);
  return `https://img.vietqr.io/image/${bankId}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodedDesc}`;
}

// Bank codes for VietQR
export const bankCodes: Record<string, string> = {
  "VPBank": "970432",
  "Vietcombank": "970436",
  "Techcombank": "970407",
  "BIDV": "970418",
  "Agribank": "970405",
  "MB Bank": "970422",
  "ACB": "970416",
  "Sacombank": "970403",
  "VietinBank": "970415",
  "TPBank": "970423",
  "SHB": "970443",
  "VIB": "970441",
  "HDBank": "970437",
  "OCB": "970448",
  "SeABank": "970440",
  "MSB": "970426",
  "Eximbank": "970431",
  "LienVietPostBank": "970449",
  "Nam A Bank": "970428",
  "PVcomBank": "970412",
};
