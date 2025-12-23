import { createSlice ,createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api.js";



const register=createAsyncThunk(
    "user/register",
    async (userData,{rejectWithValue})=>{

        try {


            const response= await api.post("/users/register",userData);
            return response.data.data;
            
        } catch (error) {

          // Handle specific error cases
          let errorMessage = "Registration failed. Please try again.";
          
          if (error.response) {
            // Server responded with error
            const status = error.response.status;
            const message = error.response.data?.message;
            
            if (status === 400) {
              errorMessage = message || "Invalid input. Please check your details.";
            } else if (status === 409) {
              errorMessage = "Username or email already exists.";
            } else if (status === 500) {
              errorMessage = "Server error. Please try again later.";
            } else {
              errorMessage = message || errorMessage;
            }
          } else if (error.request) {
            // Request made but no response
            errorMessage = "Network error. Please check your connection.";
          }

          return rejectWithValue(errorMessage);       
        }

    }
)


const login =createAsyncThunk(
    "user/login",
    async(credential,{rejectWithValue})=>{

        try {

            const response= await api.post("/users/login",credential);
            return response.data.data;
            
        } catch (error) {

           // Handle specific error cases
           let errorMessage = "Login failed. Please try again.";
           
           if (error.response) {
             // Server responded with error
             const status = error.response.status;
             const message = error.response.data?.message;
             
             if (status === 400) {
               errorMessage = "Please provide username and password.";
             } else if (status === 401) {
               errorMessage = "Invalid username or password.";
             } else if (status === 404) {
               errorMessage = "Email not found.";
             } else if (status === 500) {
               errorMessage = "Server error. Please try again later.";
             } else {
               errorMessage = message || errorMessage;
             }
           } else if (error.request) {
             // Request made but no response
             errorMessage = "Network error. Please check your connection.";
           }

           return rejectWithValue(errorMessage);           
        }
    }
)





const userSlice= createSlice({
    name:"user",
    initialState:{
        user: JSON.parse(localStorage.getItem("user")) || null,
        error:null,
        loading:false,
        isAuthenticated: !!localStorage.getItem("accessToken"), // Check token on load
        registrationSuccess:false

    },

    reducers:{
        resetRegistrationState:(state)=>{
            state.registrationSuccess=false;
            state.error=null;
        },
        logout:(state)=>{
            state.user=null;
            state.isAuthenticated=false;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
        }
    },

    extraReducers:(builder)=>{
        builder
          .addCase(register.pending,(state)=>{
            state.loading=true;
            state.error=null;
            state.registrationSuccess=false;
          })
          .addCase(register.fulfilled,(state)=>{
            state.loading=false;
            state.error=null;
            state.registrationSuccess=true;
          })
          .addCase(register.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.registrationSuccess=false;
          })
          .addCase(login.pending,(state)=>{
            state.loading=true;
            state.error=null;
          })
          .addCase(login.fulfilled,(state,action)=>{
            state.loading=false; 
            state.user=action.payload.user;
            localStorage.setItem("user", JSON.stringify(action.payload.user));
            localStorage.setItem("accessToken",action.payload.accessToken);
            state.isAuthenticated=true;
          })
          .addCase(login.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
          })
          
    }
})


export default userSlice.reducer;

export const { resetRegistrationState, logout } = userSlice.actions;

export {register, login};