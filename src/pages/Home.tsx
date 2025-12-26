/**
 * Home Page - POS Invoice Creator
 * 
 * Design: Industrial Utility
 * - Split layout: Form (left) | Preview (right) on desktop
 * - Stacked layout on mobile with tab switching
 * - Dark theme with gold accent for print button
 * - Touch-optimized for POS Android devices
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Settings, Printer, RefreshCw, Eye, Edit3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  defaultSettings, 
  generateInvoiceNumber, 
  formatDate, 
  formatTime,
  formatCurrency 
} from "@/lib/types";
import type { AppSettings, OrderItem, InvoiceInfo, Invoice } from "@/lib/types";
import OrderForm from "@/components/OrderForm";
import ReceiptPreview from "@/components/ReceiptPreview";
import { generatePrintHTML, openPrintWindow, printViaRawBT, printViaRawBTText, generateESCPOS, generatePlainText } from "@/lib/printUtils";

export default function Home() {
  // Load settings from localStorage
  const [settings] = useLocalStorage<AppSettings>("pos-settings", defaultSettings);
  
  // Invoice info state
  const [info, setInfo] = useState<InvoiceInfo>(() => {
    const now = new Date();
    return {
      invoiceNumber: generateInvoiceNumber(),
      cashier: settings.defaultCashier,
      table: "",
      checkInTime: formatTime(now),
      checkOutTime: formatTime(now),
      date: formatDate(now),
    };
  });
  
  // Order items state
  const [items, setItems] = useState<OrderItem[]>([]);
  
  // Mobile tab state
  const [activeTab, setActiveTab] = useState<string>("form");
  
  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);
  
  const total = subtotal; // Can add tax/discount logic here
  
  // Build invoice object
  const invoice: Invoice = useMemo(() => ({
    store: settings.store,
    bank: settings.bank,
    info,
    items,
    subtotal,
    total,
    note: settings.vatNote,
  }), [settings, info, items, subtotal, total]);
  
  // Update checkout time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setInfo(prev => ({
        ...prev,
        checkOutTime: formatTime(new Date()),
      }));
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Reset order
  const handleNewOrder = () => {
    const now = new Date();
    setInfo({
      invoiceNumber: generateInvoiceNumber(),
      cashier: settings.defaultCashier,
      table: "",
      checkInTime: formatTime(now),
      checkOutTime: formatTime(now),
      date: formatDate(now),
    });
    setItems([]);
    toast.success("Đã tạo đơn mới");
  };
  
  // Detect if running on Android
  const isAndroid = /Android/i.test(navigator.userAgent);
  
  // Print invoice
  const handlePrint = () => {
    if (items.length === 0) {
      toast.error("Chưa có món nào trong đơn");
      return;
    }
    
    // Update checkout time before printing
    const now = new Date();
    const updatedInfo = { ...info, checkOutTime: formatTime(now) };
    setInfo(updatedInfo);
    
    const updatedInvoice = { ...invoice, info: updatedInfo };
    
    if (isAndroid) {
      // Try RawBT methods for Android POS
      try {
        // Method 1: ESC/POS commands
        const escposContent = generateESCPOS(updatedInvoice, settings);
        printViaRawBT(escposContent);
        toast.success("Đang gửi lệnh in qua RawBT...");
      } catch {
        // Method 2: Plain text fallback
        try {
          const plainText = generatePlainText(updatedInvoice, settings);
          printViaRawBTText(plainText);
          toast.success("Đang gửi lệnh in...");
        } catch {
          // Final fallback: browser print
          const html = generatePrintHTML(updatedInvoice, settings);
          openPrintWindow(html);
          toast.info("Mở cửa sổ in trình duyệt");
        }
      }
    } else {
      // Desktop/iOS: Use browser print
      const html = generatePrintHTML(updatedInvoice, settings);
      openPrintWindow(html);
      toast.success("Đang mở cửa sổ in...");
    }
  };
  
  // Print via browser (fallback button)
  const handleBrowserPrint = () => {
    if (items.length === 0) {
      toast.error("Chưa có món nào trong đơn");
      return;
    }
    
    const now = new Date();
    const updatedInfo = { ...info, checkOutTime: formatTime(now) };
    setInfo(updatedInfo);
    
    const updatedInvoice = { ...invoice, info: updatedInfo };
    const html = generatePrintHTML(updatedInvoice, settings);
    openPrintWindow(html);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold leading-tight">{settings.store.name}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Hệ thống in hóa đơn nhiệt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNewOrder}
              className="touch-btn"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Đơn mới</span>
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="touch-btn">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-4">
        {/* Desktop: Split Layout */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6 h-full">
          {/* Left: Order Form */}
          <div className="lg:col-span-3 space-y-4">
            <OrderForm
              info={info}
              items={items}
              onInfoChange={setInfo}
              onItemsChange={setItems}
            />
          </div>
          
          {/* Right: Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="bg-card rounded-lg overflow-hidden">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Xem trước hóa đơn
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    80mm
                  </span>
                </div>
                <div className="p-4 bg-white/5 max-h-[calc(100vh-250px)] overflow-y-auto">
                  <ReceiptPreview invoice={invoice} settings={settings} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Tabbed Layout */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="form" className="touch-btn">
                <Edit3 className="w-4 h-4 mr-2" />
                Tạo đơn
              </TabsTrigger>
              <TabsTrigger value="preview" className="touch-btn">
                <Eye className="w-4 h-4 mr-2" />
                Xem trước
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="form" className="mt-0">
              <OrderForm
                info={info}
                items={items}
                onInfoChange={setInfo}
                onItemsChange={setItems}
              />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="bg-card rounded-lg overflow-hidden">
                <div className="p-3 border-b border-border">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Xem trước hóa đơn (80mm)
                  </h3>
                </div>
                <div className="p-4 bg-white/5">
                  <ReceiptPreview invoice={invoice} settings={settings} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="sticky bottom-0 bg-card border-t border-border p-4 no-print">
        <div className="container">
          <div className="flex items-center justify-between gap-4">
            {/* Total Display */}
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Tổng tiền</div>
              <div className="text-2xl font-bold font-mono text-primary number-animate">
                {formatCurrency(total)} <span className="text-base">đ</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {items.length} món · {info.table || "Chưa chọn bàn"}
              </div>
            </div>
            
            {/* Print Buttons */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleBrowserPrint}
                className="touch-btn hidden sm:flex"
                disabled={items.length === 0}
              >
                <Eye className="w-5 h-5 mr-2" />
                In trình duyệt
              </Button>
              <Button
                size="lg"
                onClick={handlePrint}
                className="touch-btn btn-gold min-w-[140px] h-14 text-lg"
                disabled={items.length === 0}
              >
                <Printer className="w-6 h-6 mr-2" />
                IN HÓA ĐƠN
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
