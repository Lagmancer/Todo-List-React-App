import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";

export function CalendarPopup({ children }) {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      {/* Use whatever button is passed in */}
      <div className="flex"onClick={() => setOpen(!open)}>
        {children}
      </div>

      {/* Popup Calendar */}
      {open && (
        <div className="absolute right-0 mt-10 z-60 w-[25%] rounded-2xl bg-white shadow-2xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-800">Calendar</h2>
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
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
            prev2Label={null}   // remove "«"
            next2Label={null}   // remove "»"
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

const MyTask = ({user}) => {
  const navigate = useNavigate()
  

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const today = new Date();
  // Get weekday name
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  // Get date in DD/MM/YYYY format
  const date = today.toLocaleDateString("en-GB"); // "20/06/2023"

  return (
    <div className="m-0 p-0 h-screen w-screen relative" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="absolute w-screen px-4 py-4 h-1/12 bg-[#F8F8F8] flex items-center">
        <div className="text-center mx-auto w-[25%] md:w-[30%] lg:w-[25%]">
          <h2 className="text-3xl font-bold">
            <span className="text-red-500">Dash</span>
            <span className="text-black">board</span>
          </h2>
        </div>
        <div className="w-screen flex justify-center h-[120%]">
          <input type="text" 
            placeholder='Search your task here...'
            style={{ fontFamily: "Montserrat, sans-serif" }}
            className="rounded-lg px-5 py-2 outline-none shadow-sm bg-white w-[50%] placeholder:text-sm"
          />
          <button type="submit" className="bg-[#FF6767] px-1 py-1 rounded-lg flex items-center justify-center cursor-pointer">
            <img src="/Dashboard/SearchICon.png" alt="search-icon" className="w-[100%] h-[100%]" />
          </button>
          <div className="w-[8%]" />
          <div className="flex space-x-1">
            <button className="bg-[#FF6767] px-1 py-1 rounded-lg flex items-center justify-center cursor-pointer">
              <img src="/Dashboard/Notifications.png" alt="notifications" className="w-[100%] h-[100%]" />
            </button>
            <CalendarPopup>
              <button className="bg-[#FF6767] px-1 py-1 rounded-lg flex items-center justify-center cursor-pointer">
                <img src="/Dashboard/Calendar.png" alt="calendar" className="w-[100%] h-[100%]" />
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
        <img src={
          user?.profile_picture
            ? `http://localhost:3000${user.profile_picture}` // relative path prefixed once
            : "/Dashboard/Profile.png" // fallback
        }
        alt="profile picture" 
        className='-mt-17 mb-2 rounded-full object-cover w-25 h-25 border-2 border-white'/>
        {user ? (
          <div className="text-center text-white mt-0">
            <h2 className="text-lg font-semibold">{user.username}</h2>
            <p className="text-sm text-gray-300">{user.email}</p>
          </div>
          ) : (
            <p className="text-gray-400 mt-4">Loading...</p>
          )}
        <button onClick={() => navigate("/")}
         className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer">
         <img src="/Dashboard/Dashboard.png" 
         alt="dashboard icon" 
         className="w-[8%] h-[60%] group-hover:hidden" />
          <img src="/Dashboard/Dashboard-Red.png" 
          alt="dashboard-red icon" 
          className="w-[8%] h-[60%] hidden group-hover:block" />
          <span>Dashboard</span>
        </button>
        <button onClick={() => navigate("/vitaltask")}
        className="mt-2 group flex items-center h-[8%] space-x-7 w-full text-white rounded-xl px-6 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer">
          <img src="/Dashboard/VitalTask.png" 
          alt="vitaltask icon" 
          className="w-[2.5%] h-[50%] group-hover:hidden" />
          <img src="/Dashboard/VitalTask-Red.png" 
          alt="vitaltask-red icon" 
          className="w-[2.5%] h-[50%] hidden group-hover:block" />
          <span>Vital Task</span>
        </button>
        <button
        className="mt-2 group flex items-center h-[8%] space-x-4 w-full rounded-xl px-4 py-2 bg-white text-[#FF6767] transition cursor-pointer">
          <img src="/Dashboard/MyTask-Red.png" 
          alt="mytask icon" 
          className="w-[8%] h-[60%]" />
          <span>My Task</span>
        </button>
        <button onClick={() => navigate("/taskcategories")}
        className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer">
          <img src="/Dashboard/TaskCategories.png" 
          alt="taskcate icon" 
          className="w-[8%] h-[60%] group-hover:hidden" />
          <img src="/Dashboard/TaskCategories-Red.png" 
          alt="taskcate-red icon" 
          className="w-[8%] h-[60%] hidden group-hover:block" />
          <span>Task Categories</span>
        </button>
        <button onClick={() => navigate("/settings")}
        className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer">
          <img src="/Dashboard/Settings.png" 
          alt="settings icon" 
          className="w-[8%] h-[60%] group-hover:hidden" />
          <img src="/Dashboard/Settings-Red.png" 
          alt="settings-red icon" 
          className="w-[8%] h-[60%] hidden group-hover:block" />
          <span>Settings</span>
        </button>
        <button onClick={handleHelpClick}
        className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer">
          <img src="/Dashboard/Help.png" 
          alt="help icon" 
          className="w-[8%] h-[60%] group-hover:hidden" />
          <img src="/Dashboard/Help-Red.png" 
          alt="help-red icon" 
          className="w-[8%] h-[60%] hidden group-hover:block" />
          <span>Help</span>
        </button>
        <div className="flex-1" />
        <button  onClick={handleLogout} 
        className="group flex items-center h-[8%] space-x-2 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer">
          <img src="/Dashboard/Logout.png" 
          alt="logout icon" 
          className="w-[8%] h-[60%] group-hover:hidden" />
          <img src="/Dashboard/Logout-Red.png" 
          alt="logout-red icon" 
          className="w-[8%] h-[60%] hidden group-hover:block" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default MyTask