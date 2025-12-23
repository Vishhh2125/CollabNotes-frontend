import {configureStore} from "@reduxjs/toolkit";
import userReducer from "../features/userSlice.js";
import tenantReducer from "../features/tenantSlice.js";
import noteReducer from "../features/noteSlice.js";
import tenantMembershipReducer from "../features/tenantMembershipSlice.js";

const store =configureStore({
    reducer:{
        user:userReducer,
        tenant:tenantReducer,
        note:noteReducer,
        tenantMembership:tenantMembershipReducer
    }
})


export default store;