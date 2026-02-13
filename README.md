# Wingi Restaurant Management System - Project Structure

## 📁 الملفات التي تم إنشاؤها

### 1. Configuration Files (ملفات الإعدادات)
- . `/src/config/firebase.js` - إعدادات Firebase
- . `/src/config/constants.js` - الثوابت والمتغيرات العامة
- . `/src/config/translations.js` - الترجمات (عربي/إنجليزي/تركي)

### 2. Utilities (الأدوات المساعدة)
- . `/src/utils/dateUtils.js` - دوال التاريخ والوقت
- . `/src/utils/inventoryUtils.js` - دوال المخزون
- . `/src/utils/exportUtils.js` - دوال التصدير (CSV, PDF)

### 3. Services (الخدمات)
- . `/src/services/accountingService.js` - خدمة المحاسبة
- . `/src/services/storageService.js` - خدمة رفع الصور
- . `/src/services/invoiceService.js` - خدمة الفواتير

### 4. Components (المكونات)
- . `/src/components/ui/LuxuryComponents.jsx` - المكونات الأساسية

## 📋 الملفات المتبقية (يجب إنشاؤها)

### Components Directory
```
/src/components/
├── admin/
│   ├── Portal.jsx                  # بوابة الإدارة
│   ├── AdminAuth.jsx               # تسجيل دخول الإدارة
│   ├── AdminDashboard.jsx          # لوحة التحكم الرئيسية
│   ├── MenuManagement.jsx          # إدارة قائمة الطعام
│   ├── OrdersManagement.jsx        # إدارة الطلبات
│   ├── InventoryManagement.jsx     # إدارة المخزون
│   ├── FinanceManagement.jsx       # الإيرادات والإخراجات
│   ├── AccountingPanel.jsx         # القيود اليومية
│   ├── ReportsPanel.jsx            # التقارير
│   ├── BalanceSheet.jsx            # الميزانية العمومية
│   ├── CashFlow.jsx                # التدفقات النقدية
│   ├── InvoicesManagement.jsx      # إدارة الفواتير
│   ├── CustomersManagement.jsx     # إدارة العملاء
│   ├── CustomerLedger.jsx          # كشف حساب عميل
│   ├── ReceiptsPage.jsx            # سندات القبض
│   ├── VendorsManagement.jsx       # إدارة الموردين
│   ├── BillsManagement.jsx         # فواتير المشتريات
│   ├── VendorPayments.jsx          # سندات صرف الموردين
│   ├── AccountingSettings.jsx      # إعدادات المحاسبة
│   └── AccountsManager.jsx         # إدارة حسابات الموظفين
│
├── customer/
│   ├── TableSelection.jsx          # اختيار الطاولة
│   ├── CustomerMenu.jsx            # قائمة الطعام للعميل
│   ├── CartDrawer.jsx              # سلة التسوق
│   ├── NotesModal.jsx              # ملاحظات الطلب
│   ├── OrderSuccess.jsx            # شاشة نجاح الطلب
│   └── ReceiptModal.jsx            # عرض إيصال التحويل
│
└── modals/
    ├── CreateOrderModal.jsx        # إضافة طلب جديد
    ├── VIPModal.jsx                # إدارة العملاء الدائمين
    ├── InventoryLinkModal.jsx      # ربط المخزون بالمنيو
    ├── InventoryEditModal.jsx      # تعديل عنصر مخزون
    └── ProductEditModal.jsx        # تعديل منتج
```

### Hooks Directory
```
/src/hooks/
├── useAuth.js                      # Hook للمصادقة
├── useFirestore.js                 # Hook لقاعدة البيانات
├── useInventory.js                 # Hook للمخزون
├── useOrders.js                    # Hook للطلبات
└── useAccounting.js                # Hook للمحاسبة
```

### Contexts Directory
```
/src/contexts/
├── AppContext.jsx                  # Context عام للتطبيق
├── AuthContext.jsx                 # Context للمصادقة
└── LanguageContext.jsx             # Context للغة
```

## 🔧 كيفية استكمال المشروع

1. **نقل المكونات الكبيرة**:
   - افتح `App.jsx` الأصلي
   - انسخ كل Component لملف منفصل
   - استورد المكونات في الملف الرئيسي

2. **إنشاء Hooks مخصصة**:
   ```javascript
   // مثال: /src/hooks/useOrders.js
   export function useOrders() {
     const [orders, setOrders] = useState([]);
     // ... logic
     return { orders, setOrders };
   }
   ```

3. **تنظيم الـ State Management**:
   - استخدم Context API للحالة العامة
   - أو استخدم Redux/Zustand للحالات المعقدة

## 📦 الملف الرئيسي الجديد

```javascript
// /src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Portal from './components/admin/Portal';
import CustomerView from './components/customer/CustomerView';
import AdminDashboard from './components/admin/AdminDashboard';
// ... imports

function App() {
  const [appMode, setAppMode] = useState('customer');
  // ... logic
  
  return (
    <BrowserRouter>
      {appMode === 'portal' && <Portal />}
      {appMode === 'admin' && <AdminDashboard />}
      {appMode === 'customer' && <CustomerView />}
    </BrowserRouter>
  );
}

export default App;
```

## 🎯 الخطوات التالية

1. . تم إنشاء الملفات الأساسية
2. ⏳ إنشاء مكونات الإدارة
3. ⏳ إنشاء مكونات العميل
4. ⏳ إنشاء Hooks مخصصة
5. ⏳ إنشاء Contexts
6. ⏳ دمج كل شيء في App.jsx الرئيسي

## 📝 ملاحظات مهمة

- كل ملف يجب أن يكون مسؤول عن وظيفة واحدة فقط
- استخدم Props بدلاً من State العام عندما يكون ممكناً
- اتبع مبدأ Single Responsibility
- استخدم TypeScript للحصول على Type Safety (اختياري)