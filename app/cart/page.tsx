"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Plus, Minus, ShoppingCart, X, Sparkles } from "lucide-react";
import FloatingBubbles from "../../components/FloatingBubbles";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
}

export default function CartPage() {
  // Load cart from localStorage if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("waterBarCart");
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (e) {
          console.error("Error loading cart:", e);
        }
      }
    }
    return [
      {
        id: "1",
        name: "Crystal Water Bottle",
        price: 120,
        image: "/amethyst-hydration.png",
        quantity: 1,
        description: "Infuse your water with crystal energy for enhanced hydration and wellness.",
      },
      {
        id: "2",
        name: "Bamboo Straw Set",
        price: 35,
        image: "/natural-bamboo-straws.png",
        quantity: 2,
        description: "Eco-friendly bamboo straws for sustainable sipping.",
      },
      {
        id: "3",
        name: "Water Blessing Cards",
        price: 45,
        image: "/mystical-oracle-spread.png",
        quantity: 1,
        description: "Set intentions for your water with these beautiful blessing cards.",
      },
    ];
  });

  const [recommendations, setRecommendations] = useState<CartItem[]>([
    {
      id: "4",
      name: "Hydration Tracking Bottle",
      price: 85,
      image: "/connected-hydration.png",
      quantity: 1,
      description: "Smart bottle that tracks your water intake and glows to remind you to drink.",
    },
    {
      id: "5",
      name: "Mineral Drops",
      price: 29,
      image: "/shimmering-mineral-drops.png",
      quantity: 1,
      description: "Add essential minerals to your water for enhanced hydration and electrolyte balance.",
    },
  ]);

  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("waterBarCart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const updateQuantity = (id: string, change: number) => {
    setCartItems((items) =>
      items
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
    setShowRecommendations(false);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      setCartItems([]);
      setIsCheckingOut(false);
      alert("Thank you for your purchase! Your order has been placed.");
    }, 1500);
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col">
      <FloatingBubbles count={8} maxSize={25} />
      {/* Header */}
      <motion.div
        className="flex items-center p-4 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-light text-white ml-4">Your Cart</h1>
        <div className="ml-auto flex items-center">
          <ShoppingCart className="w-5 h-5 text-white" />
          <span className="ml-1 text-white">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
      </motion.div>
      {/* Main content */}
      <div className="flex-1 flex flex-col p-4 z-10 overflow-y-auto">
        {cartItems.length > 0 ? (
          <>
            {/* Cart items */}
            <div className="space-y-3 mb-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 flex items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 mr-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.name}</h3>
                    <p className="text-white/80 text-xs line-clamp-1">{item.description}</p>
                    <p className="text-white/80 text-sm">AED {item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-white w-6 text-center">{item.quantity}</span>
                    <button
                      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                    <button
                      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ml-2"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Recommendations */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-medium flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
                  Recommended for You
                </h2>
                <button
                  className="text-white/80 text-sm underline"
                  onClick={() => setShowRecommendations(!showRecommendations)}
                >
                  {showRecommendations ? "Hide" : "Show"}
                </button>
              </div>
              <AnimatePresence>
                {showRecommendations && (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {recommendations.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 flex items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 mr-3">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{item.name}</h3>
                          <p className="text-white/80 text-xs line-clamp-2">{item.description}</p>
                          <p className="text-white/80 text-sm">AED {item.price}</p>
                        </div>
                        <button
                          className="px-3 py-2 rounded-lg bg-blue-500/50 text-white text-sm"
                          onClick={() => addToCart(item)}
                        >
                          Add
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {/* Order summary */}
            <motion.div
              className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h2 className="text-white font-medium mb-3">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal</span>
                  <span>AED {subtotal}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `AED ${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <div className="text-xs text-white/60 italic">Free shipping on orders over AED 200</div>
                )}
                <div className="border-t border-white/20 pt-2 mt-2"></div>
                <div className="flex justify-between text-white font-medium">
                  <span>Total</span>
                  <span>AED {total}</span>
                </div>
              </div>
            </motion.div>
            {/* Action buttons */}
            <div className="space-y-3">
              <motion.button
                className="w-full py-4 rounded-full bg-blue-500/60 backdrop-blur-sm border border-white/30 text-white font-medium"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.7)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
              </motion.button>
              <motion.button
                className="w-full py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white"
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                onClick={clearCart}
              >
                Clear Cart
              </motion.button>
            </div>
          </>
        ) : (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ShoppingBag className="w-16 h-16 text-white/50 mb-4" />
            <h2 className="text-xl text-white mb-2">Your cart is empty</h2>
            <p className="text-white/70 max-w-xs">
              Browse our shop to find sustainable water bottles, filters, and wellness products.
            </p>
            <motion.button
              className="mt-6 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Shop
            </motion.button>
            {/* Show recommendations even when cart is empty */}
            {recommendations.length > 0 && (
              <motion.div
                className="w-full mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h2 className="text-white font-medium flex items-center justify-center mb-4">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
                  Recommended for You
                </h2>
                <div className="space-y-3">
                  {recommendations.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 flex items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 mr-3">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{item.name}</h3>
                        <p className="text-white/80 text-xs line-clamp-2">{item.description}</p>
                        <p className="text-white/80 text-sm">AED {item.price}</p>
                      </div>
                      <button
                        className="px-3 py-2 rounded-lg bg-blue-500/50 text-white text-sm"
                        onClick={() => addToCart(item)}
                      >
                        Add
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
