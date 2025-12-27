/**
 * Print Utilities for Thermal Printer via RawBT
 * 
 * Supports:
 * - Xprinter XP-80T (80mm thermal printer)
 * - RawBT Print Service on Android
 * - ESC/POS commands for formatting
 */

import type { Invoice, AppSettings } from "./types";
import { formatCurrency } from "./types";

// ESC/POS Commands
const ESC = "\x1B";
const GS = "\x1D";

const COMMANDS = {
  // Initialize printer
  INIT: ESC + "@",
  
  // Text alignment
  ALIGN_LEFT: ESC + "a" + "\x00",
  ALIGN_CENTER: ESC + "a" + "\x01",
  ALIGN_RIGHT: ESC + "a" + "\x02",
  
  // Text formatting
  BOLD_ON: ESC + "E" + "\x01",
  BOLD_OFF: ESC + "E" + "\x00",
  DOUBLE_HEIGHT_ON: GS + "!" + "\x10",
  DOUBLE_WIDTH_ON: GS + "!" + "\x20",
  DOUBLE_SIZE_ON: GS + "!" + "\x30",
  NORMAL_SIZE: GS + "!" + "\x00",
  
  // Underline
  UNDERLINE_ON: ESC + "-" + "\x01",
  UNDERLINE_OFF: ESC + "-" + "\x00",
  
  // Line spacing
  LINE_SPACING_DEFAULT: ESC + "2",
  LINE_SPACING_SET: ESC + "3",
  
  // Cut paper
  CUT_PARTIAL: GS + "V" + "\x01",
  CUT_FULL: GS + "V" + "\x00",
  
  // Feed
  FEED_LINE: "\n",
  FEED_LINES: (n: number) => ESC + "d" + String.fromCharCode(n),
};

// Character width for 80mm paper (typically 48 chars with standard font)
const PAPER_WIDTH = 48;

// Helper: Pad string to width
function padString(str: string, width: number, align: "left" | "right" | "center" = "left"): string {
  const len = str.length;
  if (len >= width) return str.substring(0, width);
  
  const padding = width - len;
  switch (align) {
    case "right":
      return " ".repeat(padding) + str;
    case "center":
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return " ".repeat(leftPad) + str + " ".repeat(rightPad);
    default:
      return str + " ".repeat(padding);
  }
}

// Helper: Create dashed line
function dashedLine(width: number = PAPER_WIDTH): string {
  return "-".repeat(width);
}

// Helper: Generate QR code ESC/POS command
function generateQRCode(data: string): string {
  const qrData = data;
  const qrLength = qrData.length;
  const pL = qrLength % 256;
  const pH = Math.floor(qrLength / 256);
  
  let qrCommand = "";
  
  // Model (QR Code)
  qrCommand += GS + "(k" + String.fromCharCode(4, 0, 49, 65, 50, 0);
  
  // Size of module (1-16, default 3)
  qrCommand += GS + "(k" + String.fromCharCode(3, 0, 49, 67, 8);
  
  // Error correction level (48=L, 49=M, 50=Q, 51=H)
  qrCommand += GS + "(k" + String.fromCharCode(3, 0, 49, 69, 49);
  
  // Store data
  qrCommand += GS + "(k" + String.fromCharCode(pL + 3, pH, 49, 80, 48) + qrData;
  
  // Print QR code
  qrCommand += GS + "(k" + String.fromCharCode(3, 0, 49, 81, 48);
  
  return qrCommand;
}

// Helper: Format two columns
function twoColumns(left: string, right: string, width: number = PAPER_WIDTH): string {
  const rightLen = right.length;
  const leftMax = width - rightLen - 1;
  const leftStr = left.length > leftMax ? left.substring(0, leftMax) : left;
  const padding = width - leftStr.length - rightLen;
  return leftStr + " ".repeat(Math.max(1, padding)) + right;
}

