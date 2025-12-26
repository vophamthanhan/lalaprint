/**
 * OrderForm Component
 * 
 * Design: Industrial Utility
 * - Dark background with high contrast inputs
 * - Touch-optimized button sizes (min 44px)
 * - Monospace numbers for precision feel
 * - Gold accent for primary actions
 * - Optimized for POS Android touchscreen
 */

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/types";
import type { OrderItem, InvoiceInfo } from "@/lib/types";
import { nanoid } from "nanoid";

interface OrderFormProps {
  info: InvoiceInfo;
  items: OrderItem[];
  onInfoChange: (info: InvoiceInfo) => void;
  onItemsChange: (items: OrderItem[]) => void;
}

export default function OrderForm({ info, items, onInfoChange, onItemsChange }: OrderFormProps) {
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, unitPrice: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<OrderItem | null>(null);

  // Add new item
  const handleAddItem = () => {
    if (!newItem.name.trim() || newItem.quantity <= 0 || newItem.unitPrice <= 0) return;
    
    const item: OrderItem = {
      id: nanoid(8),
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice,
    };
    
    onItemsChange([...items, item]);
    setNewItem({ name: "", quantity: 1, unitPrice: 0 });
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  // Start editing
  const handleStartEdit = (item: OrderItem) => {
    setEditingId(item.id);
    setEditItem({ ...item });
  };

  // Save edit
  const handleSaveEdit = () => {
    if (!editItem || !editItem.name.trim()) return;
    
    onItemsChange(items.map(item => 
      item.id === editItem.id 
        ? { ...editItem, total: editItem.quantity * editItem.unitPrice }
        : item
    ));
    setEditingId(null);
    setEditItem(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditItem(null);
  };

  // Update quantity directly
  const handleQuantityChange = (id: string, delta: number) => {
    onItemsChange(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  // Quick add common prices
  const quickPrices = [10000, 20000, 30000, 50000, 100000, 150000];

  return (
    <div className="space-y-4">
      {/* Invoice Info */}
      <div className="bg-card rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Thông tin hóa đơn
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Số HĐ</Label>
            <Input 
              value={info.invoiceNumber}
              readOnly
              className="pos-input font-mono text-sm bg-muted"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Ngày</Label>
            <Input 
              value={info.date}
              readOnly
              className="pos-input font-mono text-sm bg-muted"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Thu ngân</Label>
            <Input 
              value={info.cashier}
              onChange={(e) => onInfoChange({ ...info, cashier: e.target.value })}
              className="pos-input text-sm"
              placeholder="Tên thu ngân"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bàn / Phòng</Label>
            <Input 
              value={info.table}
              onChange={(e) => onInfoChange({ ...info, table: e.target.value })}
              className="pos-input text-sm"
              placeholder="VD: Bàn 5, Phòng VIP"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Giờ vào</Label>
            <Input 
              type="time"
              value={info.checkInTime}
              onChange={(e) => onInfoChange({ ...info, checkInTime: e.target.value })}
              className="pos-input text-sm font-mono"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Giờ ra</Label>
            <Input 
              type="time"
              value={info.checkOutTime}
              onChange={(e) => onInfoChange({ ...info, checkOutTime: e.target.value })}
              className="pos-input text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Add New Item */}
      <div className="bg-card rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Thêm món
        </h3>
        
        {/* Item name input */}
        <div>
          <Input 
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="pos-input text-base h-12"
            placeholder="Nhập tên món..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          />
        </div>
        
        {/* Quantity and Price row */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4">
            <Label className="text-xs text-muted-foreground mb-1 block">Số lượng</Label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                className="h-10 w-10 p-0"
                onClick={() => setNewItem({ ...newItem, quantity: Math.max(1, newItem.quantity - 1) })}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input 
                type="number"
                min={1}
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                className="pos-input text-base font-mono text-center h-10 w-14"
              />
              <Button
                type="button"
                variant="secondary"
                className="h-10 w-10 p-0"
                onClick={() => setNewItem({ ...newItem, quantity: newItem.quantity + 1 })}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="col-span-5">
            <Label className="text-xs text-muted-foreground mb-1 block">Đơn giá (VNĐ)</Label>
            <Input 
              type="number"
              min={0}
              step={1000}
              value={newItem.unitPrice || ""}
              onChange={(e) => setNewItem({ ...newItem, unitPrice: parseInt(e.target.value) || 0 })}
              className="pos-input text-base font-mono text-right h-10"
              placeholder="0"
            />
          </div>
          <div className="col-span-3 flex items-end">
            <Button 
              onClick={handleAddItem}
              className="w-full h-10 touch-btn bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={!newItem.name.trim() || newItem.unitPrice <= 0}
            >
              <Plus className="w-5 h-5 mr-1" />
              Thêm
            </Button>
          </div>
        </div>
        
        {/* Quick price buttons */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Giá nhanh</Label>
          <div className="flex flex-wrap gap-2">
            {quickPrices.map((price) => (
              <Button
                key={price}
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 font-mono text-xs"
                onClick={() => setNewItem({ ...newItem, unitPrice: price })}
              >
                {formatCurrency(price)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Danh sách món ({items.length})
          </h3>
        </div>
        
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">Chưa có món nào</p>
            <p className="text-xs mt-1">Thêm món ở phần trên</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {items.map((item, index) => (
              <div 
                key={item.id}
                className="p-3 hover:bg-accent/50 transition-colors"
              >
                {editingId === item.id && editItem ? (
                  // Edit mode
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-center text-muted-foreground text-sm">
                      {index + 1}
                    </div>
                    <div className="col-span-4">
                      <Input 
                        value={editItem.name}
                        onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                        className="pos-input text-sm h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        type="number"
                        min={1}
                        value={editItem.quantity}
                        onChange={(e) => setEditItem({ ...editItem, quantity: parseInt(e.target.value) || 1 })}
                        className="pos-input text-sm font-mono text-center h-9"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input 
                        type="number"
                        min={0}
                        value={editItem.unitPrice}
                        onChange={(e) => setEditItem({ ...editItem, unitPrice: parseInt(e.target.value) || 0 })}
                        className="pos-input text-sm font-mono text-right h-9"
                      />
                    </div>
                    <div className="col-span-2 flex gap-1">
                      <Button 
                        size="sm"
                        onClick={handleSaveEdit}
                        className="touch-btn flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="touch-btn flex-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-center text-muted-foreground text-sm font-mono">
                      {index + 1}
                    </div>
                    <div className="col-span-4">
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="font-mono text-sm w-6 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        +
                      </Button>
                    </div>
                    <div className="col-span-2 text-right font-mono text-sm text-muted-foreground">
                      {formatCurrency(item.unitPrice)}
                    </div>
                    <div className="col-span-2 text-right font-mono text-sm font-semibold text-primary">
                      {formatCurrency(item.total)}
                    </div>
                    <div className="col-span-1 flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(item)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
