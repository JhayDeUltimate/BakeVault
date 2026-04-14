
import React, { useState } from 'react';
import { Category, Product } from '../bakevault/src/lib/types';
import { CATEGORIES } from '../constants';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('Wholesale');
  const [image, setImage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      category,
      description,
      price,
      image,
      isCustom: true,
    };

    onAdd(newProduct);
    setName('');
    setDescription('');
    setImage('');
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-darkGray/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-fadeInUp">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-brand-darkGray font-display">Add New Product</h2>
            <button onClick={onClose} className="p-2 text-brand-darkGray/40 hover:text-brand-orange transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-2">Product Name</label>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Vanilla Extract"
                className="w-full bg-brand-cream/30 border border-orange-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-orange/20 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-2">Category</label>
                <select 
                  value={category} onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-brand-cream/30 border border-orange-100 rounded-xl px-4 py-3 outline-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-2">Price Label</label>
                <input 
                  type="text" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. Wholesale"
                  className="w-full bg-brand-cream/30 border border-orange-100 rounded-xl px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-2">Description</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-brand-cream/30 border border-orange-100 rounded-xl px-4 py-3 min-h-[100px] outline-none"
                placeholder="Details about your product..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown mb-2">Product Photo</label>
              <div className="flex flex-col gap-3">
                <input 
                  type="file" accept="image/*" onChange={handleImageUpload}
                  className="text-xs text-brand-darkGray/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-brand-orange/10 file:text-brand-orange hover:file:bg-brand-orange/20 cursor-pointer"
                />
                {image && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-orange-100">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-brand-darkGray text-white font-extrabold py-4 rounded-2xl hover:bg-brand-orange transition-all active:scale-[0.98] shadow-lg"
            >
              Upload to Storefront
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
