import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Login = () => {
  const [values, setValues] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        values,
      );
      localStorage.setItem("token", response.data.token);

      if (response.status === 200 || response.status === 201) {
        const token = response.data.token;

        if (rememberMe) {
          localStorage.setItem("token", token);
        } else {
          sessionStorage.setItem("token", token);
        }

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          confirmButtonColor: "#FF6767",
          text: "Welcome back!",
        }).then(() => {
          navigate("/");
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.message || "Invalid username or password",
      });
    }
  };

  return (
    <div
      className="m-0 p-0 h-screen w-screen flex justify-center items-center h-screen bg-cover bg-center bg-[url('/Register/Background.png')]"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="w-1/2 px-12 py-5 h-screen">
        <h2 className="font-montserrat text-4xl font-bold mb-8 mt-25">
          Sign In
        </h2>
        <form className="h-[40%]" onSubmit={handleSubmit}>
          <div className="mb-4 h-[25%] relative">
            <img
              src="/Register/UserName.png"
              alt="Username Icon"
              className="absolute left-[2.5%] center top-[40%] transform -translate-y-1/2 
               w-[5%] h-[50%] object-contain pointer-events-none"
            />
            <input
              type="text"
              placeholder="Enter Username"
              className="w-full px-3 py-2 border rounded-md border-gray-500 h-[80%] text-xs"
              style={{
                paddingLeft: "12.5%", // make space for the background icon
              }}
              name="username"
              onChange={handleChanges}
            />
          </div>
          <div className="mb-4 h-[25%] relative">
            <img
              src="/Register/Password.png"
              alt="Password Icon"
              className="absolute left-[2.5%] center top-[40%] transform -translate-y-1/2 
               w-[5%] h-[50%] object-contain pointer-events-none"
            />
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full px-3 py-2 border rounded-md border-gray-500 h-[80%] text-xs"
              style={{
                paddingLeft: "12.5%", // make space for the background icon
              }}
              name="password"
              onChange={handleChanges}
            />
          </div>

          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              className="mr-2 rounded-none"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="text-gray-700">
              Remember Me
            </label>
          </div>

          <button className="w-1/4 h-[25.5%] bg-red-600 text-white py-2 border rounded-md opacity-50 hover:opacity-100 cursor-pointer transition-all duration-300">
            Login
          </button>
        </form>

        <div className="mt-15">
          <div className="gap-2 flex">
            <p className="text-sm mb-2 mr-7">Or, login with</p>
            <img
              src="/Login/Facebook.png"
              alt="Facebook Image"
              className="mr-1 w-[5%] h-[5%] cursor-pointer hover:opacity-90 cursor-pointer transition-all duration-300"
              onClick={() => console.log("Facebook clicked!")}
            />
            <img
              src="/Login/Google.png"
              alt="Google Image"
              className="mr-1 w-[5%] h-[5%] cursor-pointer hover:opacity-90 cursor-pointer transition-all duration-300"
              onClick={() => console.log("Google clicked!")}
            />
            <img
              src="/Login/Vector.png"
              alt="X Image"
              className="mr-1 w-[5%] h-[5%] cursor-pointer hover:opacity-90 cursor-pointer transition-all duration-300"
              onClick={() => console.log("X clicked!")}
            />
          </div>
        </div>
        <div className="text-sm mt-3">
          <span>Don't Have Account? </span>
          <Link to="/register" className="text-blue-500">
            Create One
          </Link>
        </div>
      </div>
      <div className="w-1/2 relative h-screen flex items-end">
        <img
          className="w-[100%] h-[70%] object-contain"
          src={"/Login/Image.png"}
          alt="Image"
        />
      </div>
    </div>
  );
};

export default Login;
