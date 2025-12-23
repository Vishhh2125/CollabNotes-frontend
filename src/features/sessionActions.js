import { logout } from "./userSlice.js";
import { resetTenantState } from "./tenantSlice.js";
import { resetNoteState } from "./noteSlice.js";
import { resetMembershipState } from "./tenantMembershipSlice.js";

// Clears all Redux slices related to auth/session and logs the user out.
export const logoutAndReset = () => (dispatch) => {
  dispatch(resetTenantState());
  dispatch(resetNoteState());
  dispatch(resetMembershipState());
  dispatch(logout());
};

