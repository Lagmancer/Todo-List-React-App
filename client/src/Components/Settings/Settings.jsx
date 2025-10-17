import axios from "axios";
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";

export function CalendarPopup({ children }) {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      {/* Use whatever button is passed in */}
      <div className="flex" onClick={() => setOpen(!open)}>
        {children}
      </div>

      {/* Popup Calendar */}
      {open && (
        <div className="absolute right-0 mt-10 z-60 w-[25%] rounded-2xl bg-white shadow-2xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-800">Calendar</h2>
            <button onClick={() => setOpen(false)} className="cursor-pointer">
              <img src="/Dashboard/ReturnButton.png" alt="Return button" />
            </button>
          </div>

          {/* Date Display */}
          <div className="border border-gray-600 rounded-lg flex items-center justify-between px-3 py-2 bg-white mb-4">
            <span className="text-black-600 font-semibold">
              {date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => setDate(new Date())}
              className="text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
            >
              x
            </button>
          </div>

          {/* Actual Calendar */}
          <Calendar
            onChange={setDate}
            value={date}
            prevLabel="‹"
            nextLabel="›"
            prev2Label={null} // remove "«"
            next2Label={null} // remove "»"
            showNeighboringMonth={false}
            className={`
              w-full border-0 bg-[#F5F8FF] rounded-2xl 
              [&_.react-calendar__navigation]:flex [&_.react-calendar__navigation]:justify-between [&_.react-calendar__navigation]:mb-2
              [&_.react-calendar__navigation__label]:font-semibold [&_.react-calendar__navigation__label]:text-black-600 font-semibold
              [&_.react-calendar__navigation button]:text-black-600 text-lg [&_.react-calendar__navigation button]:rounded-md [&_.react-calendar__navigation button]:px-2 [&_.react-calendar__navigation button]:py-1
              [&_.react-calendar__month-view__weekdays]:text-center [&_.react-calendar__month-view__weekdays]:text-xs [&_.react-calendar__month-view__weekdays]:text-gray-400
              [&_.react-calendar__tile]:rounded-full [&_.react-calendar__tile]:text-sm [&_.react-calendar__tile]:p-2
              [&_.react-calendar__tile--active]:bg-[#FF6767] [&_.react-calendar__tile--active]:text-white
              [&_.react-calendar__tile--now]:border [&_.react-calendar__tile--now]:border-[#FF6767] [&_.react-calendar__tile--now]:font-bold
              [&_.react-calendar__tile:hover]:bg-gray-200 
            `}
          />
        </div>
      )}
    </div>
  );
}

const handleHelpClick = () => {
  Swal.fire({
    title: "⚠️ Notice",
    text: "This feature is not available yet.",
    icon: "info",
    confirmButtonColor: "#FF6767", // match your theme
    confirmButtonText: "OK",
  });
};

