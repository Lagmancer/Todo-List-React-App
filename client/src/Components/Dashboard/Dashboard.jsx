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

const Dashboard = ({user, setUser}) => {
  const navigate = useNavigate()
  const [modalType, setModalType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [taskForm, setTaskForm] = useState({
    task_title: "",
    date: "",
    priority_id: 0,
    status_id: 0,   
    task_description: "",
    task_image: null, 
    extra_categories: [] 
  });

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    if (item?.id) {
      setEditId(item.id);
    }
    setFormData({ ...item });
    setIsModalOpen(true);
  };
  
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [priorityRes, statusRes, categoryRes, valuesRes] = await Promise.all([
        axios.get("http://localhost:3000/auth/priorities", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/auth/statuses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/auth/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/auth/category_values", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Group values by category_id
      const grouped = valuesRes.data.reduce((acc, val) => {
        if (!acc[val.category_id]) acc[val.category_id] = [];
        acc[val.category_id].push(val);
        return acc;
      }, {});

      setCategoryValues(grouped);
      setCategories(categoryRes.data);
      setPriorities(priorityRes.data);
      setStatuses(statusRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <button
        className="mt-2 group flex items-center h-[8%] space-x-4 w-full rounded-xl px-4 py-2 bg-white text-[#FF6767] transition cursor-pointer">
          <img src="/Dashboard/Dashboard-Red.png" 
          alt="dashboard icon" 
          className="w-[8%] h-[60%]" />
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
        <button onClick={() => navigate("/mytask")}
        className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer">
          <img src="/Dashboard/MyTask.png" 
          alt="mytask icon" 
          className="w-[8%] h-[60%] group-hover:hidden" />
          <img src="/Dashboard/MyTask-Red.png" 
          alt="mytask-red icon" 
          className="w-[8%] h-[60%] hidden group-hover:block" />
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
      <div className="absolute container mx-auto w-[65%] md:w-[65%] lg:w-[70%] mr-[4.5%] h-[83%] mb-[1.2%] bg-white right-0 bottom-0">
        <div className="absolute w-[100%] h-[7%]">
          <div className="flex items-center text-left text-black-500">
            <h2 className="text-3xl font-medium">Welcome back, {user.username} 👋</h2>
          </div>
        </div>
        <div className="absolute mt-[5%] shadow-2xl border-2 border-gray-300 container w-[100%] mr-[4.5%] h-[92%] mb-[1.2%] bg-white p-6 flex gap-6">
          <div className="w-[50%] bg-white rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center">
              <img
                src="/DashboardMenu/To-Do.png"
                alt="dashboard icon"
                className="w-[35%] h-[35%]"
              />
              <h2 className="text-md text-[#FF6767] font-medium">To-Do</h2>
              </div>
                <button 
                onClick={() => handleEdit(null, "add-task")}
                className="text-sm hover:underline text-gray-400 cursor-pointer">
                  <span className="text-[#FF6767] mr-1 text-xl">+</span> Add task
                </button>
              </div>
            </div>
          <div className="w-[50%]">
            <div className="w-[100%] mb-[5%] h-[40%] bg-white rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center">
              <img
                src="/DashboardMenu/TaskStatus.png"
                alt="dashboard icon"
                className="w-[5%] h-[5%] mr-[2%]"
              />
              <h2 className="text-sm text-[#FF6767] font-medium">Task Status</h2>
              </div>
            </div>
            <div className="w-[100%] h-[55%] bg-white rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center">
              <img
                src="/DashboardMenu/TaskComplete.png"
                alt="dashboard icon"
                className="w-[4%] h-[4%] mr-[2%]"
              />
              <h2 className="text-sm text-[#FF6767] font-medium">Completed Task</h2>
              </div>
            </div>
          </div>
        </div>
        {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80">
          <div className="px-[4%] py-[2%] bg-white rounded-xl shadow-2xl w-[60%] h-[80%] p-6 transform transition-all duration-300 ease-out scale-95 animate-scaleUp">
            {modalType === "add-task" && (
              <>
              <h2 className="relative inline-block text-xl font-semibold text-black-600">
               Add New Task
               <span className="absolute left-0 bottom-[-1px] w-[90%] border-b-3 border-[#F24E1E]"></span>
               </h2>

           <form className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 mb-[1.2%] bg-white w-[87%] h-[80%]">
             <div className="absolute overflow-x-auto max-w-full px-4 py-4 border-1 border-gray-300 shadow-2xl 
               bg-white w-[100%] h-[85%]">
             <div className="mb-8 h-[12%] w-[60%] relative">
             <label htmlFor="priority_name" className='block text-black-700 font-semibold text-sm mb-1'>Task Priority Name</label>
             <input type="text" 
             className='w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs'
               style={{
                 paddingLeft: '2.5%' // make space for the background icon
               }}
               readOnly
               id="priority_name"
               name="priority_name"/>
             </div>

             <div className="mb-8 h-[12%] w-[60%] relative">
             <label htmlFor="priority_color" className='block text-black-700 font-semibold text-sm mb-1'>Task Priority Color</label>
             
             <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 py-2 border-2 rounded-md h-[80%] text-xs"
                  readOnly
                  id="priority_color"
                  name="priority_color"
                />
              </div>
             </div>

             <div className="mb-10 h-[12%] w-[60%] relative">
             <label htmlFor="priority_level" className='block text-black-700 font-semibold text-sm mb-1'>Task Priority Level</label>
             <input type="text" 
             className='w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs'
               style={{
                 paddingLeft: '2.5%' // make space for the background icon
               }}
               readOnly
               id="priority_level"
               name="priority_level"/>
             </div>
             </div>
             <div className="flex justify-start space-x-3 absolute bottom-0 left-4">
               <button
                 type="button"
                 onClick={() => setIsModalOpen(false)}
                 className="bg-[#F24E1E] text-white px-6 py-2 rounded-md hover:opacity-90 transition cursor-pointer"
               >
              Done
             </button>
            </div>
           </form>
             </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Dashboard