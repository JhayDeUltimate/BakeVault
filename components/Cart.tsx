
import React from 'react';
import { CartItem } from '../types';
import { WHATSAPP_NUMBER } from '../constants';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }) => {
  if (!isOpen) return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    const orderText = items.map(item => `• ${item.name} (Qty: ${item.quantity})`).join('\n');
    const message = encodeURIComponent(`Hello BakeVault! I'd like to get a price quotation for:\n\n${orderText}\n\nPlease confirm availability and total price.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-brand-darkGray/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-2xl">
            <div className="flex-1 py-8 overflow-y-auto px-6 sm:px-8">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-extrabold text-brand-darkGray font-display uppercase tracking-tight">Your Shopping Bag</h2>
                <div className="ml-3 h-7 flex items-center">
                  <button onClick={onClose} className="p-2 text-brand-darkGray/40 hover:text-brand-orange transition-colors">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-10">
                {items.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="bg-brand-cream w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="h-10 w-10 text-brand-brown/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-brand-darkGray/60 font-medium italic">Your cart is feeling a bit light.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-orange-50">
                    {items.map((item) => (
                      <li key={item.id} className="py-6 flex group">
                        <div className="flex-shrink-0 w-24 h-24 bg-brand-cream border border-orange-50 rounded-2xl overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="ml-6 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-sm font-bold text-brand-darkGray font-display">
                              <h3>{item.name}</h3>
                            </div>
                            <p className="mt-1 text-xs font-bold text-brand-brown tracking-wide">{item.category}</p>
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center gap-4 bg-brand-cream rounded-xl p-1.5 border border-orange-100/50">
                              <button 
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-brand-darkGray font-bold shadow-sm"
                              >
                                -
                              </button>
                              <span className="font-extrabold w-6 text-center text-brand-darkGray">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-brand-darkGray font-bold shadow-sm"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemove(item.id)}
                              className="font-bold text-xs uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-brand-cream/30 border-t border-orange-100 py-8 px-6 sm:px-8">
              <div className="flex justify-between text-lg font-extrabold text-brand-darkGray font-display">
                <p>Order Summary</p>
                <p>{totalItems} Items</p>
              </div>
              <p className="mt-2 text-xs text-brand-darkGray/50 leading-relaxed font-medium">Final delivery costs and wholesale discounts will be confirmed once we receive your request on WhatsApp.</p>
              <div className="mt-8">
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="w-full flex justify-center items-center px-8 py-4 rounded-2xl shadow-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed gap-3 uppercase"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.389l-1.071 3.914 4.024-1.056c.915.541 1.983.853 3.12.853 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm3.344 8.205c-.15.422-.766.782-1.056.818-.289.035-.555.051-1.636-.369-1.393-.541-2.288-1.956-2.358-2.05-.071-.094-.576-.766-.576-1.459 0-.692.361-1.034.489-1.176.128-.142.279-.177.373-.177h.262c.085 0 .197-.033.303.224l.432 1.052c.036.088.058.188.001.298-.057.11-.086.182-.172.282l-.258.303c-.085.1-.176.208-.078.376.098.168.435.719.932 1.162.641.571 1.179.749 1.347.834.168.085.267.071.366-.042.1-.113.424-.492.538-.661.114-.168.228-.141.385-.084.157.057.994.469 1.165.555.172.085.286.128.329.201.042.073.042.422-.108.844z"/>
                  </svg>
                  GET PRICE VIA WHATSAPP
                </button>
              </div>
              <div className="mt-6 flex justify-center text-sm text-center">
                <button
                  type="button"
                  className="text-brand-brown font-extrabold hover:text-brand-orange transition-colors underline decoration-2 underline-offset-4"
                  onClick={onClose}
                >
                  Keep Browsing Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