const Settings = ({ user, setUser }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [activeForm, setActiveForm] = useState("info");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, confirmNewPassword] = useState("");
  const [formData, setFormData] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: user?.email || "",
    contactnumber: user?.contactnumber || "",
    position: user?.position || "",
  });

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      if (!validateEmail(formData.email)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Email",
          confirmButtonColor: "#FF6767",
          text: "Please enter a valid email address",
        });
        return;
      }

      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3000/auth/update", // <-- your backend route
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUser((prev) => ({
        ...prev,
        ...formData,
      }));

      Swal.fire({
        icon: "success",
        title: "Profile updated!",
        showConfirmButton: false,
        timer: 1500,
      });

      setActiveForm("info");
    } catch (err) {
      console.error("Update failed:", err);
      Swal.fire({
        icon: "error",
        title: "Update failed",
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.message || "Something went wrong!",
      });
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/auth/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log(newPassword);
      console.log(confirmPassword);
      if (newPassword !== confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Mismatch Passwords",
          confirmButtonColor: "#FF6767",
          text: "Passwords do not match!",
        });
        return;
      }

      await axios.put(
        "http://localhost:3000/auth/change-password",
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Swal.fire({
        icon: "success",
        title: "Password Changed!",
        text: "Your password has been updated successfully.",
        confirmButtonColor: "#3085d6",
      });

      setOldPassword("");
      setNewPassword("");
      confirmNewPassword("");
      setActiveForm("info");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.response?.data?.message || "Error changing password",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file); // ✅ matches backend

    try {
      setUploading(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        "http://localhost:3000/auth/upload-profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUser((prev) => ({
        ...prev,
        profile_image: res.data.imagePath, // store relative path
      }));

      await fetchUserData();

      Swal.fire({
        icon: "success",
        title: "Profile photo updated!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.error || "Something went wrong",
      });
    } finally {
      setUploading(false);
    }
  };

  const today = new Date();
  // Get weekday name
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  // Get date in DD/MM/YYYY format
  const date = today.toLocaleDateString("en-GB"); // "20/06/2023"

  return (
    <div
      className="m-0 p-0 h-screen w-screen relative"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="absolute w-screen px-4 py-4 h-1/12 bg-[#F8F8F8] flex items-center">
        <div className="text-center mx-auto w-[25%] md:w-[30%] lg:w-[25%]">
          <h2 className="text-3xl font-bold">
            <span className="text-red-500">Dash</span>
            <span className="text-black">board</span>
          </h2>
        </div>
        <div className="w-screen flex justify-center h-[120%]">
          <input
            type="text"
            placeholder="Search your task here..."
            style={{ fontFamily: "Montserrat, sans-serif" }}
            className="rounded-lg px-5 py-2 outline-none shadow-sm bg-white w-[50%] placeholder:text-sm"
          />
          <button
            type="submit"
            className="bg-[#FF6767] px-1 py-1 rounded-lg flex items-center justify-center cursor-pointer"
          >
            <img
              src="/Dashboard/SearchICon.png"
              alt="search-icon"
              className="w-[100%] h-[100%]"
            />
          </button>
          <div className="w-[8%]" />
          <div className="flex space-x-1">
            <button className="bg-[#FF6767] px-1 py-1 rounded-lg flex items-center justify-center cursor-pointer">
              <img
                src="/Dashboard/Notifications.png"
                alt="notifications"
                className="w-[100%] h-[100%]"
              />
            </button>
            <CalendarPopup>
              <button className="bg-[#FF6767] px-1 py-1 rounded-lg flex items-center justify-center cursor-pointer">
                <img
                  src="/Dashboard/Calendar.png"
                  alt="calendar"
                  className="w-[100%] h-[100%]"
                />
              </button>
            </CalendarPopup>
            <div className="text-sm font-medium text-left ml-5">
              <h2 className="text-black">{weekday}</h2>
              <span className="text-[#00AEEF]">{date}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 container mx-auto w-[25%] md:w-[25%] lg:w-[20%] px-5 py-5 h-[85%] bg-[#000000] rounded-md flex flex-col items-center">
        <img
          src={
            user?.profile_picture
              ? `http://localhost:3000${user.profile_picture}` // relative path prefixed once
              : "/Dashboard/Profile.png" // fallback
          }
          alt="profile picture"
          className="-mt-17 mb-2 rounded-full object-cover w-25 h-25 border-2 border-white"
        />
        {user ? (
          <div className="text-center text-white mt-0">
            <h2 className="text-lg font-semibold">{user.username}</h2>
            <p className="text-sm text-gray-300">{user.email}</p>
          </div>
        ) : (
          <p className="text-gray-400 mt-4">Loading...</p>
        )}
        <button
          onClick={() => navigate("/")}
          className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer"
        >
          <img
            src="/Dashboard/Dashboard.png"
            alt="dashboard icon"
            className="w-[8%] h-[60%] group-hover:hidden"
          />
          <img
            src="/Dashboard/Dashboard-Red.png"
            alt="dashboard-red icon"
            className="w-[8%] h-[60%] hidden group-hover:block"
          />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => navigate("/vitaltask")}
          className="mt-2 group flex items-center h-[8%] space-x-7 w-full text-white rounded-xl px-6 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer"
        >
          <img
            src="/Dashboard/VitalTask.png"
            alt="vitaltask icon"
            className="w-[2.5%] h-[50%] group-hover:hidden"
          />
          <img
            src="/Dashboard/VitalTask-Red.png"
            alt="vitaltask-red icon"
            className="w-[2.5%] h-[50%] hidden group-hover:block"
          />
          <span>Vital Task</span>
        </button>
        <button
          onClick={() => navigate("/mytask")}
          className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer"
        >
          <img
            src="/Dashboard/MyTask.png"
            alt="mytask icon"
            className="w-[8%] h-[60%] group-hover:hidden"
          />
          <img
            src="/Dashboard/MyTask-Red.png"
            alt="mytask-red icon"
            className="w-[8%] h-[60%] hidden group-hover:block"
          />
          <span>My Task</span>
        </button>
        <button
          onClick={() => navigate("/taskcategories")}
          className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer"
        >
          <img
            src="/Dashboard/TaskCategories.png"
            alt="taskcate icon"
            className="w-[8%] h-[60%] group-hover:hidden"
          />
          <img
            src="/Dashboard/TaskCategories-Red.png"
            alt="taskcate-red icon"
            className="w-[8%] h-[60%] hidden group-hover:block"
          />
          <span>Task Categories</span>
        </button>
        <button className="mt-2 group flex items-center h-[8%] space-x-4 w-full rounded-xl px-4 py-2 bg-white text-[#FF6767] transition cursor-pointer">
          <img
            src="/Dashboard/Settings-Red.png"
            alt="settings-red icon"
            className="w-[8%] h-[60%]"
          />
          <span>Settings</span>
        </button>
        <button
          onClick={handleHelpClick}
          className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer"
        >
          <img
            src="/Dashboard/Help.png"
            alt="help icon"
            className="w-[8%] h-[60%] group-hover:hidden"
          />
          <img
            src="/Dashboard/Help-Red.png"
            alt="help-red icon"
            className="w-[8%] h-[60%] hidden group-hover:block"
          />
          <span>Help</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={handleLogout}
          className="group flex items-center h-[8%] space-x-2 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer"
        >
          <img
            src="/Dashboard/Logout.png"
            alt="logout icon"
            className="w-[8%] h-[60%] group-hover:hidden"
          />
          <img
            src="/Dashboard/Logout-Red.png"
            alt="logout-red icon"
            className="w-[8%] h-[60%] hidden group-hover:block"
          />
          <span>Logout</span>
        </button>
      </div>
      <div className="absolute px-8 py-4 border-2 border-gray-300 shadow-2xl container mx-auto w-[65%] md:w-[65%] lg:w-[70%] mr-[4.5%] h-[83%] mb-[1.2%] rounded-2xl bg-white right-0 bottom-0">
        <div className="">
          <p className="relative inline-block font-semibold font-black-600 text-xl">
            Account Information
            <span className="absolute left-0 bottom-[-4px] w-[70%] border-b-3 border-[#F24E1E]"></span>
          </p>
        </div>
        <div className="flex items-center mt-5 cursor-pointer">
          <img
            src={
              user?.profile_picture
                ? `http://localhost:3000${user.profile_picture}` // relative path prefixed once
                : "/Dashboard/Profile.png" // fallback
            }
            alt="Profile"
            className="rounded-full object-cover w-28 h-28"
            onClick={() => fileInputRef.current.click()}
          />

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          <div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => fileInputRef.current.click()}
          >
            {uploading ? "Uploading..." : "Upload a photo"}
          </div>
          {user ? (
            <div className="ml-5 text-left text-black mt-0">
              <h2 className="text-lg font-semibold">{user.username}</h2>
              <p className="text-sm text-black-300">{user.email}</p>
            </div>
          ) : (
            <p className="text-gray-400 mt-4">Loading...</p>
          )}
        </div>
        <div className="absolute px-8 py-4 border-2 border-gray-300 shadow-2xl container mx-auto w-[95%] mt-3 h-[67%] rounded-2xl bg-white">
          {activeForm === "info" && (
            <form
              className="h-[100%]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="firstname"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  value={user?.firstname || ""}
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  readOnly
                  id="firstname"
                  name="firstname"
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="lastname"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  value={user?.lastname || ""}
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  readOnly
                  id="lastname"
                  name="lastname"
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="email"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Email Address
                </label>
                <input
                  type="text"
                  value={user?.email || ""}
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  readOnly
                  id="email"
                  name="email"
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="contactnumber"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Contact Number
                </label>
                <input
                  type="text"
                  value={user?.contactnumber || ""}
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  readOnly
                  id="contactnumber"
                  name="contactnumber"
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="position"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Position
                </label>
                <input
                  type="text"
                  value={user?.position || ""}
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  readOnly
                  id="position"
                  name="position"
                />
              </div>
              <button
                type="button"
                onClick={() => setActiveForm("updateInfo")}
                className="w-1/6 mr-2 h-[10%] bg-[#F24E1E] text-white py-2 border rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300"
              >
                Update Info
              </button>
              <button
                type="button"
                onClick={() => setActiveForm("changePassword")}
                className="w-1/5 h-[10%] bg-[#F24E1E] text-white py-2 border rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300"
              >
                Change Password
              </button>
            </form>
          )}

          {activeForm === "updateInfo" && (
            <form
              className="h-[100%]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="firstname"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  onChange={handleChange}
                  id="firstname"
                  name="firstname"
                  required
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="lastname"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  onChange={handleChange}
                  id="lastname"
                  name="lastname"
                  required
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="email"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Email Address
                </label>
                <input
                  type="text"
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  onChange={handleChange}
                  id="email"
                  name="email"
                  required
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="contactnumber"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Contact Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your contact number"
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  onChange={handleChange}
                  id="contactnumber"
                  name="contactnumber"
                  required
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="position"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Position
                </label>
                <input
                  type="text"
                  placeholder="Enter your position"
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  onChange={handleChange}
                  id="position"
                  name="position"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="w-[20%] mr-2 h-[10%] bg-[#F24E1E] text-white py-2 border rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setActiveForm("info")}
                className="w-[13%] mr-2 h-[10%] bg-[#F24E1E] text-white py-2 border rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300"
              >
                Cancel
              </button>
            </form>
          )}

          {activeForm === "changePassword" && (
            <form
              className="h-[100%]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="currentpassword"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  id="currentpassword"
                  name="currentpassword"
                  required
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="newpassword"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your new password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  id="newpassword"
                  name="newpassword"
                  required
                />
              </div>
              <div className="mb-6 h-[12%] w-[60%] relative">
                <label
                  htmlFor="confirmpassword"
                  className="block text-black-700 font-semibold text-sm mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your new password"
                  id="confirmpassword"
                  name="confirmpassword"
                  onChange={(e) => confirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                  style={{
                    paddingLeft: "2.5%", // make space for the background icon
                  }}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleChangePassword}
                className="w-[20%] mr-2 h-[10%] bg-[#F24E1E] text-white py-2 border rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setActiveForm("info")}
                className="w-[13%] mr-2 h-[10%] bg-[#F24E1E] text-white py-2 border rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;