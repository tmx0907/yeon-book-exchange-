
import React, { useState, useRef, useMemo } from 'react';
import { X, Save, Loader2, Camera, Upload, Quote } from 'lucide-react';
import { translations } from '../data';
import { User, State } from '../types';

interface EditProfileModalProps {
  lang: 'en' | 'ko';
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ lang, user, onClose, onSave }) => {
  const t = translations[lang];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    suburb: user.suburb,
    state: user.state,
    avatarUrl: user.avatarUrl,
    favoriteQuote: user.favoriteQuote || ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if any field has changed
  const hasChanges = useMemo(() => {
    return (
      formData.name !== user.name ||
      formData.suburb !== user.suburb ||
      formData.state !== user.state ||
      formData.avatarUrl !== user.avatarUrl ||
      formData.favoriteQuote !== (user.favoriteQuote || '')
    );
  }, [formData, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      onSave({
        ...user,
        ...formData
      });
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      // Reset value so if the user selects the same file again (after a mishap), it triggers the change event
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result is a Base64 string that can be used as an image source
        const result = reader.result as string;
        if (result) {
            setFormData(prev => ({ ...prev, avatarUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white z-10 shrink-0">
          <h3 className="font-serif text-2xl text-slate-900">{t.editProfile}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          
          <div className="flex flex-col items-center mb-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            <div 
              className="relative group cursor-pointer" 
              onClick={handleAvatarClick}
              title="Click to upload photo"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-sky-200 transition-colors shadow-inner bg-slate-50 relative">
                 <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 {/* Visual hint for preview if changed */}
                 {formData.avatarUrl !== user.avatarUrl && (
                    <div className="absolute inset-0 border-4 border-sky-400 rounded-full pointer-events-none animate-pulse"></div>
                 )}
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Upload className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              
              {/* Camera Icon Badge */}
              <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-slate-100 group-hover:bg-sky-50 transition-colors">
                <Camera className="w-4 h-4 text-slate-600 group-hover:text-sky-600" />
              </div>
            </div>
            <p className={`text-xs mt-3 font-medium transition-colors ${formData.avatarUrl !== user.avatarUrl ? 'text-sky-600' : 'text-slate-400'}`}>
              {formData.avatarUrl !== user.avatarUrl ? 'New photo selected' : 'Upload Profile Photo'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.name}</label>
            <input
              type="text"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Suburb</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none transition-all"
                value={formData.suburb}
                onChange={e => setFormData({...formData, suburb: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.filterByState}</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none transition-all"
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value as State})}
              >
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="QLD">QLD</option>
                <option value="WA">WA</option>
                <option value="SA">SA</option>
                <option value="TAS">TAS</option>
                <option value="ACT">ACT</option>
                <option value="NT">NT</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.favoriteQuote}</label>
             <div className="relative">
                <Quote className="absolute top-3 left-3 w-4 h-4 text-slate-400" />
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none transition-all resize-none font-serif italic"
                  rows={3}
                  placeholder={t.quotePlaceholder}
                  value={formData.favoriteQuote}
                  onChange={e => setFormData({...formData, favoriteQuote: e.target.value})}
                />
             </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className={`w-full rounded-xl py-4 font-semibold flex items-center justify-center gap-2 mt-8 transition-all duration-300 ${
                isSubmitting || !hasChanges 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-sky-600 shadow-lg shadow-slate-200 hover:shadow-sky-200 transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Save className="w-4 h-4" />
                <span>{t.saveChanges}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