// Generate ESC/POS content for printing
export function generateESCPOS(invoice: Invoice, settings: AppSettings): string {
  const { store, bank, info, items, subtotal, total } = invoice;
  let content = "";
  
  // Initialize
  content += COMMANDS.INIT;
  
  // Header - Store name (centered, bold, double size)
  content += COMMANDS.ALIGN_CENTER;
  content += COMMANDS.BOLD_ON;
  content += COMMANDS.DOUBLE_SIZE_ON;
  content += store.name + "\n";
  content += COMMANDS.NORMAL_SIZE;
  content += COMMANDS.BOLD_OFF;
  
  // Address
  content += store.address + "\n";
  if (store.phone) {
    content += "ĐT: " + store.phone + "\n";
  }
  
  // Divider
  content += dashedLine() + "\n";
  
  // Invoice title
  content += COMMANDS.BOLD_ON;
  content += COMMANDS.DOUBLE_HEIGHT_ON;
  content += "HOA DON THANH TOAN\n";
  content += COMMANDS.NORMAL_SIZE;
  content += COMMANDS.BOLD_OFF;
  content += "Số HĐ: " + info.invoiceNumber + "\n";
  
  // Invoice info
  content += COMMANDS.ALIGN_LEFT;
  content += twoColumns("Mã HĐ: " + info.invoiceNumber, "TN: " + info.cashier) + "\n";
  content += twoColumns("Bàn: " + info.table, "Ngày: " + info.date) + "\n";
  content += twoColumns("Giờ vào: " + info.checkInTime, "Giờ ra: " + info.checkOutTime) + "\n";
  
  // Divider
  content += dashedLine() + "\n";
  
  // Table header
  content += COMMANDS.BOLD_ON;
  const header = padString("STT", 4) + padString("Tên món", 20) + padString("SL", 4, "center") + padString("Đơn giá", 10, "right") + padString("Tổng", 10, "right");
  content += header + "\n";
  content += COMMANDS.BOLD_OFF;
  content += dashedLine() + "\n";
  
  // Items
  items.forEach((item, index) => {
    const stt = padString((index + 1).toString(), 4);
    const name = item.name.length > 20 ? item.name.substring(0, 18) + ".." : padString(item.name, 20);
    const qty = padString(item.quantity.toString(), 4, "center");
    const price = padString(formatCurrency(item.unitPrice), 10, "right");
    const itemTotal = padString(formatCurrency(item.total), 10, "right");
    content += stt + name + qty + price + itemTotal + "\n";
  });
  
  // Divider
  content += dashedLine() + "\n";
  
  // Totals
  content += twoColumns("Thành tiền:", formatCurrency(subtotal)) + "\n";
  content += COMMANDS.BOLD_ON;
  content += COMMANDS.DOUBLE_HEIGHT_ON;
  content += twoColumns("Tổng tiền:", formatCurrency(total)) + "\n";
  content += COMMANDS.NORMAL_SIZE;
  content += COMMANDS.BOLD_OFF;
  
  // Divider
  content += dashedLine() + "\n";
  
  // Bank info
  content += COMMANDS.ALIGN_CENTER;
  content += bank.bankName + "\n";
  content += COMMANDS.BOLD_ON;
  content += bank.accountName + "\n";
  content += COMMANDS.BOLD_OFF;
  content += bank.accountNumber + "\n";
  content += bank.phone + "\n";
  
  // QR Code for payment
  content += "\n";
  const bankCodes: Record<string, string> = {
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
  };
  const bankCode = bankCodes[bank.bankName] || "970432";
  const qrContent = `2|99|${bank.accountNumber}|${bank.accountName}|${bank.bankName}|${total}|${info.invoiceNumber}|transfer`;
  content += generateQRCode(qrContent);
  content += "\n\n";
  
  // VAT note
  content += settings.vatNote + "\n";
  
  // Divider
  content += dashedLine() + "\n";
  
  // Thank you message
  content += COMMANDS.BOLD_ON;
  content += settings.thankYouMessage + "\n";
  content += COMMANDS.BOLD_OFF;
  
  // Feed and cut
  content += COMMANDS.FEED_LINES(3);
  content += COMMANDS.CUT_PARTIAL;
  
  return content;
}

