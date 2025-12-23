import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotes, deleteNote } from '../features/noteSlice';
import { editTenantSubscription } from '../features/tenantSlice';
import NoteForm from './NoteForm';

export function UpgradePlanNotice({ onUpgrade }) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 flex-shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <div className="flex-1">
          <p className="text-yellow-400 text-sm font-medium mb-1">
            You've reached the free plan limit of 3 notes
          </p>
          <p className="text-yellow-400/80 text-xs mb-3">
            Upgrade to Pro for unlimited notes and additional features
          </p>
          <button
            onClick={onUpgrade}
            className="px-4 py-2 rounded-md bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-400 transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotesList() {
  const dispatch = useDispatch();
  const { notes, status } = useSelector(state => state.note);
  const { currentTenant } = useSelector(state => state.tenant);
  const { user } = useSelector(state => state.user);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    if (currentTenant?._id) {
      dispatch(getAllNotes(currentTenant._id));
    }
  }, [currentTenant, dispatch]);

  // Check if user can create more notes
  const canCreateNote = () => {
    if (currentTenant?.plan === 'free') {
      const userNotes = notes.filter(note => note.createdBy?._id === user?._id);
      return userNotes.length < 3;
    }
    return true; // Pro plan = unlimited
  };

  // Count user's notes
  const userNotesCount = notes.filter(
    note => note.createdBy?._id === user?._id
  ).length;

  const handleUpgrade = async () => {
    if (window.confirm('Upgrade to Pro plan for unlimited notes?')) {
      await dispatch(editTenantSubscription({ 
        tenantId: currentTenant._id, 
        plan: 'pro' 
      }));
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await dispatch(deleteNote({ tenantId: currentTenant._id, noteId }));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Notes</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your notes in {currentTenant?.name}
            {currentTenant?.plan === 'free' && (
              <span className="ml-2 text-slate-500">
                • {userNotesCount} / 3 notes used
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleCreateNote}
          disabled={!canCreateNote()}
          className={`px-4 py-2 rounded-md border flex items-center gap-2 transition-all duration-200 ${
            canCreateNote()
              ? 'border-indigo-400/25 bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/15 hover:scale-[1.02] active:scale-[0.98]'
              : 'border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Note
        </button>
      </div>

      {/* Limit Warning */}
      {!canCreateNote() && currentTenant?.plan === 'free' && (
        <UpgradePlanNotice onUpgrade={handleUpgrade} />
      )}
      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-[#121421] border border-indigo-400/25">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-400 mb-4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <p className="text-slate-400 mb-2">No notes yet</p>
          <p className="text-slate-500 text-sm">Create your first note to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="rounded-xl bg-[#121421] border border-indigo-400/25 p-5 hover:border-indigo-400/40 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-colors"
                    title="Edit note"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Delete note"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-sm line-clamp-3 mb-3">
                {note.content || 'No content'}
              </p>
              <div className="flex items-center justify-between">
                {note.createdAt && (
                  <p className="text-xs text-slate-500">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                )}
                {note.createdBy && (
                  <p className="text-xs text-slate-500">
                    By {note.createdBy.username}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Form Modal */}
      {isFormOpen && (
        <NoteForm
          key={editingNote?._id || 'new-note'}
          note={editingNote}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

