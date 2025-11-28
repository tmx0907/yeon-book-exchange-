
import React, { useState, useRef } from 'react';
import { Camera, BookOpen, Loader2, Upload } from 'lucide-react';
import { translations } from '../data';
import { Book } from '../types';

interface UploadBookProps {
  lang: 'en' | 'ko';
  onUpload: (book: Partial<Book>) => void;
  onCancel: () => void;
}

const UploadBook: React.FC<UploadBookProps> = ({ lang, onUpload, onCancel }) => {
  const t = translations[lang];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    condition: 'New',
    category: 'Fiction'
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      onUpload({
        ...formData,
        condition: formData.condition as any,
        // Use uploaded image or fallback to a deterministic random image based on title
        imageUrl: previewUrl || `https://picsum.photos/seed/${formData.title.replace(/\s/g, '')}/300/450`
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-3">{t.uploadBook}</h2>
        <p className="text-slate-500">{t.uploadDesc}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-50">
        <div className="space-y-8">
          
          {/* Image Upload Area */}
          <div className="flex justify-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div 
              onClick={handleUploadClick}
              className={`w-32 h-44 rounded-lg flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 overflow-hidden relative ${
                previewUrl 
                  ? 'border-0' 
                  : 'bg-slate-50 border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50'
              }`}
            >
               {previewUrl ? (
                 <>
                   <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                   </div>
                 </>
               ) : (
                 <>
                   <Camera className="w-8 h-8 mb-2 text-slate-400 group-hover:text-sky-500 transition-colors" />
                   <span className="text-xs font-medium text-slate-400 group-hover:text-sky-600 transition-colors">Add Cover</span>
                 </>
               )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.bookTitle}</label>
              <input
                type="text"
                required
                className="w-full border-b border-slate-200 py-3 text-lg font-serif focus:border-sky-500 focus:outline-none bg-transparent placeholder-slate-300 transition-colors"
                placeholder="e.g. Vegetarian"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.author}</label>
              <input
                type="text"
                required
                className="w-full border-b border-slate-200 py-3 text-lg focus:border-sky-500 focus:outline-none bg-transparent placeholder-slate-300 transition-colors"
                placeholder="e.g. Han Kang"
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.selectCondition}</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none"
                  value={formData.condition}
                  onChange={e => setFormData({...formData, condition: e.target.value})}
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Acceptable">Acceptable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.selectCategory}</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="History">History</option>
                  <option value="Economy">Economy</option>
                  <option value="Self-Help">Self-Help</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
             <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 rounded-xl text-slate-500 font-medium hover:bg-slate-50 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 text-white rounded-xl py-4 font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center shadow-lg shadow-slate-200 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t.uploadButton}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadBook;
