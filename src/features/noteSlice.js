import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api.js";

const initialState = {
    notes: [],
    status: "idle", // idle, loading, success, failed
    error: null,
};

// Create Note
export const createNote = createAsyncThunk(
    "note/create",
    async ({ tenantId, noteData }, thunkAPI) => {
        try {
            const response = await api.post(`/notes/create/${tenantId}`, noteData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get All Notes
export const getAllNotes = createAsyncThunk(
    "note/getAll",
    async (tenantId, thunkAPI) => {
        try {
            const response = await api.get(`/notes/get-all/${tenantId}`);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Edit Note
export const editNote = createAsyncThunk(
    "note/edit",
    async ({ tenantId, noteId, noteData }, thunkAPI) => {
        try {
            const response = await api.patch(`/notes/edit/${tenantId}/${noteId}`, noteData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete Note
export const deleteNote = createAsyncThunk(
    "note/delete",
    async ({ tenantId, noteId }, thunkAPI) => {
        try {
            await api.delete(`/notes/delete/${tenantId}/${noteId}`);
            return noteId;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const noteSlice = createSlice({
    name: "note",
    initialState,
    reducers: {
        clearNotes: (state) => {
            state.notes = [];
            state.status = "idle";
            state.error = null;
        },  //shifting tenants so clearing notes
        resetNoteState: (state) => {
            state.notes = [];
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Note
            .addCase(createNote.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(createNote.fulfilled, (state, action) => {
                state.status = "success";
                state.notes.push(action.payload);
            })
            .addCase(createNote.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Get All Notes
            .addCase(getAllNotes.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getAllNotes.fulfilled, (state, action) => {
                state.status = "success";
                state.notes = action.payload;
            })
            .addCase(getAllNotes.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Edit Note
            .addCase(editNote.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(editNote.fulfilled, (state, action) => {
                state.status = "success";
                const index = state.notes.findIndex((note) => note._id === action.payload._id);
                if (index !== -1) {
                    state.notes[index] = action.payload;
                }
            })
            .addCase(editNote.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Delete Note
            .addCase(deleteNote.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(deleteNote.fulfilled, (state, action) => {
                state.status = "success";
                state.notes = state.notes.filter((note) => note._id !== action.payload);
            })
            .addCase(deleteNote.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearNotes, resetNoteState } = noteSlice.actions;
export default noteSlice.reducer;
