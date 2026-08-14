import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

const app = express();
app.set("trust proxy", 1);
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Configs
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "datmat1";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || randomBytes(32).toString("hex");

const upload = multer({ storage: multer.memoryStorage() });

// --- Admin Auth Middleware ---
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let token = req.cookies.admin_session;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    jwt.verify(token, ADMIN_JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Checkout submission
app.post("/api/checkout", upload.single('screenshot'), async (req, res) => {
  try {
    const { name, phone, address, pincode, items, total, utr, promo_code, discount_amount } = req.body;
    const file = req.file;
    
    let itemsData = typeof items === 'string' ? JSON.parse(items) : items;
    if (promo_code) {
       itemsData = { list: itemsData, promo: { code: promo_code, discount: discount_amount } };
    }
    
    if (!/^[0-9]{12}$/.test(utr)) {
       return res.status(400).json({ error: "UTR must be exactly 12 digits" });
    }

    if (!file) {
      return res.status(400).json({ error: "Payment screenshot is required" });
    }

    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    let screenshotUrl = '';
    if (file && supabase) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return res.status(500).json({ error: "Failed to upload screenshot" });
      }

      const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
      screenshotUrl = publicUrlData.publicUrl;
    }

    // Generate a unique order number MT-XXXX
    const orderNumber = `MT-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert into database
    const { data: orderData, error: dbError } = await supabase.from('orders').insert({
      order_number: orderNumber,
      customer_name: name,
      phone,
      address,
      pincode,
      items: itemsData,
      total_amount: total,
      utr_number: utr,
      screenshot_url: screenshotUrl,
      status: 'pending'
    }).select().single();

    if (dbError) {
      console.error("DB error:", dbError);
      return res.status(500).json({ error: "Database error" });
    }

    // Optionally create/update customer
    const { data: customer } = await supabase.from('customers').select('*').eq('phone', phone).single();
    if (!customer) {
      await supabase.from('customers').insert({
        phone,
        name,
        total_spent: 0,
        order_count: 0
      });
    }

    res.json({ success: true, orderNumber });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Order status polling
app.get("/api/orders/status", async (req, res) => {
  const orderNumber = req.query.order;
  if (!orderNumber || !supabase) return res.status(400).json({ error: "Missing order number or db" });
  
  const { data, error } = await supabase.from('orders').select('status, rejection_reason, tracking_number').eq('order_number', orderNumber).single();
  if (error || !data) return res.status(404).json({ error: "Order not found" });
  
  res.json({ status: data.status, rejection_reason: data.rejection_reason, tracking_info: data.tracking_number });
});

// Store Settings
app.get("/api/store/settings", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "DB not configured" });
  const { data, error } = await supabase.from('store_settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const settings = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  res.json(settings);
});

// --- Admin APIs ---

app.post("/api/admin/auth/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, ADMIN_JWT_SECRET, { expiresIn: '1d' });
    res.cookie('admin_session', token, { httpOnly: true, path: '/', maxAge: 86400000, sameSite: 'none', secure: true });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

app.post("/api/admin/auth/logout", (req, res) => {
  res.clearCookie('admin_session', { path: '/', sameSite: 'none', secure: true });
  res.json({ success: true });
});

app.get("/api/admin/auth/me", adminAuth, (req, res) => {
  res.json({ user: "admin" });
});

app.get("/api/admin/orders", adminAuth, async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put("/api/admin/orders/:id/status", adminAuth, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "DB error" });
  const { id } = req.params;
  const { status, rejection_reason, courier_name, tracking_number } = req.body;
  
  const updateData: any = { status, updated_at: new Date() };
  if (rejection_reason !== undefined) updateData.rejection_reason = rejection_reason;
  if (courier_name !== undefined) updateData.courier_name = courier_name;
  if (tracking_number !== undefined) updateData.tracking_number = tracking_number;

  const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
  if (status === 'paid' && order && order.status !== 'paid') {
    // Deduct stock for items
    const itemsArray = Array.isArray(order.items) ? order.items : (order.items?.list || []);
    for (const item of itemsArray) {
      if (item.product?.id) {
        // Fetch product
        const { data: prod } = await supabase.from('products').select('stock_count, variants').eq('id', item.product.id).single();
        if (prod) {
           let newStock = Math.max(0, prod.stock_count - (item.quantity || 1));
           await supabase.from('products').update({ stock_count: newStock }).eq('id', item.product.id);
        }
      }
    }
    // Update customer CRM total spent
    if (order.phone) {
      const { data: customer } = await supabase.from('customers').select('*').eq('phone', order.phone).single();
      if (customer) {
        await supabase.from('customers').update({ 
          total_spent: Number(customer.total_spent) + Number(order.total_amount),
          order_count: Number(customer.order_count) + 1
        }).eq('phone', order.phone);
      }
    }
  }

  const { data, error } = await supabase.from('orders').update(updateData).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/admin/products", adminAuth, async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/admin/products", adminAuth, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "DB error" });
  const { name, category, price, stock_count, is_active } = req.body;
  const { data, error } = await supabase.from('products').insert({
    name, category, price: Number(price), stock_count: Number(stock_count), is_active
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put("/api/admin/products/:id", adminAuth, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "DB error" });
  const { id } = req.params;
  const { name, category, price, stock_count, is_active } = req.body;
  const { data, error } = await supabase.from('products').update({
    name, category, price: Number(price), stock_count: Number(stock_count), is_active
  }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete("/api/admin/products/:id", adminAuth, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "DB error" });
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/admin/customers", adminAuth, async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('customers').select('*').order('last_order_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put("/api/admin/customers/:phone/toggle-blacklist", adminAuth, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "DB error" });
  const { phone } = req.params;
  const { data: customer } = await supabase.from('customers').select('is_blacklisted').eq('phone', phone).single();
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  
  const { data, error } = await supabase.from('customers').update({ 
    is_blacklisted: !customer.is_blacklisted 
  }).eq('phone', phone).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put("/api/admin/settings", adminAuth, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "DB error" });
  const { key, value } = req.body;
  const { error } = await supabase.from('store_settings').upsert({ key, value, updated_at: new Date() });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/admin/analytics", adminAuth, async (req, res) => {
  if (!supabase) return res.json({});
  // Gross Revenue, Total Paid Orders, AOV, Total Inventory Valuation
  const { data: orders } = await supabase.from('orders').select('total_amount, status, created_at');
  const paidOrders = orders?.filter(o => o.status === 'paid' || o.status === 'shipped') || [];
  const grossRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const aov = paidOrders.length ? (grossRevenue / paidOrders.length) : 0;
  
  // Aggregate revenue by date for the chart
  const recentOrdersMap = paidOrders.reduce((acc: any, order: any) => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + Number(order.total_amount);
    return acc;
  }, {});

  const recentOrders = Object.keys(recentOrdersMap).map(date => ({
    date,
    revenue: recentOrdersMap[date]
  })).slice(-7); // last 7 days roughly, assuming chronological DB fetch or ordering
  
  res.json({
    grossRevenue,
    totalPaidOrders: paidOrders.length,
    aov,
    recentOrders
  });
});

// --- Vite Middleware ---
async function mountVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

mountVite();
