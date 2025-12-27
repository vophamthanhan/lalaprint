/**
 * ReceiptPreview Component
 * 
 * Design: Industrial Utility - Receipt paper simulation
 * - White background simulating thermal paper
 * - Monospace font for authentic receipt look
 * - Dashed dividers like real thermal receipts
 * - 80mm width optimized layout (matching sample receipt)
 */

import { formatCurrency, generateVietQRUrl, bankCodes } from "@/lib/types";
import type { Invoice, AppSettings } from "@/lib/types";

interface ReceiptPreviewProps {
  invoice: Invoice;
  settings: AppSettings;
  showQR?: boolean;
}

export default function ReceiptPreview({ invoice, settings, showQR = true }: ReceiptPreviewProps) {
  const { store, bank, info, items, subtotal, total } = invoice;
  
  // Generate QR URL
  const bankCode = bankCodes[bank.bankName] || "970432";
  const qrUrl = generateVietQRUrl(
    bankCode,
    bank.accountNumber,
    total,
    `${info.invoiceNumber} ${info.table}`
  );

  return (
    <div 
      id="receipt-content"
      className="receipt-paper w-full max-w-[80mm] mx-auto p-3 text-[11px] leading-tight"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Header - Store Info with Logo */}
      <div className="flex items-start gap-2 mb-2">
        {store.logo ? (
          <img 
            src={store.logo} 
            alt={store.name}
            className="h-10 w-auto object-contain flex-shrink-0"
            style={{ filter: 'grayscale(100%)' }}
          />
        ) : (
          <div className="text-2xl font-black tracking-tight flex-shrink-0" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            LALA
          </div>
        )}
        <div className="text-right flex-1">
          <div className="font-bold text-sm">{store.name}</div>
          <div className="text-[9px] text-gray-600 leading-tight">
            Địa chỉ: {store.address}
          </div>
          {store.phone && (
            <div className="text-[9px] text-gray-600">ĐT: {store.phone}</div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Invoice Title */}
      <div className="text-center mb-2">
        <div className="font-bold text-base tracking-wide">HÓA ĐƠN THANH TOÁN</div>
        <div className="text-[10px] text-gray-500">Số HĐ:</div>
      </div>

      {/* Invoice Info - 2 columns like sample */}
      <div className="text-[10px] mb-2 space-y-0.5">
        <div className="flex justify-between">
          <span>Mã HĐ: <span className="font-medium">{info.invoiceNumber}</span></span>
          <span>TN: <span className="font-medium">{info.cashier}</span></span>
        </div>
        <div className="flex justify-between">
          <span>Bàn: <span className="font-medium">{info.table || "-"}</span></span>
          <span>Ngày: <span className="font-medium">{info.date}</span></span>
        </div>
        <div className="flex justify-between">
          <span>Giờ vào: <span className="font-medium">{info.checkInTime}</span></span>
          <span>Giờ ra: <span className="font-medium">{info.checkOutTime}</span></span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Items Table - matching sample layout */}
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-center py-1 w-7 font-medium">STT</th>
            <th className="text-left py-1 font-medium">Tên món</th>
            <th className="text-center py-1 w-7 font-medium">SL</th>
            <th className="text-right py-1 w-14 font-medium">Đơn giá</th>
            <th className="text-right py-1 w-16 font-medium">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-3 text-center text-gray-400 text-[9px]">
                Chưa có món
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-1 text-center">{index + 1}</td>
                <td className="py-1 break-words pr-1">{item.name}</td>
                <td className="py-1 text-center">{item.quantity}</td>
                <td className="py-1 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                <td className="py-1 text-right font-medium tabular-nums">{formatCurrency(item.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-2 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Thành tiền:</span>
          <span className="font-medium tabular-nums">{formatCurrency(subtotal)} đ</span>
        </div>
        <div className="flex justify-between font-bold text-[13px]">
          <span>Tổng tiền:</span>
          <span className="tabular-nums">{formatCurrency(total)} đ</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Payment Info */}
      <div className="text-center">
        <div className="text-[10px] text-gray-600">{bank.bankName}</div>
        <div className="font-bold text-[11px]">{bank.accountName}</div>
        <div className="text-[10px] text-gray-600">{bank.phone}</div>
        
        {/* QR Code */}
        {showQR && total > 0 && (
          <div className="my-2">
            <img 
              src={qrUrl}
              alt="QR Thanh toán"
              className="w-28 h-28 mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        {showQR && total === 0 && (
          <div className="my-2 w-28 h-28 mx-auto border border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-[9px] text-gray-400">QR sẽ hiện khi có món</span>
          </div>
        )}
      </div>

      {/* VAT Note */}
      <div className="text-center text-[10px] text-gray-500 my-2">
        {settings.vatNote}
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Thank You Message */}
      <div className="text-center text-[11px] font-medium">
        {settings.thankYouMessage}
      </div>
    </div>
  );
}