// Generate plain text content (for preview/fallback)
export function generatePlainText(invoice: Invoice, settings: AppSettings): string {
  const { store, bank, info, items, subtotal, total } = invoice;
  let content = "";
  
  // Header
  content += padString(store.name, PAPER_WIDTH, "center") + "\n";
  content += padString(store.address, PAPER_WIDTH, "center") + "\n";
  if (store.phone) {
    content += padString("ĐT: " + store.phone, PAPER_WIDTH, "center") + "\n";
  }
  content += dashedLine() + "\n";
  
  // Title
  content += padString("HÓA ĐƠN THANH TOÁN", PAPER_WIDTH, "center") + "\n";
  content += padString("Số HĐ: " + info.invoiceNumber, PAPER_WIDTH, "center") + "\n";
  content += "\n";
  
  // Info
  content += twoColumns("Mã HĐ: " + info.invoiceNumber, "TN: " + info.cashier) + "\n";
  content += twoColumns("Bàn: " + info.table, "Ngày: " + info.date) + "\n";
  content += twoColumns("Giờ vào: " + info.checkInTime, "Giờ ra: " + info.checkOutTime) + "\n";
  content += dashedLine() + "\n";
  
  // Table
  content += padString("STT", 4) + padString("Tên món", 20) + padString("SL", 4, "center") + padString("Đơn giá", 10, "right") + padString("T.Tiền", 10, "right") + "\n";
  content += dashedLine() + "\n";
  
  items.forEach((item, index) => {
    const stt = padString((index + 1).toString(), 4);
    const name = item.name.length > 20 ? item.name.substring(0, 18) + ".." : padString(item.name, 20);
    const qty = padString(item.quantity.toString(), 4, "center");
    const price = padString(formatCurrency(item.unitPrice), 10, "right");
    const itemTotal = padString(formatCurrency(item.total), 10, "right");
    content += stt + name + qty + price + itemTotal + "\n";
  });
  
  content += dashedLine() + "\n";
  content += twoColumns("Thành tiền:", formatCurrency(subtotal) + " đ") + "\n";
  content += twoColumns("Tổng tiền:", formatCurrency(total) + " đ") + "\n";
  content += dashedLine() + "\n";
  
  // Bank
  content += padString(bank.bankName, PAPER_WIDTH, "center") + "\n";
  content += padString(bank.accountName, PAPER_WIDTH, "center") + "\n";
  content += padString(bank.phone, PAPER_WIDTH, "center") + "\n";
  content += "\n";
  
  content += padString(settings.vatNote, PAPER_WIDTH, "center") + "\n";
  content += dashedLine() + "\n";
  content += padString(settings.thankYouMessage, PAPER_WIDTH, "center") + "\n";
  
  return content;
}

// Print via RawBT intent (Android)
// RawBT supports multiple methods:
// 1. rawbt:base64 - Base64 encoded ESC/POS data
// 2. rawbt:url - URL to fetch content from
// 3. intent:// - Android intent scheme
export function printViaRawBT(content: string): boolean {
  try {
    // Method 1: Base64 encoded content via rawbt: scheme
    // This is the most reliable method for RawBT
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    
    // Try rawbt: scheme first (works on most Android devices)
    const rawbtUrl = `rawbt:base64,${base64Content}`;
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = rawbtUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("RawBT print error:", error);
    return false;
  }
}

// Alternative: Print via Android Intent
export function printViaIntent(content: string): boolean {
  try {
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    const intentUrl = `intent://print#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;S.data=${base64Content};end`;
    
    window.location.href = intentUrl;
    return true;
  } catch (error) {
    console.error("Intent print error:", error);
    return false;
  }
}

// Print via RawBT using simple text (fallback)
export function printViaRawBTText(content: string): boolean {
  try {
    // Simple text mode - RawBT will handle encoding
    const encodedContent = encodeURIComponent(content);
    const rawbtUrl = `rawbt:${encodedContent}`;
    
    // Use iframe method for better compatibility
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = rawbtUrl;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }, 2000);
    
    return true;
  } catch (error) {
    console.error("RawBT text print error:", error);
    return false;
  }
}

