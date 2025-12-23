import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api.js";

const initialState = {
    memberships: [],
    status: "idle", // idle, loading, success, failed
    error: null,
};

// Get All Memberships for a Tenant
export const getAllTenantMemberships = createAsyncThunk(
    "tenantMembership/getAll",
    async (tenantId, thunkAPI) => {
        try {
            const response = await api.get(`/tenant-membership/${tenantId}`);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Add Member to Tenant
export const addMemberToTenant = createAsyncThunk(
    "tenantMembership/addMember",
    async ({ tenantId, memberData }, thunkAPI) => {
        try {
            const response = await api.post(`/tenant-membership/${tenantId}`, memberData);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Remove Member from Tenant
export const removeMembership = createAsyncThunk(
    "tenantMembership/removeMember",
    async ({ tenantId, userId }, thunkAPI) => {
        try {
            await api.delete(`/tenant-membership/${tenantId}`, {
                data: { userId }
            });
            return userId;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Change Member Role
export const changeMemberRole = createAsyncThunk(
    "tenantMembership/changeRole",
    async ({ tenantId, userId, role }, thunkAPI) => {
        try {
            const response = await api.put(`/tenant-membership/role/${tenantId}`, {
                userId,
                role
            });
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const tenantMembershipSlice = createSlice({
    name: "tenantMembership",
    initialState,
    reducers: {
        clearMemberships: (state) => {
            state.memberships = [];
            state.status = "idle";
            state.error = null;
        },
        resetMembershipState: (state) => {
            state.memberships = [];
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get All Memberships
            .addCase(getAllTenantMemberships.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getAllTenantMemberships.fulfilled, (state, action) => {
                state.status = "success";
                state.memberships = action.payload;
            })
            .addCase(getAllTenantMemberships.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Add Member
            .addCase(addMemberToTenant.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(addMemberToTenant.fulfilled, (state, action) => {
                state.status = "success";
                state.memberships.push(action.payload);
            })
            .addCase(addMemberToTenant.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Remove Member
            .addCase(removeMembership.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(removeMembership.fulfilled, (state, action) => {
                state.status = "success";
                state.memberships = state.memberships.filter(
                    (membership) => membership.userId !== action.payload
                );
            })
            .addCase(removeMembership.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Change Member Role
            .addCase(changeMemberRole.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(changeMemberRole.fulfilled, (state, action) => {
                state.status = "success";
                const index = state.memberships.findIndex(
                    (membership) => membership._id === action.payload._id
                );
                if (index !== -1) {
                    state.memberships[index] = action.payload;
                }
            })
            .addCase(changeMemberRole.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearMemberships, resetMembershipState } = tenantMembershipSlice.actions;
export default tenantMembershipSlice.reducer;
