/**
 * Settings Page
 * 
 * Design: Industrial Utility
 * - Dark theme with card sections
 * - Form inputs with clear labels
 * - Touch-optimized for POS devices
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Save, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultSettings, bankCodes } from "@/lib/types";
import type { AppSettings } from "@/lib/types";

export default function Settings() {
  const [savedSettings, setSavedSettings] = useLocalStorage<AppSettings>("pos-settings", defaultSettings);
  const [settings, setSettings] = useState<AppSettings>(savedSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(savedSettings));
  }, [settings, savedSettings]);

  // Save settings
  const handleSave = () => {
    setSavedSettings(settings);
    toast.success("Đã lưu cài đặt");
    setHasChanges(false);
  };

  // Reset to defaults
  const handleReset = () => {
    setSettings(defaultSettings);
    toast.info("Đã khôi phục cài đặt mặc định");
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSettings({
          ...settings,
          store: { ...settings.store, logo: result }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setSettings({
      ...settings,
      store: { ...settings.store, logo: "" }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="touch-btn">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Cài đặt</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReset}
              className="touch-btn"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Mặc định
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!hasChanges}
              className="touch-btn btn-gold"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-4 space-y-4 pb-20">
        {/* Store Info */}
        <section className="bg-card rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-muted-foreground uppercase tracking-wide text-sm">
            Thông tin cửa hàng
          </h2>
          
          {/* Logo */}
          <div className="space-y-2">
            <Label className="text-sm">Logo (đen trắng, tối ưu in nhiệt)</Label>
            <div className="flex items-center gap-4">
              {settings.store.logo ? (
                <div className="relative">
                  <img 
                    src={settings.store.logo} 
                    alt="Logo" 
                    className="h-16 w-auto object-contain bg-white rounded p-2"
                    style={{ filter: 'grayscale(100%)' }}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    onClick={handleRemoveLogo}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="h-16 w-24 border-2 border-dashed border-border rounded flex items-center justify-center text-muted-foreground">
                  <span className="text-xs">Chưa có logo</span>
                </div>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Tải lên</span>
                </div>
              </label>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label className="text-sm">Tên quán</Label>
              <Input
                value={settings.store.name}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, name: e.target.value }
                })}
                className="pos-input mt-1"
                placeholder="VD: LALA QUÁN"
              />
            </div>
            <div>
              <Label className="text-sm">Địa chỉ</Label>
              <Input
                value={settings.store.address}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, address: e.target.value }
                })}
                className="pos-input mt-1"
                placeholder="VD: 02 Lê Thanh Nghị, Đà Nẵng"
              />
            </div>
            <div>
              <Label className="text-sm">Số điện thoại (tuỳ chọn)</Label>
              <Input
                value={settings.store.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, phone: e.target.value }
                })}
                className="pos-input mt-1"
                placeholder="VD: 0905886007"
              />
            </div>
          </div>
        </section>

        {/* Bank Info */}
        <section className="bg-card rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-muted-foreground uppercase tracking-wide text-sm">
            Thông tin thanh toán
          </h2>
          
          <div className="grid gap-4">
            <div>
              <Label className="text-sm">Ngân hàng</Label>
              <Select
                value={settings.bank.bankName}
                onValueChange={(value) => setSettings({
                  ...settings,
                  bank: { ...settings.bank, bankName: value }
                })}
              >
                <SelectTrigger className="pos-input mt-1">
                  <SelectValue placeholder="Chọn ngân hàng" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(bankCodes).map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Tên chủ tài khoản</Label>
              <Input
                value={settings.bank.accountName}
                onChange={(e) => setSettings({
                  ...settings,
                  bank: { ...settings.bank, accountName: e.target.value.toUpperCase() }
                })}
                className="pos-input mt-1 uppercase"
                placeholder="VD: TRAN THI THUY"
              />
            </div>
            <div>
              <Label className="text-sm">Số tài khoản / SĐT</Label>
              <Input
                value={settings.bank.accountNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  bank: { ...settings.bank, accountNumber: e.target.value }
                })}
                className="pos-input mt-1 font-mono"
                placeholder="VD: 0905886007"
              />
            </div>
            <div>
              <Label className="text-sm">SĐT hiển thị trên hóa đơn</Label>
              <Input
                value={settings.bank.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  bank: { ...settings.bank, phone: e.target.value }
                })}
                className="pos-input mt-1"
                placeholder="VD: 0905886007"
              />
            </div>
          </div>
        </section>

        {/* Other Settings */}
        <section className="bg-card rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-muted-foreground uppercase tracking-wide text-sm">
            Cài đặt khác
          </h2>
          
          <div className="grid gap-4">
            <div>
              <Label className="text-sm">Thu ngân mặc định</Label>
              <Input
                value={settings.defaultCashier}
                onChange={(e) => setSettings({
                  ...settings,
                  defaultCashier: e.target.value
                })}
                className="pos-input mt-1"
                placeholder="VD: Thu ngân"
              />
            </div>
            <div>
              <Label className="text-sm">Ghi chú VAT</Label>
              <Input
                value={settings.vatNote}
                onChange={(e) => setSettings({
                  ...settings,
                  vatNote: e.target.value
                })}
                className="pos-input mt-1"
                placeholder="VD: Giá trên chưa bao gồm VAT"
              />
            </div>
            <div>
              <Label className="text-sm">Lời cảm ơn</Label>
              <Textarea
                value={settings.thankYouMessage}
                onChange={(e) => setSettings({
                  ...settings,
                  thankYouMessage: e.target.value
                })}
                className="pos-input mt-1 min-h-[80px]"
                placeholder="VD: Cảm ơn Quý Khách và Hẹn gặp lại!"
              />
            </div>
          </div>
        </section>

        {/* Print Settings Info */}
        <section className="bg-card rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-muted-foreground uppercase tracking-wide text-sm">
            Hướng dẫn in
          </h2>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Máy in:</strong> Xprinter XP-80T (USB)
            </p>
            <p>
              <strong className="text-foreground">App in:</strong> RawBT Print Service (Android)
            </p>
            <p>
              <strong className="text-foreground">Khổ giấy:</strong> 80mm
            </p>
            <div className="mt-3 p-3 bg-secondary/50 rounded-md">
              <p className="text-xs">
                <strong>Lưu ý:</strong> Đảm bảo RawBT đã được cài đặt và kết nối với máy in trước khi in.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
