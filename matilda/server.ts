import "dotenv/config";
import express from "express";
import path from "path";
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
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "matilda-stable-secret-key-123456";
const MAX_ORDER_AMOUNT = 2000;

// High-Performance In-Memory Settings Cache (30s TTL)
let cachedSettings: Record<string, any> | null = null;
let settingsCacheExpiry = 0;

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

    const numTotal = Number(total);
    if (isNaN(numTotal) || numTotal <= 0) {
      return res.status(400).json({ error: "Invalid total order amount" });
    }

    // Strict validation: Max order amount is 2000 at once
    if (numTotal > MAX_ORDER_AMOUNT) {
      return res.status(400).json({
        error: `Maximum order amount is ₹${MAX_ORDER_AMOUNT.toLocaleString('en-IN')} at once. Please reduce your order or place separate orders.`
      });
    }
    
    let itemsData = typeof items === 'string' ? JSON.parse(items) : items;
    if (promo_code) {
       itemsData = { list: itemsData, promo: { code: promo_code, discount: discount_amount } };
    }
    
    if (!/^[0-9]{12}$/.test(utr)) {
       return res.status(400).json({ error: "UTR must be exactly 12 digits" });
    }

    // Screenshot is now optional
    let screenshotUrl = '';
    if (file && supabase) {
      const sanitizedName = file.originalname ? file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_') : 'screenshot.jpg';
      const fileName = `${Date.now()}-${sanitizedName}`;
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
          screenshotUrl = publicUrlData.publicUrl || '';
        } else {
          console.warn("Supabase storage upload warning (proceeding with order):", uploadError.message);
          // Inline base64 fallback for images under 3MB so proof is preserved even if storage bucket is unconfigured
          if (file.buffer && file.buffer.length < 3 * 1024 * 1024) {
            screenshotUrl = `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`;
          }
        }
      } catch (storageErr) {
        console.warn("Storage upload exception (proceeding with order):", storageErr);
        if (file.buffer && file.buffer.length < 3 * 1024 * 1024) {
          screenshotUrl = `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`;
        }
      }
    }

    // Generate a unique order number MT-XXXX
    const orderNumber = `MT-${Math.floor(1000 + Math.random() * 9000)}`;

    if (supabase) {
      // Insert into database
      const { data: orderData, error: dbError } = await supabase.from('orders').insert({
        order_number: orderNumber,
        customer_name: name,
        phone,
        address: `${address}, Pincode: ${pincode}`,
        items: itemsData,
        total_amount: numTotal,
        utr_number: utr,
        screenshot_url: screenshotUrl,
        status: 'pending'
      }).select().single();

      if (dbError) {
        console.warn("DB insert warning:", dbError.message);
      }

      // Optionally create/update customer
      try {
        const { data: customer } = await supabase.from('customers').select('*').eq('phone', phone).single();
        if (!customer) {
          await supabase.from('customers').insert({
            phone,
            name,
            total_spent: 0,
            order_count: 0
          });
        }
      } catch (cErr) {
        console.warn("Customer CRM update warning:", cErr);
      }
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

// Store Settings with High-Performance In-Memory Cache
app.get("/api/store/settings", async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
  
  const now = Date.now();
  if (cachedSettings && now < settingsCacheExpiry) {
    return res.json(cachedSettings);
  }

  if (!supabase) return res.status(500).json({ error: "DB not configured" });
  const { data, error } = await supabase.from('store_settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  
  const settings = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  cachedSettings = settings;
  settingsCacheExpiry = now + 30000; // 30s cache TTL

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
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/admin/upload", adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: "Database not configured" });
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Ensure we use a safe, unique filename
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
    res.json({ url: publicUrlData.publicUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/products", adminAuth, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "DB error" });
  
  const { 
    id, slug, title, collection, category, price, stock_count, description, details, 
    mainImage, lifestyleImage, galleryImages, imageFit, variants, 
    isFeatured, hasVictorianFrame, material 
  } = req.body;

  const { data, error } = await supabase.from('products').insert({
    id: id || slug || title?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    slug: slug || title?.toLowerCase().replace(/[^a-z0-9]/g, '-'), 
    title, collection, category, price: Number(price), stock_count: Number(stock_count || 0), description, 
    details: details || [], 
    mainImage, lifestyleImage, 
    galleryImages: galleryImages || [], 
    imageFit: imageFit || null, 
    variants: variants || [], 
    isFeatured: !!isFeatured, 
    hasVictorianFrame: !!hasVictorianFrame, 
    material 
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put("/api/admin/products/:id", adminAuth, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "DB error" });
  const { id } = req.params;
  const { 
    slug, title, collection, category, price, stock_count, description, details, 
    mainImage, lifestyleImage, galleryImages, imageFit, variants, 
    isFeatured, hasVictorianFrame, material 
  } = req.body;

  const { data, error } = await supabase.from('products').update({
    slug, title, collection, category, price: Number(price), stock_count: Number(stock_count || 0), description, 
    details: details || [], 
    mainImage, lifestyleImage, 
    galleryImages: galleryImages || [], 
    imageFit: imageFit || null, 
    variants: variants || [], 
    isFeatured: !!isFeatured, 
    hasVictorianFrame: !!hasVictorianFrame, 
    material 
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
  
  // Invalidate in-memory cache
  cachedSettings = null;
  settingsCacheExpiry = 0;
  
  res.json({ success: true });
});

app.get("/api/admin/analytics", adminAuth, async (req, res) => {
  if (!supabase) return res.json({});
  // Gross Revenue, Total Paid Orders, AOV, Total Inventory Valuation
  const { data: orders } = await supabase.from('orders').select('id, order_number, customer_name, total_amount, status, created_at').order('created_at', { ascending: false });
  const allOrders = orders || [];
  const paidOrders = allOrders.filter(o => o.status === 'paid' || o.status === 'shipped');
  
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
  })).slice(-7); // last 7 days roughly

  const latestTransactions = allOrders.slice(0, 15);
  
  res.json({
    grossRevenue,
    totalPaidOrders: paidOrders.length,
    aov,
    recentOrders,
    latestTransactions
  });
});

// --- Vite Middleware ---
async function mountVite() {
  if (process.env.VERCEL) return;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}
mountVite();

export default app;
