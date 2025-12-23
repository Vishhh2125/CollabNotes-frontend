import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNote, editNote, getAllNotes } from '../features/noteSlice';

export default function NoteForm({ note, onClose }) {
  const dispatch = useDispatch();
  const { currentTenant } = useSelector(state => state.tenant);
  const { status } = useSelector(state => state.note);
  const [formData, setFormData] = useState(() => ({
    title: note?.title || '',
    content: note?.content || ''
  }));
  const [errors, setErrors] = useState({});
  const [limitError, setLimitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLimitError(''); // Clear previous limit error
    
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (note) {
      // Edit existing note
      const result = await dispatch(editNote({
        tenantId: currentTenant._id,
        noteId: note._id,
        noteData: formData
      }));
      if (result.type.endsWith('/fulfilled')) {
        // Refetch notes to get updated data
        await dispatch(getAllNotes(currentTenant._id));
        onClose();
        setFormData({ title: '', content: '' });
      }
    } else {
      // Create new note
      const result = await dispatch(createNote({
        tenantId: currentTenant._id,
        noteData: formData
      }));
      
      if (result.type.endsWith('/fulfilled')) {
        // Refetch notes to get the new note
        await dispatch(getAllNotes(currentTenant._id));
        onClose();
        setFormData({ title: '', content: '' });
      } else if (result.type.endsWith('/rejected')) {
        // Handle 403 error - note limit reached
        const errorMessage = result.payload || 'Failed to create note';
        if (errorMessage.includes('Free plan is limited') || errorMessage.includes('3 notes')) {
          setLimitError(errorMessage);
        } else {
          setLimitError(errorMessage);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121421] rounded-xl border border-indigo-400/25 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-400/25">
          <h2 className="text-xl font-semibold text-white">
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#0b0d14] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Limit Error Message */}
          {limitError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p className="text-red-400 text-sm">{limitError}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md bg-[#0b0d14] border ${
                  errors.title ? 'border-red-500' : 'border-indigo-400/20'
                } focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-white`}
                placeholder="Enter note title"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={12}
                className={`w-full px-4 py-2 rounded-md bg-[#0b0d14] border ${
                  errors.content ? 'border-red-500' : 'border-indigo-400/20'
                } focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-white resize-none`}
                placeholder="Enter note content"
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content}</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-indigo-400/25">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-slate-400 hover:text-white hover:bg-[#0b0d14] border border-indigo-400/20 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={status === 'loading'}
            className="px-4 py-2 rounded-md border border-indigo-400/25 bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {note ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {note ? 'Update Note' : 'Create Note'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

