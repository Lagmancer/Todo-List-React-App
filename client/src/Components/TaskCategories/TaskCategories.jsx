import axios from "axios";
import React, { useEffect, useState } from "react";
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
            prev2Label={null}
            next2Label={null}
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
    confirmButtonColor: "#FF6767",
    confirmButtonText: "OK",
  });
};

const TaskCategories = ({ user, setUser }) => {
  const [categoryForm, setCategoryform] = useState("category");
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editId, setEditId] = useState(null);
  const [modalType, setModalType] = useState(""); // "priority" or "status"
  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState([]);
  const navigate = useNavigate();
  const [categoryValues, setCategoryValues] = useState({});
  const [formValue, setFormValue] = useState({
    value_name: "",
    value_color: "#000000",
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [priorityForm, setPriorityForm] = useState({
    priority_name: "",
    priority_color: "#000000",
    priority_level: 0,
  });
  const [statusForm, setStatusForm] = useState({
    status_name: "",
    status_color: "#000000",
  });
  const [categoryName, setCategoryName] = useState({ category_name: "" });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [priorityRes, statusRes, categoryRes, valuesRes] =
        await Promise.all([
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

  const handleAddPriority = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/auth/add-priority",
        {
          priority_name: priorityForm.priority_name,
          priority_color: priorityForm.priority_color,
          priority_level: priorityForm.priority_level,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Swal.fire({
        icon: "success",
        title: "Priority Added!",
        timer: 1500,
        showConfirmButton: false,
      });

      setPriorityForm({
        priority_name: "",
        priority_color: "#000000",
        priority_level: 0,
      });
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleSavePriority = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:3000/auth/priorities/${editId}`,
        priorityForm,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire({
        icon: "success",
        title: "Priority Edited!",
        timer: 1500,
        showConfirmButton: false,
      });

      setPriorityForm({
        priority_name: "",
        priority_color: "#000000",
        priority_level: 0,
      });
      setIsModalOpen(false);
      await fetchData(); // reload updated priorities
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.message || "Something went wrong",
      });
      console.error("Error updating priority:", err);
    }
  };

  const handleDeletePriority = async (id) => {
    const token = localStorage.getItem("token");

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#F24E1E",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3000/auth/priorities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the list
      fetchData();

      Swal.fire({
        title: "Deleted!",
        text: "Priority has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete priority.",
        icon: "error",
        confirmButtonColor: "#F24E1E",
      });
    }
  };

  const handleAddStatus = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/auth/add-statuses",
        {
          status_name: statusForm.status_name,
          status_color: statusForm.status_color,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Swal.fire({
        icon: "success",
        title: "Status Added!",
        timer: 1500,
        showConfirmButton: false,
      });

      setStatusForm({
        status_name: "",
        status_color: "#000000",
      });
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:3000/auth/statuses/${editId}`,
        statusForm,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire({
        icon: "success",
        title: "Status Edited!",
        timer: 1500,
        showConfirmButton: false,
      });

      setStatusForm({
        status_name: "",
        status_color: "#000000",
      });
      setIsModalOpen(false);
      await fetchData(); // reload updated priorities
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.message || "Something went wrong",
      });
      console.error("Error updating priority:", err);
    }
  };

  const handleDeleteStatus = async (id) => {
    const token = localStorage.getItem("token");

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#F24E1E",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3000/auth/statuses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the list
      fetchData();

      Swal.fire({
        title: "Deleted!",
        text: "Status has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete status.",
        icon: "error",
        confirmButtonColor: "#F24E1E",
      });
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3000/auth/add-category",
        { category_name: categoryName.category_name },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire({
        title: "Success!",
        text: "Category created successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setCategoryform("category");
      setCategoryName({ category_name: "" });
      fetchData();
    } catch (err) {
      console.error("Add category error:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to create category.",
        icon: "error",
        confirmButtonColor: "#F24E1E",
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    const token = localStorage.getItem("token");

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Deleting this category will remove it permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#F24E1E",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3000/auth/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh list or filter locally
      setCategories((prev) => prev.filter((c) => c.id !== id));

      Swal.fire({
        title: "Deleted!",
        text: "Category has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete category.",
        icon: "error",
        confirmButtonColor: "#F24E1E",
      });
    }
  };

  const handleAddValues = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `http://localhost:3000/auth/add-category_values`,
        { category_id: selectedCategoryId, ...formValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire({
        icon: "success",
        title: "Value Added!",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormValue({
        value_name: "",
        value_color: "#000000",
      });
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.message || "Something went wrong",
      });
      console.error("Error updating value:", err);
    }
  };

  const handleSaveValues = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:3000/auth/category_values/${editId}`,
        { category_id: selectedCategoryId, ...formValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire({
        icon: "success",
        title: "Value Edited!",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormValue({
        value_name: "",
        value_color: "#000000",
      });
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.message || "Something went wrong",
      });
      console.error("Error updating value:", err);
    }
  };

  const handleDeleteValue = async (id) => {
    const token = localStorage.getItem("token");

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This value will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#F24E1E",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3000/auth/category_values/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh category values
      fetchData(); // assuming you already have fetchData that reloads both categories & values

      Swal.fire({
        title: "Deleted!",
        text: "Category value has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete value error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete category value.",
        icon: "error",
        confirmButtonColor: "#FF6767",
      });
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

  const today = new Date();
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const date = today.toLocaleDateString("en-GB");

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    if (item?.id) {
      setEditId(item.id);
    }
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleAddValue = (categoryId, modalType, item) => {
    setSelectedCategoryId(categoryId);
    setFormValue({ value_name: "", value_color: "" });
    if (item?.id) {
      setEditId(item.id);
    }
    setModalType(modalType);
    setIsModalOpen(true);
  };

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
              ? `http://localhost:3000${user.profile_picture}`
              : "/Dashboard/Profile.png"
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

        <button className="mt-2 group flex items-center h-[8%] space-x-4 w-full rounded-xl px-4 py-2 bg-white text-[#FF6767] transition cursor-pointer">
          <img
            src="/Dashboard/TaskCategories-Red.png"
            alt="taskcate-red icon"
            className="w-[8%] h-[60%]"
          />
          <span>Task Categories</span>
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="mt-2 group flex items-center h-[8%] space-x-4 w-full text-white rounded-xl px-4 py-2 hover:bg-white hover:text-[#FF6767] transition cursor-pointer"
        >
          <img
            src="/Dashboard/Settings.png"
            alt="settings icon"
            className="w-[8%] h-[60%] group-hover:hidden"
          />
          <img
            src="/Dashboard/Settings-Red.png"
            alt="settings-red icon"
            className="w-[8%] h-[60%] hidden group-hover:block"
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

      <div
        className="absolute overflow-x-auto max-w-full px-8 py-4 border-2 border-gray-300 shadow-2xl container mx-auto w-[65%] md:w-[65%] lg:w-[70%] mr-[4.5%] h-[83%] mb-[1.2%] rounded-2xl bg-white right-0 bottom-0"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {categoryForm === "category" && (
          <>
            <div>
              <p className="relative inline-block font-semibold font-black-600 text-xl">
                Task Categories
                <span className="absolute left-0 bottom-[-1px] w-[25%] border-b-3 border-[#F24E1E]"></span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCategoryform("createCategory")}
              className="mb-[4%] w-1/8 mt-[1.5%] h-[6%] bg-[#F24E1E] text-white py-1 border rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300"
            >
              Add Category
            </button>

            {/* STATUS TABLE */}
            <div className="mb-[5%]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="relative inline-block text-sm font-semibold text-black-600">
                  Task Status
                  <span className="absolute left-0 bottom-[-1px] w-[70%] border-b-3 border-[#F24E1E]"></span>
                </h2>
                <button
                  onClick={() => handleEdit(null, "add-status")}
                  className="text-sm hover:underline text-gray-400 cursor-pointer"
                >
                  <span className="text-[#FF6767] mr-1 text-xl">+</span> Add
                  Task Status
                </button>
              </div>
              <table className="w-full border-separate border-spacing-0 border-2 rounded-md border-gray-300 shadow-2xl text-sm text-left">
                <thead className="">
                  <tr className="border-2 border-gray-300">
                    <th className="p-3 w-[8%] border-b-2 border-r-2 border-gray-300 text-center">
                      SN
                    </th>
                    <th className="p-3 w-[52%] border-b-2 border-r-2 border-gray-300 text-center">
                      Task Status
                    </th>
                    <th className="p-3 w-[40%] border-b-2 border-gray-300 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statuses.map((s, index) => (
                    <tr key={s.id} className="">
                      <td className="p-3 border-r-2 border-gray-300 text-center">
                        {index + 1}
                      </td>
                      <td className="p-3 border-r-2 border-gray-300 text-center">
                        {s.status_name}
                      </td>
                      {s.is_default ? (
                        <>
                          <td className="flex flex-wrap justify-center gap-2 mt-[2%] mb-[2%]">
                            <button
                              onClick={() => handleEdit(s, "status")}
                              className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                            >
                              <img
                                src="/Category/Info.png"
                                alt="Info"
                                className="mr-2"
                              />
                              Check Info
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="flex flex-wrap justify-center gap-2 mt-[2%] mb-[2%]">
                            <button
                              onClick={() => handleEdit(s, "status")}
                              className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                            >
                              <img
                                src="/Category/Info.png"
                                alt="Info"
                                className="mr-2"
                              />
                              Check Info
                            </button>
                            <button
                              onClick={() => handleEdit(s, "edit-status")}
                              className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                            >
                              <img
                                src="/Category/Edit.png"
                                alt="Edit"
                                className="mr-2"
                              />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStatus(s.id)}
                              className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                            >
                              <img
                                src="/Category/Delete.png"
                                alt="Delete"
                                className="mr-2"
                              />
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PRIORITY TABLE */}
            <div className="mb-[5%]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="relative inline-block text-sm font-semibold text-black-600">
                  Task Priority
                  <span className="absolute left-0 bottom-[-1px] w-[70%] border-b-3 border-[#F24E1E]"></span>
                </h2>
                <button
                  onClick={() => handleEdit(null, "add-priority")}
                  className="text-sm hover:underline text-gray-400 cursor-pointer"
                >
                  <span className="text-[#FF6767] mr-1 text-xl">+</span> Add
                  Task Priority
                </button>
              </div>
              <table className="w-full border-separate border-spacing-0 border-2 rounded-md border-gray-300 shadow-2xl text-sm text-left">
                <thead className="">
                  <tr className="border-2 border-gray-300">
                    <th className="p-3 w-[8%] border-b-2 border-r-2 border-gray-300 text-center">
                      SN
                    </th>
                    <th className="p-3 w-[52%] border-b-2 border-r-2 border-gray-300 text-center">
                      Task Priority
                    </th>
                    <th className="p-3 w-[40%] border-b-2 border-gray-300 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {priorities.map((p, index) => (
                    <tr key={p.id} className="">
                      <td className="p-3 border-r-2 border-gray-300 text-center">
                        {index + 1}
                      </td>
                      <td className="p-3 border-r-2 border-gray-300 text-center">
                        {p.priority_name}
                      </td>
                      {p.is_default ? (
                        <>
                          <td className="flex flex-wrap justify-center gap-2 mt-[2%] mb-[2%]">
                            <button
                              onClick={() => handleEdit(p, "priority")}
                              className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                            >
                              <img
                                src="/Category/Info.png"
                                alt="Info"
                                className="mr-2"
                              />
                              Check Info
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="flex flex-wrap justify-center gap-2 mt-[2%] mb-[2%]">
                            <button
                              onClick={() => handleEdit(p, "priority")}
                              className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                            >
                              <img
                                src="/Category/Info.png"
                                alt="Info"
                                className="mr-2"
                              />
                              Check Info
                            </button>
                            <button
                              onClick={() => handleEdit(p, "edit-priority")}
                              className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                            >
                              <img
                                src="/Category/Edit.png"
                                alt="Edit"
                                className="mr-2"
                              />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePriority(p.id)}
                              className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                            >
                              <img
                                src="/Category/Delete.png"
                                alt="Delete"
                                className="mr-2"
                              />
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {categories.map((category) => (
              <div key={category.id} className="mb-[5%]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="relative inline-block text-sm font-semibold text-black-600">
                    {category.category_name}
                    <span className="absolute left-0 bottom-[-1px] w-[70%] border-b-3 border-[#F24E1E]"></span>
                  </h2>
                  <button
                    onClick={() =>
                      handleAddValue(category.id, "add-value", null)
                    }
                    className="text-sm hover:underline text-gray-400 cursor-pointer"
                  >
                    <span className="text-[#FF6767] mr-1 text-xl">+</span> Add{" "}
                    {category.category_name} Value
                  </button>
                </div>
                <table className="w-full mb-[2%] border-separate border-spacing-0 border-2 rounded-md border-gray-300 shadow-2xl text-sm text-left">
                  <thead>
                    <tr className="border-2 border-gray-300">
                      <th className="p-3 w-[8%] border-b-2 border-r-2 border-gray-300 text-center">
                        SN
                      </th>
                      <th className="p-3 w-[52%] border-b-2 border-r-2 border-gray-300 text-center">
                        Value Name
                      </th>
                      <th className="p-3 w-[40%] border-b-2 border-gray-300 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(categoryValues[category.id] || []).map((val, index) => (
                      <tr key={val.id}>
                        <td className="p-3 border-r-2 border-gray-300 text-center">
                          {index + 1}
                        </td>
                        <td className="p-3 border-r-2 border-gray-300 text-center">
                          {val.value_name}
                        </td>
                        <td className="flex flex-wrap justify-center gap-2 mt-[2%] mb-[2%]">
                          <button
                            onClick={() => handleEdit(val, "value")}
                            className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                          >
                            <img
                              src="/Category/Info.png"
                              alt="Info"
                              className="mr-2"
                            />
                            Check Info
                          </button>
                          <button
                            onClick={() =>
                              handleAddValue(category.id, "edit-value", val)
                            }
                            className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                          >
                            <img
                              src="/Category/Edit.png"
                              alt="Edit"
                              className="mr-2"
                            />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteValue(val.id)}
                            className="flex justify-between px-3 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                          >
                            <img
                              src="/Category/Delete.png"
                              alt="Delete"
                              className="mr-2"
                            />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-start">
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F24E1E] text-white rounded-md hover:opacity-90 cursor-pointer"
                  >
                    <img
                      src="/Category/Delete.png"
                      alt="Delete"
                      className="w-4 h-6"
                    />
                    Delete Category
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {categoryForm === "createCategory" && (
          <>
            <div>
              <p className="relative inline-block font-semibold font-black-600 text-xl mb-[3%]">
                Create Categories
                <span className="absolute left-0 bottom-[-1px] w-[25%] border-b-3 border-[#F24E1E]"></span>
              </p>
            </div>
            <div className="mb-[3%] h-[8%] w-[60%] relative">
              <label
                htmlFor="category_name"
                className="block text-black-700 font-semibold text-md mb-1"
              >
                Category Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[80%] text-xs"
                style={{
                  paddingLeft: "2.5%", // make space for the background icon
                }}
                onChange={(e) =>
                  setCategoryName({
                    ...categoryName,
                    category_name: e.target.value,
                  })
                }
                id="category_name"
                name="category_name"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleAddCategory}
              className="w-1/8 mt-[1.5%] mr-[.5%] h-[6%] bg-[#F24E1E] text-white py-1 border rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setCategoryform("category")}
              className="w-1/8 mt-[1.5%] h-[6%] bg-[#F24E1E] text-white py-1 border rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300"
            >
              Cancel
            </button>
          </>
        )}
        {/* 🔽 PUT THE MODAL JSX RIGHT HERE */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80">
            <div className="px-[4%] py-[2%] bg-white rounded-xl shadow-2xl w-[60%] h-[80%] p-6 transform transition-all duration-300 ease-out scale-95 animate-scaleUp">
              {modalType === "priority" && (
                <>
                  <h2 className="relative inline-block text-xl font-semibold text-black-600">
                    View{" "}
                    {modalType === "priority" ? "Task Priority" : "Task Status"}
                    <span className="absolute left-0 bottom-[-1px] w-[25%] border-b-3 border-[#F24E1E]"></span>
                  </h2>

                  <form
                    className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
               overflow-x-auto max-w-full px-8 py-4 border-1 border-gray-300 shadow-2xl 
               mb-[1.2%] bg-white w-[87%] h-[80%]"
                  >
                    <div className="mb-8 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="priority_name"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Priority Name
                      </label>
                      <input
                        type="text"
                        value={formData?.priority_name || ""}
                        className="w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs"
                        style={{
                          paddingLeft: "2.5%", // make space for the background icon
                        }}
                        readOnly
                        id="priority_name"
                        name="priority_name"
                      />
                    </div>

                    <div className="mb-8 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="priority_color"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Priority Color
                      </label>

                      <div className="relative">
                        <span
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 border border-gray-300"
                          style={{
                            backgroundColor:
                              formData?.priority_color || "#ffffff",
                          }}
                        ></span>
                        <input
                          type="text"
                          value={formData?.priority_color || ""}
                          className="w-full pl-10 py-2 border-2 rounded-md h-[80%] text-xs"
                          readOnly
                          id="priority_color"
                          name="priority_color"
                        />
                      </div>
                    </div>

                    <div className="mb-10 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="priority_level"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Priority Level
                      </label>
                      <input
                        type="text"
                        value={formData?.priority_level || ""}
                        className="w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs"
                        style={{
                          paddingLeft: "2.5%", // make space for the background icon
                        }}
                        readOnly
                        id="priority_level"
                        name="priority_level"
                      />
                    </div>

                    <div className="flex justify-start space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
              {modalType === "status" && (
                <>
                  <h2 className="relative inline-block text-xl font-semibold text-black-600">
                    View{" "}
                    {modalType === "priority" ? "Task Priority" : "Task Status"}
                    <span className="absolute left-0 bottom-[-1px] w-[25%] border-b-3 border-[#F24E1E]"></span>
                  </h2>

                  <form
                    className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                overflow-x-auto max-w-full px-8 py-4 border-1 border-gray-300 shadow-2xl 
                mb-[1.2%] bg-white w-[87%] h-[80%]"
                  >
                    <div className="mb-8 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="status_name"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Status Name
                      </label>
                      <input
                        type="text"
                        value={formData?.status_name || ""}
                        className="w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs"
                        style={{
                          paddingLeft: "2.5%", // make space for the background icon
                        }}
                        readOnly
                        id="status_name"
                        name="status_name"
                      />
                    </div>

                    <div className="mb-10 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="status_color"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Status Color
                      </label>
                      <div className="relative">
                        <span
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 border border-gray-300"
                          style={{
                            backgroundColor:
                              formData?.status_color || "#ffffff",
                          }}
                        ></span>
                        <input
                          type="text"
                          value={formData?.status_color || ""}
                          className="w-full pl-10 py-2 border-2 rounded-md h-[80%] text-xs"
                          readOnly
                          id="status_color"
                          name="status_color"
                        />
                      </div>
                    </div>

                    <div className="flex justify-start space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
              {modalType === "value" && (
                <>
                  <h2 className="relative inline-block text-xl font-semibold text-black-600">
                    View Category Value
                    <span className="absolute left-0 bottom-[-1px] w-[25%] border-b-3 border-[#F24E1E]"></span>
                  </h2>

                  <form
                    className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                overflow-x-auto max-w-full px-8 py-4 border-1 border-gray-300 shadow-2xl 
                mb-[1.2%] bg-white w-[87%] h-[80%]"
                  >
                    <div className="mb-8 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="value_name"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Value Name
                      </label>
                      <input
                        type="text"
                        value={formData?.value_name || ""}
                        className="w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs"
                        style={{
                          paddingLeft: "2.5%", // make space for the background icon
                        }}
                        readOnly
                        id="value_name"
                        name="value_name"
                      />
                    </div>

                    <div className="mb-10 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="value_color"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Value Color
                      </label>
                      <div className="relative">
                        <span
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 border border-gray-300"
                          style={{
                            backgroundColor: formData?.value_color || "#ffffff",
                          }}
                        ></span>
                        <input
                          type="text"
                          value={formData?.value_color || ""}
                          className="w-full pl-10 py-2 border-2 rounded-md h-[80%] text-xs"
                          readOnly
                          id="value_color"
                          name="value_color"
                        />
                      </div>
                    </div>

                    <div className="flex justify-start space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
              {(modalType === "add-priority" ||
                modalType === "edit-priority") && (
                <>
                  <h2 className="relative inline-block text-xl font-semibold text-black-600">
                    {modalType === "add-priority"
                      ? "Add Task Priority"
                      : "Edit Task Priority"}
                    <span className="absolute left-0 bottom-[-1px] w-[25%] border-b-3 border-[#F24E1E]"></span>
                  </h2>

                  <form
                    onSubmit={
                      modalType === "add-priority"
                        ? handleAddPriority
                        : handleSavePriority
                    }
                    className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
               overflow-x-auto max-w-full px-8 py-4 border-1 border-gray-300 shadow-2xl 
               mb-[1.2%] bg-white w-[87%] h-[80%]"
                  >
                    <div className="mb-8 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="priority_name"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Priority Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs"
                        style={{
                          paddingLeft: "2.5%", // make space for the background icon
                        }}
                        onChange={(e) =>
                          setPriorityForm({
                            ...priorityForm,
                            priority_name: e.target.value,
                          })
                        }
                        id="priority_name"
                        name="priority_name"
                        required
                      />
                    </div>

                    <div className="mb-8 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="priority_color"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Priority Color
                      </label>

                      <div className="relative">
                        <input
                          type="color"
                          onChange={(e) =>
                            setPriorityForm({
                              ...priorityForm,
                              priority_color: e.target.value,
                            })
                          }
                          className="w-12 h-12 cursor-pointer rounded-none border-2 border-black-300"
                          id="priority_color"
                          name="priority_color"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-10 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="priority_level"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Priority Level
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        className="w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs"
                        style={{
                          paddingLeft: "2.5%", // make space for the background icon
                        }}
                        onChange={(e) =>
                          setPriorityForm({
                            ...priorityForm,
                            priority_level: e.target.value,
                          })
                        }
                        id="priority_level"
                        name="priority_level"
                        required
                      />
                    </div>

                    <div className="flex justify-start space-x-3">
                      <button
                        type="submit"
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        {modalType === "add-priority"
                          ? "Add Task Priority"
                          : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
              {(modalType === "add-status" || modalType === "edit-status") && (
                <>
                  <h2 className="relative inline-block text-xl font-semibold text-black-600">
                    {modalType === "add-status"
                      ? "Add Task Status"
                      : "Edit Task Status"}
                    <span className="absolute left-0 bottom-[-1px] w-[25%] border-b-3 border-[#F24E1E]"></span>
                  </h2>

                  <form
                    onSubmit={
                      modalType === "add-status"
                        ? handleAddStatus
                        : handleSaveStatus
                    }
                    className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
               overflow-x-auto max-w-full px-8 py-4 border-1 border-gray-300 shadow-2xl 
               mb-[1.2%] bg-white w-[87%] h-[80%]"
                  >
                    <div className="mb-8 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="status_name"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Status Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs"
                        style={{
                          paddingLeft: "2.5%", // make space for the background icon
                        }}
                        onChange={(e) =>
                          setStatusForm({
                            ...statusForm,
                            status_name: e.target.value,
                          })
                        }
                        id="status_name"
                        name="status_name"
                        required
                      />
                    </div>

                    <div className="mb-10 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="status_color"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Task Status Color
                      </label>

                      <div className="relative">
                        <input
                          type="color"
                          onChange={(e) =>
                            setStatusForm({
                              ...statusForm,
                              status_color: e.target.value,
                            })
                          }
                          className="w-12 h-12 cursor-pointer rounded-none border-2 border-black-300"
                          id="status_color"
                          name="status_color"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-start space-x-3">
                      <button
                        type="submit"
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        {modalType === "add-status"
                          ? "Add Task Status"
                          : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
              {(modalType === "add-value" || modalType === "edit-value") && (
                <>
                  <h2 className="relative inline-block text-xl font-semibold text-black-600">
                    {modalType === "add-value"
                      ? "Add Category Value"
                      : "Edit Category Value"}
                    <span className="absolute left-0 bottom-[-1px] w-[25%] border-b-3 border-[#F24E1E]"></span>
                  </h2>

                  <form
                    onSubmit={
                      modalType === "add-value"
                        ? handleAddValues
                        : handleSaveValues
                    }
                    className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
               overflow-x-auto max-w-full px-8 py-4 border-1 border-gray-300 shadow-2xl 
               mb-[1.2%] bg-white w-[87%] h-[80%]"
                  >
                    <div className="mb-8 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="value_name"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Value Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border-2 rounded-md border-black-300 h-[80%] text-xs"
                        style={{
                          paddingLeft: "2.5%", // make space for the background icon
                        }}
                        onChange={(e) =>
                          setFormValue({
                            ...formValue,
                            value_name: e.target.value,
                          })
                        }
                        id="value_name"
                        name="value_name"
                        required
                      />
                    </div>

                    <div className="mb-10 h-[12%] w-[60%] relative">
                      <label
                        htmlFor="value_color"
                        className="block text-black-700 font-semibold text-sm mb-1"
                      >
                        Value Color
                      </label>

                      <div className="relative">
                        <input
                          type="color"
                          onChange={(e) =>
                            setFormValue({
                              ...formValue,
                              value_color: e.target.value,
                            })
                          }
                          className="w-12 h-12 cursor-pointer rounded-none border-2 border-black-300"
                          id="value_color"
                          name="value_color"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-start space-x-3">
                      <button
                        type="submit"
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        {modalType === "add-value"
                          ? "Add Category Value"
                          : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        Cancel
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
  );
};

export default TaskCategories;