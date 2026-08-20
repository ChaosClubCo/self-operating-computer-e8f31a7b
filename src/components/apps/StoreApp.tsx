import React, { useState } from "react";
import { ShoppingBag, ShoppingCart, Star, Check, ArrowRight, ShieldCheck, Heart, Sparkles, X } from "lucide-react";

export const StoreApp: React.FC = () => {
  const [cart, setCart] = useState<Array<{ id: number; title: string; price: number; qty: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  const products = [
    {
      id: 101,
      title: "Noise Cancelling Studio Pro",
      category: "audio",
      price: 249.99,
      rating: 4.9,
      tag: "Best Seller",
      description: "Next-gen spatial audio with 40h battery and smart ambient isolation."
    },
    {
      id: 102,
      title: "Ultralight Mechanical Keyboard",
      category: "peripherals",
      price: 129.50,
      rating: 4.8,
      tag: "New",
      description: "Low-profile tactile switches with per-key RGB backlighting and USB-C."
    },
    {
      id: 103,
      title: "4K AI Vision Web Camera",
      category: "video",
      price: 189.00,
      rating: 4.7,
      tag: "Top Rated",
      description: "Ultra-wide sensor with hardware framing, HDR, and dual beamforming mics."
    },
    {
      id: 104,
      title: "Precision Trackball Mouse",
      category: "peripherals",
      price: 79.99,
      rating: 4.6,
      tag: "Ergonomic",
      description: "Ergonomic 20-degree sculpted grip with high-DPI optical sensor."
    }
  ];

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: product.id, title: product.title, price: product.price, qty: 1 }];
    });
    setCheckoutSuccess(false);
  };

  const totalAmount = cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0);

  const handleCheckout = () => {
    setCart([]);
    setCheckoutSuccess(true);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden text-xs">
      {/* Store Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs sm:text-sm tracking-tight text-zinc-100">TechStore Hardware</span>
        </div>

        {/* Cart Button */}
        <button
          type="button"
          onClick={() => setShowCartDrawer(!showCartDrawer)}
          data-som="store-cart-btn"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-all font-mono text-[11px]"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cart ({cart.reduce((a, c) => a + c.qty, 0)})</span>
          {totalAmount > 0 && (
            <span className="text-emerald-400 font-bold ml-1">${totalAmount.toFixed(2)}</span>
          )}
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="px-3 sm:px-4 py-2 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
        {["all", "peripherals", "audio", "video"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            data-som={`store-cat-${cat}`}
            className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-medium transition-all shrink-0 ${
              selectedCategory === cat
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                : "bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {checkoutSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Order successfully placed and sent to agent queue!</span>
            </div>
            <button onClick={() => setCheckoutSuccess(false)} className="text-zinc-400 hover:text-zinc-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredProducts.map((p) => {
            const inCart = cart.find(i => i.id === p.id);
            return (
              <div
                key={p.id}
                data-som={`store-product-${p.id}`}
                className="p-3 sm:p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold">
                      {p.tag}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{p.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-zinc-100 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-400 font-mono">
                    ${p.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addToCart(p)}
                    data-som={`store-add-${p.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>{inCart ? `Add (${inCart.qty})` : "Add to Cart"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Drawer / Summary */}
        {showCartDrawer && (
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-xs text-zinc-200">Your Cart</span>
              <button onClick={() => setShowCartDrawer(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-4 text-zinc-500 text-[11px]">
                Your cart is empty. Click "Add to Cart" on items above.
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-300 truncate max-w-[180px]">{item.title}</span>
                    <span className="font-mono text-zinc-400">{item.qty} × ${item.price.toFixed(2)}</span>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 text-xs font-bold text-zinc-100">
                  <span>Total</span>
                  <span className="font-mono text-emerald-400 text-sm">${totalAmount.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  data-som="store-checkout-btn"
                  className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Complete Fast Checkout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
