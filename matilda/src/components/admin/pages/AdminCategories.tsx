import React, { useState } from 'react';
import { useCollection } from '../../../context/CollectionContext';
import { Pencil, Trash2, Plus, X, Loader2 } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, removeCategory, resetCategoriesToDefault } = useCollection();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  // Custom confirmation modals state
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<any>(null);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);

  const handleOpenModal = (cat: any = null) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    } else {
      setEditingCat(null);
      setFormData({ name: '', slug: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCat) {
        await updateCategory({
          ...editingCat,
          ...formData,
          oldSlug: editingCat.slug
        });
      } else {
        await addCategory({
          id: `cat-${Date.now()}`,
          ...formData
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async (cat: any) => {
    setDeletingId(cat.id);
    try {
      await removeCategory(cat.id, cat.slug);
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteCat(null);
    }
  };

  const executeClearAll = async () => {
    setIsConfirmClearAllOpen(false);
    try {
      await resetCategoriesToDefault();
    } catch (err) {
      console.error("Failed to clear categories:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">categories.</h2>
        <div className="flex gap-2">
          {categories.length > 0 && (
            <button 
              onClick={() => setIsConfirmClearAllOpen(true)} 
              className="px-4 py-2 text-xs uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-full transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          )}
          <button onClick={() => handleOpenModal()} className="bg-[var(--border-admin)] text-white font-micro uppercase tracking-widest text-[10px] px-6 py-2.5 rounded-full shadow-md hover:opacity-90 transition-all flex items-center gap-2">
            <Plus className="w-3 h-3" /> New
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin-subtle)] rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 font-micro text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold">{cat.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-[200px]">{cat.description}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(cat)} className="p-1.5 text-gray-500 hover:text-[var(--border-admin)] transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      disabled={deletingId === cat.id}
                      onClick={() => setConfirmDeleteCat(cat)} 
                      className="p-1.5 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 uppercase tracking-widest text-xs font-micro">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Single Category Confirmation Modal */}
      {confirmDeleteCat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-red-100 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold lowercase tracking-tighter">
              delete "{confirmDeleteCat.name}"?
            </h3>
            <p className="text-xs text-gray-500 font-micro">
              Products in this category will be re-assigned to 'general'.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteCat(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-xs font-micro uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDelete(confirmDeleteCat)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-full text-xs font-micro uppercase tracking-widest hover:bg-red-700 shadow-md transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Categories Confirmation Modal */}
      {isConfirmClearAllOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-red-100 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold lowercase tracking-tighter">
              clear all categories?
            </h3>
            <p className="text-xs text-gray-500 font-micro">
              This will remove all categories. You can add new ones manually.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-xs font-micro uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeClearAll}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-full text-xs font-micro uppercase tracking-widest hover:bg-red-700 shadow-md transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[var(--border-admin)] shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-xl font-bold lowercase tracking-tighter mb-6">
              {editingCat ? 'edit category' : 'new category'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4 font-micro text-xs">
              <div>
                <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => {
                    const newName = e.target.value;
                    const autoSlug = newName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    setFormData({ name: newName, slug: autoSlug, description: formData.description });
                  }} 
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" 
                />
              </div>
              <div>
                <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Slug</label>
                <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" placeholder="e.g. outwear" />
              </div>
              <div>
                <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Description (Optional)</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
              </div>
              <button disabled={isSaving} type="submit" className="w-full bg-[var(--border-admin)] text-white uppercase tracking-widest text-[10px] p-4 rounded-full hover:opacity-90 transition-opacity mt-4 flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