// Print using browser print dialog (fallback)
export function printViaBrowser(): void {
  window.print();
}

// Generate HTML for printing (with proper styling)
export function generatePrintHTML(invoice: Invoice, settings: AppSettings): string {
  const { store, bank, info, items, subtotal, total } = invoice;
  
  // Generate VietQR URL
  const bankCodes: Record<string, string> = {
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
  };
  
  const bankCode = bankCodes[bank.bankName] || "970432";
  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bank.accountNumber}-compact2.png?amount=${total}&addInfo=${encodeURIComponent(info.invoiceNumber)}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn ${info.invoiceNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.3;
      width: 80mm;
      padding: 5mm;
      background: white;
      color: black;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .title {
      font-size: 16px;
      font-weight: bold;
      margin: 5px 0;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 8px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    th, td {
      padding: 3px 2px;
      text-align: left;
    }
    th {
      border-bottom: 1px solid #000;
    }
    .qty { text-align: center; }
    .price, .total { text-align: right; }
    .grand-total {
      font-size: 14px;
      font-weight: bold;
    }
    .qr-code {
      width: 100px;
      height: 100px;
      margin: 10px auto;
      display: block;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="center">
    ${store.logo ? `<img src="${store.logo}" style="height: 40px; margin-bottom: 5px;">` : ''}
    <div class="title">${store.name}</div>
    <div style="font-size: 10px;">${store.address}</div>
    ${store.phone ? `<div style="font-size: 10px;">ĐT: ${store.phone}</div>` : ''}
  </div>
  
  <div class="divider"></div>
  
  <div class="center">
    <div class="title">HÓA ĐƠN THANH TOÁN</div>
    <div style="font-size: 10px;">Số HĐ: ${info.invoiceNumber}</div>
  </div>
  
  <div style="margin: 8px 0; font-size: 11px;">
    <div class="info-row"><span>Mã HĐ: ${info.invoiceNumber}</span><span>TN: ${info.cashier}</span></div>
    <div class="info-row"><span>Bàn: ${info.table}</span><span>Ngày: ${info.date}</span></div>
    <div class="info-row"><span>Giờ vào: ${info.checkInTime}</span><span>Giờ ra: ${info.checkOutTime}</span></div>
  </div>
  
  <div class="divider"></div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 25px;">STT</th>
        <th>Tên món</th>
        <th class="qty" style="width: 30px;">SL</th>
        <th class="price" style="width: 60px;">Đơn giá</th>
        <th class="total" style="width: 70px;">Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.name}</td>
          <td class="qty">${item.quantity}</td>
          <td class="price">${formatCurrency(item.unitPrice)}</td>
          <td class="total">${formatCurrency(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="divider"></div>
  
  <div style="font-size: 12px;">
    <div class="info-row"><span>Thành tiền:</span><span>${formatCurrency(subtotal)} đ</span></div>
    <div class="info-row grand-total"><span>Tổng tiền:</span><span>${formatCurrency(total)} đ</span></div>
  </div>
  
  <div class="divider"></div>
  
  <div class="center" style="margin: 10px 0;">
    <div style="font-size: 10px; color: #666;">${bank.bankName}</div>
    <div class="bold">${bank.accountName}</div>
    <div style="font-size: 10px;">${bank.phone}</div>
    <img src="${qrUrl}" class="qr-code" alt="QR Thanh toán">
  </div>
  
  <div class="center" style="font-size: 10px; color: #666;">
    ${settings.vatNote}
  </div>
  
  <div class="divider"></div>
  
  <div class="center bold" style="margin-top: 10px;">
    ${settings.thankYouMessage}
  </div>
</body>
</html>
  `;
}

// Open print window with HTML content
export function openPrintWindow(html: string): void {
  const printWindow = window.open("", "_blank", "width=350,height=600");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
