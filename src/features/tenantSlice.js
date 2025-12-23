import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api.js";

const initialState = {
    tenants: [],
    currentTenant: null,
    status: "idle", // idle, loading, success, failed
    error: null,
};

// Create Tenant
export const createTenant = createAsyncThunk(
    "tenant/create",
    async (tenantData, thunkAPI) => {
        try {
            const response = await api.post("/tenants/create", tenantData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get All Tenants
export const getAllTenants = createAsyncThunk(
    "tenant/getAll",
    async (_, thunkAPI) => {
        try {
            const response = await api.get("/tenants/get-all");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete Tenant
export const deleteTenant = createAsyncThunk(
    "tenant/delete",
    async (tenantId, thunkAPI) => {
        try {
            await api.delete(`/tenants/delete/${tenantId}`);
            return tenantId;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Edit Tenant Subscription
export const editTenantSubscription = createAsyncThunk(
    "tenant/editSubscription",
    async ({ tenantId, plan }, thunkAPI) => {
        try {
            const response = await api.patch(
                `/tenants/edit/subscription/${tenantId}`,
                { plan }
            );
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const tenantSlice = createSlice({
    name: "tenant",
    initialState,
    reducers: {
        setCurrentTenant: (state, action) => {
            state.currentTenant = action.payload;
        },
        resetTenantState: (state) => {
            state.tenants = [];
            state.currentTenant = null;
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Tenant
            .addCase(createTenant.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(createTenant.fulfilled, (state, action) => {
                state.status = "success";
                state.error = null;
                // Support both raw tenant objects and membership-shaped payloads
                const payload = action.payload || {};
                const tenantData = payload.tenantId ? payload.tenantId : payload;
                const tenantToStore = {
                    ...tenantData,
                    userRole: payload.userRole || payload.role || "admin",
                };
                state.tenants.push(tenantToStore);
                state.currentTenant = tenantToStore;
            })
            .addCase(createTenant.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Get All Tenants
            .addCase(getAllTenants.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getAllTenants.fulfilled, (state, action) => {
                state.status = "success";
                // Extract tenantId from each membership object
                // Backend returns: [{ _id: membershipId, userId, tenantId: { _id, name, plan }, role }, ...]
                // We need: [{ _id, name, plan, userRole }, ...]
                const extractedTenants = action.payload.map(membership => {
                    const tenant = membership.tenantId || membership;
                    // Add user's role for this tenant
                    return {
                        ...tenant,
                        userRole: membership.role // Store the user's role in this tenant
                    };
                });
                state.tenants = extractedTenants;
                if (!state.currentTenant && extractedTenants.length > 0) {
                    state.currentTenant = extractedTenants[0];
                }
            })
            .addCase(getAllTenants.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Delete Tenant
            .addCase(deleteTenant.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(deleteTenant.fulfilled, (state, action) => {
                state.status = "success";
                state.tenants = state.tenants.filter((tenant) => tenant._id !== action.payload);
                if (state.currentTenant?._id === action.payload) {
                    state.currentTenant = state.tenants[0] || null;
                }
            })
            .addCase(deleteTenant.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Edit Tenant Subscription
            .addCase(editTenantSubscription.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(editTenantSubscription.fulfilled, (state, action) => {
                state.status = "success";
                const index = state.tenants.findIndex((tenant) => tenant._id === action.payload._id);
                if (index !== -1) {
                    state.tenants[index] = action.payload;
                }
                if (state.currentTenant?._id === action.payload._id) {
                    state.currentTenant = action.payload;
                }
            })
            .addCase(editTenantSubscription.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { setCurrentTenant, resetTenantState } = tenantSlice.actions;
export default tenantSlice.reducer;