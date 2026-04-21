'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface Medicine {
  _id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  description: string;
  manufacturer: string;
  inStock: boolean;
  dosageForm: string;
  strength: string;
  requiresPrescription: boolean;
}

interface CartItem {
  medicineId: string;
  name: string;
  price: number;
  quantity: number;
  manufacturer: string;
}

const categories = [
  { name: 'Pain Relief', image: 'https://img.icons8.com/3d-fluency/40/bandage.png' },
  { name: 'Antibiotics', image: 'https://img.icons8.com/3d-fluency/40/pill.png' },
  { name: 'Gastrointestinal', image: 'https://img.icons8.com/3d-fluency/40/hospital.png' },
  { name: 'Diabetes', image: 'https://img.icons8.com/3d-fluency/40/syringe.png' },
  { name: 'Blood Pressure', image: 'https://img.icons8.com/3d-fluency/40/heart-with-pulse.png' },
  { name: 'Allergy', image: 'https://img.icons8.com/3d-fluency/40/stethoscope.png' },
  { name: 'Respiratory', image: 'https://img.icons8.com/3d-fluency/40/lungs.png' },
  { name: 'Supplements', image: 'https://cdn-icons-png.flaticon.com/128/3082/3082038.png' },
];

const medicineImages = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop',
];

export default function MedicinesPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    deliveryInstructions: '',
    paymentMethod: 'cod',
    couponCode: '',
  });

  useEffect(() => { fetchMedicines(); }, [category]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await api.get('/medicines', { params });
      setMedicines(res.data.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const addToCart = (med: Medicine) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.medicineId === med._id);
      if (existing) return prev.map((item) => item.medicineId === med._id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { medicineId: med._id, name: med.name, price: med.price, quantity: 1, manufacturer: med.manufacturer }];
    });
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  const updateQuantity = (medicineId: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.medicineId === medicineId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines();
  };

  const placeOrder = async () => {
    if (!checkoutForm.fullName.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim()) {
      setOrderError('Please fill in all required fields (Name, Phone, Address)');
      return;
    }
    setPlacingOrder(true);
    setOrderError('');
    try {
      const items = cart.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
      }));
      await api.post('/orders', {
        items,
        shippingAddress: checkoutForm.address + (checkoutForm.deliveryInstructions ? ` (${checkoutForm.deliveryInstructions})` : ''),
        phone: checkoutForm.phone,
        couponCode: checkoutForm.couponCode || undefined,
      });
      setOrderSuccess(true);
      setCart([]);
      setShowCheckout(false);
      setCheckoutForm({ fullName: '', phone: '', address: '', deliveryInstructions: '', paymentMethod: 'cod', couponCode: '' });
    } catch (err: any) {
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Medicines Online</h1>
            <p className="text-primary-100 mb-6">Get genuine medicines delivered to your doorstep. Save up to 15% on your first order!</p>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for medicines, health products..."
                className="flex-1 px-5 py-3.5 rounded-l-xl text-gray-900 focus:outline-none text-base"
              />
              <button type="submit" className="px-8 py-3.5 bg-accent-500 hover:bg-accent-600 rounded-r-xl font-semibold transition-colors">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Feature Strip */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Image src="https://img.icons8.com/3d-fluency/24/delivery.png" alt="delivery" width={20} height={20} /><span>Free delivery over ৳500</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Image src="https://img.icons8.com/3d-fluency/24/checkmark.png" alt="genuine" width={20} height={20} /><span>100% Genuine</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Image src="https://img.icons8.com/3d-fluency/24/refresh.png" alt="returns" width={20} height={20} /><span>Easy Returns</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Image src="https://img.icons8.com/3d-fluency/24/lock.png" alt="payment" width={20} height={20} /><span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Category Sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory('')}
                  className={'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' + (category === '' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50')}
                >
                  All Medicines
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name === category ? '' : cat.name)}
                    className={'w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' + (category === cat.name ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50')}
                  >
                    <Image src={cat.image} alt={cat.name} width={20} height={20} className="flex-shrink-0" />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Prescription Upload */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 text-sm mb-1">Upload Prescription</h4>
                <p className="text-xs text-blue-600 mb-3">Order from your prescription</p>
                <button className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Upload Photo
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Category Cards (Mobile) */}
            <div className="lg:hidden mb-6">
              <div className="flex gap-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setCategory('')}
                  className={'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ' + (category === '' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border')}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name === category ? '' : cat.name)}
                    className={'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ' + (category === cat.name ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border')}
                  >
                    <Image src={cat.image} alt={cat.name} width={16} height={16} className="inline-block mr-1" /> {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {category || 'All Medicines'}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {!loading && medicines.length + ' products found'}
                </span>
              </h2>
              <select className="text-sm border rounded-lg px-3 py-2 text-gray-600 bg-white">
                <option>Sort by: Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Name: A to Z</option>
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading medicines...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <span className="text-5xl mb-4 block">🔍</span>
                <p className="text-gray-500 text-lg">No medicines found</p>
                <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {medicines.map((med, idx) => {
                  const inCart = cart.find((c) => c.medicineId === med._id);
                  return (
                    <div key={med._id} className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group">
                      {/* Product Image */}
                      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center h-36">
                        <Image
                          src={medicineImages[idx % medicineImages.length]}
                          alt={med.name}
                          width={120}
                          height={120}
                          className="object-contain group-hover:scale-110 transition-transform"
                        />
                        {med.requiresPrescription && (
                          <span className="absolute top-2 left-2 bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Rx
                          </span>
                        )}
                        {!med.inStock && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <span className="text-sm font-bold text-red-500 bg-white px-3 py-1 rounded-full border border-red-200">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-3.5">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">{med.manufacturer}</p>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">{med.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{med.genericName} • {med.strength}</p>
                        <p className="text-xs text-gray-400 mb-3">{med.dosageForm}</p>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">৳{med.price}</span>
                          </div>
                          {med.inStock && (
                            inCart ? (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => inCart.quantity <= 1 ? removeFromCart(med._id) : updateQuantity(med._id, -1)}
                                  className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-sm font-bold"
                                >
                                  −
                                </button>
                                <span className="w-7 text-center text-sm font-semibold">{inCart.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(med._id, 1)}
                                  className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 text-sm font-bold"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(med)}
                                className="px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                Add
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button (Mobile) */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-4 right-4 lg:hidden z-40">
          <button
            onClick={() => setShowCart(true)}
            className="bg-primary-600 text-white px-5 py-3 rounded-full shadow-lg flex items-center space-x-2 font-semibold"
          >
            <span className="bg-white text-primary-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{cartItemCount}</span>
            <span>৳{cartTotal}</span>
          </button>
        </div>
      )}

      {/* Cart Overlay */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Shopping Cart ({cartItemCount})</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">🛒</span>
                  <p className="text-gray-500">Your cart is empty</p>
                  <button onClick={() => setShowCart(false)} className="mt-4 text-primary-600 font-medium text-sm">Continue Shopping</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.medicineId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💊</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-400">{item.manufacturer}</p>
                        <p className="text-sm font-bold text-primary-600 mt-1">৳{item.price * item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => item.quantity <= 1 ? removeFromCart(item.medicineId) : updateQuantity(item.medicineId, -1)}
                          className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.medicineId, 1)}
                          className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.medicineId)} className="text-gray-300 hover:text-red-500 text-lg">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && !showCheckout && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">{cartTotal >= 500 ? 'Free' : '৳50'}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">৳{cartTotal + (cartTotal >= 500 ? 0 : 50)}</span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}

            {showCheckout && (
              <div className="border-t p-4">
                <button onClick={() => setShowCheckout(false)} className="text-sm text-gray-500 mb-3">&larr; Back to cart</button>
                <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
                <input type="text" placeholder="Full Name *" value={checkoutForm.fullName} onChange={(e) => setCheckoutForm({...checkoutForm, fullName: e.target.value})} className="input-field w-full mb-2" />
                <input type="text" placeholder="Phone Number *" value={checkoutForm.phone} onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})} className="input-field w-full mb-2" />
                <textarea placeholder="Full Address *" value={checkoutForm.address} onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})} className="input-field w-full mb-2" rows={2}></textarea>
                <textarea placeholder="Delivery Instructions (optional)" value={checkoutForm.deliveryInstructions} onChange={(e) => setCheckoutForm({...checkoutForm, deliveryInstructions: e.target.value})} className="input-field w-full mb-2" rows={2}></textarea>

                <h3 className="font-bold text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2 mb-4">
                  <label className={'flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ' + (checkoutForm.paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:bg-gray-50')}>
                    <input type="radio" name="payment" checked={checkoutForm.paymentMethod === 'cod'} onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'cod'})} className="mr-3" />
                    <span>💵 Cash on Delivery</span>
                  </label>
                  <label className={'flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ' + (checkoutForm.paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:bg-gray-50')}>
                    <input type="radio" name="payment" checked={checkoutForm.paymentMethod === 'card'} onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'card'})} className="mr-3" />
                    <span>💳 Credit/Debit Card</span>
                  </label>
                  <label className={'flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ' + (checkoutForm.paymentMethod === 'mobile' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:bg-gray-50')}>
                    <input type="radio" name="payment" checked={checkoutForm.paymentMethod === 'mobile'} onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'mobile'})} className="mr-3" />
                    <span>📱 bKash / Nagad</span>
                  </label>
                </div>

                <h3 className="font-bold text-gray-900 mb-2">Coupon Code</h3>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="e.g. HEALTH10" value={checkoutForm.couponCode} onChange={(e) => setCheckoutForm({...checkoutForm, couponCode: e.target.value})} className="input-field flex-1" />
                  <span className="text-xs text-gray-400 self-center">Try HEALTH10 for 10% off</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl mb-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">৳{cartTotal + (cartTotal >= 500 ? 0 : 50)}</span>
                  </div>
                </div>

                {orderError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm mb-3 text-red-700">
                    {orderError}
                  </div>
                )}

                {!user && (
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm mb-3 text-yellow-700">
                    Please <Link href="/login" className="underline font-medium">login</Link> to place your order.
                  </div>
                )}

                <button
                  onClick={placeOrder}
                  disabled={!user || placingOrder}
                  className={'w-full py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ' + (user && !placingOrder ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed')}
                >
                  {placingOrder ? (
                    <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> Placing Order...</>
                  ) : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h3>
            <p className="text-gray-500 text-sm mb-6">Your medicine order has been placed successfully. We will notify you when it is being processed.</p>
            <div className="flex gap-3">
              <button onClick={() => { setOrderSuccess(false); setShowCart(false); }} className="flex-1 btn-primary">Continue Shopping</button>
              <Link href="/dashboard" onClick={() => setOrderSuccess(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 text-center text-sm">View Orders</Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Cart Button */}
      {cart.length > 0 && !showCart && (
        <div className="hidden lg:fixed lg:bottom-6 lg:right-6 lg:block z-40">
          <button
            onClick={() => setShowCart(true)}
            className="bg-primary-600 text-white px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow flex items-center space-x-3 font-semibold"
          >
            <span className="relative">
              🛒
              <span className="absolute -top-2 -right-2 bg-accent-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">{cartItemCount}</span>
            </span>
            <span>View Cart</span>
            <span className="bg-white/20 px-3 py-1 rounded-lg">৳{cartTotal}</span>
          </button>
        </div>
      )}
    </div>
  );
}