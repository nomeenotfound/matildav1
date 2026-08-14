import React, { useState, useEffect } from 'react';
import { useCollection } from '../context/CollectionContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, UploadCloud } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, isCartOpen, setIsCartOpen } = useCollection();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    utr: ''
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [availablePromos, setAvailablePromos] = useState<any[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  
  const [upiConfig] = useState({ upi_id: import.meta.env.VITE_UPI_ID || 'your-upi-id@okbank', payee_name: 'Matilda Studio' });
  
  useEffect(() => {
    if (isCartOpen) setIsCartOpen(false);
    fetch('/api/store/settings').then(r => r.json()).then(d => {
      
      if (d.promos) {
        try {
          setAvailablePromos(JSON.parse(d.promos));
        } catch(e) {}
      }
    }).catch(console.error);
  }, [isCartOpen, setIsCartOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiConfig.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPromo = () => {
    setPromoError('');
    if (!promoCodeInput.trim()) return;
    
    const validPromo = availablePromos.find(p => p.code.toLowerCase() === promoCodeInput.trim().toLowerCase() && p.is_active);
    if (validPromo) {
      setAppliedPromo(validPromo);
      setPromoCodeInput('');
    } else {
      setPromoError('Invalid or inactive promo code');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  const total = cartTotal;
  const discountAmount = appliedPromo ? (total * (appliedPromo.discount_percentage / 100)) : 0;
  const finalTotal = Math.max(0, total - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[0-9]{12}$/.test(formData.utr)) {
      setError('utr must be exactly 12 digits.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const fullAddress = `${formData.street}${formData.apartment ? `, ${formData.apartment}` : ''}, ${formData.city}, ${formData.state}`;
      
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('phone', formData.phone);
      payload.append('address', fullAddress);
      payload.append('pincode', formData.pincode);
      payload.append('utr', formData.utr);
      payload.append('total', finalTotal.toString());
      if (appliedPromo) {
        payload.append('promo_code', appliedPromo.code);
        payload.append('discount_amount', discountAmount.toString());
      }
      payload.append('items', JSON.stringify(cart));
      payload.append('screenshot', file);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        body: payload
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'failed to submit order.');
      
      navigate(`/?order=${json.orderNumber}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 min-h-[80vh] flex flex-col items-center justify-center text-center">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-24 left-4 sm:left-8 w-10 h-10 rounded-full bg-[var(--bg-primary)]/60 backdrop-blur-md flex items-center justify-center text-[var(--text-dominant)] hover:bg-[var(--border-maroon)] hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="max-w-lg w-full mx-auto space-y-6">
          <h1 className="font-display text-3xl font-bold lowercase tracking-tight text-[var(--text-dominant)]">your cart is empty.</h1>
          <button 
            onClick={() => navigate('/')} 
            className="px-8 py-3.5 rounded-full bg-[var(--border-maroon)] text-white font-medium lowercase tracking-wide hover:bg-[var(--text-dominant)] transition-all shadow-sm text-sm"
          >
            return to shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-28 pb-24 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto min-h-screen">
      
      <button 
        onClick={() => navigate('/')} 
        className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 hover:bg-[var(--border-maroon)] hover:text-white hover:border-transparent transition-all font-medium text-xs lowercase tracking-wide group shadow-sm text-[var(--text-dominant)]"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
        back to shop
      </button>

      <div className="mb-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold lowercase tracking-tight text-[var(--text-dominant)]">checkout.</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Shipping */}
        <div className="lg:col-span-7">
          <section className="bg-[var(--bg-primary)]/40 backdrop-blur-xl border border-[var(--border-main)]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-display text-xl font-bold lowercase text-[var(--text-dominant)] mb-8 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--border-maroon)] text-white flex items-center justify-center text-xs">1</span>
              shipping details
            </h2>
            <form id="checkout-form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-1">
                  <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">full name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 rounded-2xl px-5 py-3.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-maroon)] shadow-xs transition-all" />
                </div>
                
                <div className="sm:col-span-1">
                  <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">whatsapp number</label>
                  <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 rounded-2xl px-5 py-3.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-maroon)] shadow-xs transition-all" />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">street address</label>
                  <input required type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 rounded-2xl px-5 py-3.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-maroon)] shadow-xs transition-all" />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">apartment, suite (optional)</label>
                  <input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange} className="w-full bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 rounded-2xl px-5 py-3.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-maroon)] shadow-xs transition-all" />
                </div>
                
                <div className="sm:col-span-1">
                  <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">city</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 rounded-2xl px-5 py-3.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-maroon)] shadow-xs transition-all" />
                </div>
                
                <div className="sm:col-span-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">state</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 rounded-2xl px-5 py-3.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-maroon)] shadow-xs transition-all" />
                  </div>
                  <div>
                    <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">pincode</label>
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 rounded-2xl px-5 py-3.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-maroon)] shadow-xs transition-all" />
                  </div>
                </div>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Payment & Proof */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-[var(--bg-primary)]/40 backdrop-blur-xl border border-[var(--border-main)]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-display text-xl font-bold lowercase text-[var(--text-dominant)] mb-8 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--border-maroon)] text-white flex items-center justify-center text-xs">2</span>
              payment
            </h2>
            <div className="flex flex-col xl:flex-row items-center xl:items-start gap-8">
              <div className="bg-white p-3 rounded-3xl border border-[var(--border-main)]/10 shadow-sm shrink-0">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?pa=${upiConfig.upi_id}&pn=${encodeURIComponent(upiConfig.payee_name)}&am=${finalTotal}&cu=INR`)}`} alt="UPI QR Code" className="w-[120px] h-[120px] rounded-xl" />
              </div>
              <div className="flex flex-col items-center xl:items-start w-full">
                {appliedPromo ? (
                  <div className="mb-4 text-center xl:text-left">
                    <p className="font-display font-medium text-lg text-gray-400 line-through">₹{total}</p>
                    <p className="font-display font-bold text-4xl text-[var(--border-maroon)]">₹{finalTotal}</p>
                    <p className="font-micro uppercase tracking-widest text-[10px] text-green-600 mt-1">
                      {appliedPromo.discount_percentage}% off applied
                    </p>
                  </div>
                ) : (
                  <p className="font-display font-bold text-4xl mb-4 text-[var(--border-maroon)]">₹{total}</p>
                )}
                
                <div className="flex items-center w-full border border-[var(--border-main)]/20 bg-[var(--bg-primary)]/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-xs">
                   <span className="py-3 px-4 text-xs flex-1 text-center xl:text-left font-mono font-medium text-[var(--text-dominant)]">{upiConfig.upi_id}</span>
                   <button type="button" onClick={copyUpi} className="py-3 px-4 bg-[var(--border-main)]/10 hover:bg-[var(--border-maroon)] hover:text-white transition-all flex items-center justify-center min-w-[50px] text-[var(--text-dominant)]">
                     {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-[var(--border-main)]/10">
              <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">promo code</label>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-5 py-3.5">
                  <span className="font-micro uppercase tracking-widest text-xs text-green-700 font-bold">{appliedPromo.code}</span>
                  <button type="button" onClick={removePromo} className="text-xs font-medium text-red-500 hover:text-red-700 lowercase">remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value.toUpperCase())} className="flex-1 bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 rounded-2xl px-5 py-3.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-maroon)] shadow-xs uppercase transition-all" placeholder="Enter code" />
                  <button type="button" onClick={applyPromo} className="px-6 rounded-2xl bg-[var(--border-main)]/10 hover:bg-[var(--border-maroon)] hover:text-white transition-all font-medium text-xs lowercase">apply</button>
                </div>
              )}
              {promoError && <p className="text-red-500 font-micro text-[10px] mt-2 ml-1">{promoError}</p>}
            </div>
          </section>

          <section className="bg-[var(--bg-primary)]/40 backdrop-blur-xl border border-[var(--border-main)]/10 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-display text-xl font-bold lowercase text-[var(--text-dominant)] mb-8 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--border-maroon)] text-white flex items-center justify-center text-xs">3</span>
              proof
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">12-digit UTR</label>
                <input form="checkout-form" required type="text" name="utr" value={formData.utr} onChange={handleInputChange} className="w-full bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 rounded-2xl px-5 py-3.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-maroon)] shadow-xs transition-all" />
              </div>
              
              <div>
                <label className="block font-display text-xs font-bold lowercase mb-2 pl-1 text-[var(--text-dominant)]">screenshot upload (optional)</label>
                <div className="relative bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/20 border-dashed rounded-2xl hover:bg-[var(--border-main)]/5 transition-colors p-8 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-xs">
                  <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud className="w-8 h-8 text-[var(--border-maroon)]/70" />
                  <p className="font-display font-medium text-xs lowercase text-center text-[var(--text-secondary)]">
                    {file ? file.name : 'drag or click to upload'}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <div className="pt-2">
            {error && <div className="text-red-500 bg-red-50 font-display font-medium text-xs lowercase p-4 rounded-2xl border border-red-200 mb-4 text-center">{error}</div>}
            
            <button form="checkout-form" type="submit" disabled={loading} className="w-full py-4 bg-[var(--border-maroon)] text-white font-medium lowercase tracking-wide text-sm rounded-full hover:bg-[var(--text-dominant)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
              {loading ? 'processing...' : 'complete order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
