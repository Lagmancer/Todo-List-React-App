import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
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

const MyTask = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categoryValues, setCategoryValues] = useState({});
  const [statuses, setStatuses] = useState([]);
  const fileInputRef = useRef(null);
  const [editId, setEditId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [menuOpenFor2, setMenuOpenFor2] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    task_title: "",
    date: "",
    priority_id: 0,
    status_id: 0,
    task_description: "",
    task_image: null,
    extra_categories: [],
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTaskForm({ ...taskForm, task_image: file });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setTaskForm({ ...taskForm, task_image: file });
    }
  };

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    if (item?.id) {
      setEditId(item.id);
    }
    if (type === "edit-task") {
      const localDate = new Date(
        new Date(item.date).getTime() -
          new Date(item.date).getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];
      setTaskForm({
        task_title: item.task_title || "",
        date: localDate || "",
        priority_id: item.priority,
        status_id: item.status,
        task_description: item.task_description || "",
        task_image: null, // reset image, user can upload new one
        extra_categories: [],
      });
    }
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [priorityRes, statusRes, categoryRes, valuesRes, tasksRes] =
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
          axios.get("http://localhost:3000/auth/tasks", {
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
      setTasks(tasksRes.data.tasks || []);

      console.log("📦 Tasks fetched:", tasksRes.data.tasks);
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    console.log("📝 Task form data before submit:", taskForm);

    // Validation
    if (
      !taskForm.task_title ||
      !taskForm.date ||
      !taskForm.priority_id ||
      !taskForm.task_description
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please complete all required fields before submitting.",
        confirmButtonColor: "#FF6767",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("task_title", taskForm.task_title);
      formData.append("date", taskForm.date);
      formData.append("priority_id", taskForm.priority_id);
      formData.append("status_id", taskForm.status_id);
      formData.append("task_description", taskForm.task_description);

      if (taskForm.task_image) {
        formData.append("task_image", taskForm.task_image);
      }

      // Add extra categories as JSON
      formData.append(
        "extra_categories",
        JSON.stringify(taskForm.extra_categories),
      );

      // Send request
      const res = await axios.post(
        "http://localhost:3000/auth/add-task",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Task Added Successfully!",
          confirmButtonColor: "#FF6767",
        });

        fetchData();
        // Reset form
        setTaskForm({
          task_title: "",
          date: "",
          priority_id: 0,
          status_id: 0,
          task_description: "",
          task_image: null,
          extra_categories: [],
        });

        setIsModalOpen(false); // close modal if you have one
      }
    } catch (err) {
      console.error("Error adding task:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Add Task",
        text: err.response?.data?.error || "Please try again.",
        confirmButtonColor: "#FF6767",
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem("token");

    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the task and related values.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/auth/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire("Deleted!", "Your task has been deleted.", "success");

        // Remove task from state (without refetching)
        fetchData();
        setSelectedTask(null);
        setMenuOpenFor(null);
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("Error", "Failed to delete task.", "error");
      }
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();

    if (
      !taskForm.task_title ||
      !taskForm.date ||
      !taskForm.priority_id ||
      !taskForm.status_id ||
      !taskForm.task_description
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please complete all required fields before submitting.",
        confirmButtonColor: "#FF6767",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("task_title", taskForm.task_title);
      formData.append("date", taskForm.date);
      formData.append("priority_id", taskForm.priority_id);
      formData.append("status_id", taskForm.status_id);
      formData.append("task_description", taskForm.task_description);

      if (taskForm.task_image) {
        formData.append("task_image", taskForm.task_image);
      }

      // Append categories as JSON
      formData.append(
        "extra_categories",
        JSON.stringify(taskForm.extra_categories),
      );

      const res = await axios.put(
        `http://localhost:3000/auth/edit-tasks/${editId}`, // 👈 Task ID for editing
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Task Updated Successfully!",
          confirmButtonColor: "#FF6767",
        });

        fetchData(); // Refresh tasks
        setSelectedTask(null);
        setIsModalOpen(false); // Close modal
        setTaskForm({
          task_title: "",
          date: "",
          priority_id: 0,
          status_id: 0,
          task_description: "",
          task_image: null,
          extra_categories: [],
        });
      }
    } catch (err) {
      console.error("Error editing task:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Edit Task",
        text: err.response?.data?.error || "Please try again.",
        confirmButtonColor: "#FF6767",
      });
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
        <button className="mt-2 group flex items-center h-[8%] space-x-4 w-full rounded-xl px-4 py-2 bg-white text-[#FF6767] transition cursor-pointer">
          <img
            src="/Dashboard/MyTask-Red.png"
            alt="mytask icon"
            className="w-[8%] h-[60%]"
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
      <div className="absolute max-w-full container mx-auto w-[65%] md:w-[65%] lg:w-[70%] mr-[4.5%] h-[83%] mb-[1.2%] right-0 bottom-0">
        <div className="absolute overflow-x-auto max-w-full px-6 py-4 border-2 border-gray-300 shadow-2xl container mx-auto w-[35%] md:w-[35%] lg:w-[40%] h-[100%] rounded-2xl bg-white left-0 bottom-0">
          <div className="mb-4">
            <p className="relative inline-block font-semibold font-black-600 text-lg">
              My Tasks
              <span className="absolute left-0 bottom-[-1px] w-[40%] border-b-3 border-[#F24E1E]"></span>
            </p>
          </div>
          <div className="space-y-4 max-h-[70vh] pr-2">
            {tasks.length === 0 ? (
              <p className="text-gray-400 text-center text-sm mt-6">
                No tasks yet. Click{" "}
                <span className="text-[#FF6767] font-semibold">Add task</span>{" "}
                to create one.
              </p>
            ) : (
              (() => {
                const today = new Date();
                const localToday = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                );

                return (
                  <>
                    {/* --- Today Tasks --- */}
                    {tasks.map((task) => {
                      const priority =
                        priorities.find((p) => p.id === task.priority) || {};
                      const status =
                        statuses.find((s) => s.id === task.status) || {};

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`relative w-full h-35 border border-gray-200 rounded-xl p-2 flex flex-col justify-between shadow-sm transition cursor-pointer 
                ${selectedTask?.id === task.id ? "bg-gray-100 border-gray-400" : "bg-white hover:shadow-md"}
              `}
                        >
                          {/* TOP SECTION (Title + Description + Image) */}
                          <div className="flex justify-between items-center h-[80%] w-full">
                            {/* LEFT SIDE - Title + Description */}
                            <div className="w-[70%] pr-4 flex flex-col justify-start items-start self-start">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className="w-3 h-3 rounded-full border-2 bg-transparent flex-shrink-0"
                                  style={{
                                    borderColor:
                                      priority.priority_color || "#ccc",
                                  }}
                                ></span>
                                <h3 className="text-md font-bold text-gray-800 truncate">
                                  {task.task_title}
                                </h3>
                              </div>

                              <p className="text-[11px] text-gray-500 line-clamp-2 break-words whitespace-pre-line">
                                {task.task_description}
                              </p>
                            </div>

                            {/* RIGHT SIDE - Image */}
                            <div className="w-[25%] h-[80%] flex-shrink-0 flex items-center justify-end">
                              <div className="w-full h-full flex items-center justify-center">
                                {task.task_image ? (
                                  <img
                                    src={`http://localhost:3000/uploads/${task.task_image}`}
                                    alt="Task"
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-[11px] text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* BOTTOM SECTION (Priority, Status, Date) */}
                          <div className="flex flex-wrap justify-between h-[20%] text-[10px] text-gray-600">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">
                                Priority:
                              </span>
                              <span
                                style={{
                                  color: priority.priority_color || "#666",
                                }}
                              >
                                {priority.priority_name || "—"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">
                                Status:
                              </span>
                              <span
                                style={{ color: status.status_color || "#666" }}
                              >
                                {status.status_name || "—"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">
                                Created on:
                              </span>
                              <span>
                                {new Date(task.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()
            )}
          </div>
        </div>
        <div className="absolute overflow-x-auto max-w-full px-8 py-4 border-2 border-gray-300 shadow-2xl container mx-auto w-[50%] md:w-[50%] lg:w-[55%] h-[100%] rounded-2xl bg-white right-0 bottom-0">
          {selectedTask ? (
            (() => {
              const priority =
                priorities.find((p) => p.id === selectedTask.priority) || {};
              const status =
                statuses.find((s) => s.id === selectedTask.status) || {};

              const isCompleted =
                status.status_name?.toLowerCase() === "completed";

              return (
                <>
                  <div className="flex flex-col md:flex-row md:space-x-6 w-full mb-4">
  {/* LEFT SIDE - Image */}
  <div className="w-full md:w-1/3">
    <div className="w-full h-48 md:h-full flex items-center justify-center">
      {selectedTask?.task_image ? (
        <img
          src={`http://localhost:3000/uploads/${selectedTask.task_image}`}
          alt="Task"
          className="w-full h-full object-cover rounded-2xl"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-[11px] text-gray-400">
          No Image
        </div>
      )}
    </div>
  </div>

  {/* RIGHT SIDE - Details */}
  <div className="flex flex-col justify-between w-full md:w-2/3 mt-3 md:mt-0">
    <h3 className="text-xl font-bold text-gray-800 truncate mb-2">
      {selectedTask?.task_title}
    </h3>

    <div className="text-gray-600 text-sm space-y-2">
      <p>
        <span className="font-medium">Priority:</span>{" "}
        <span style={{ color: priority.priority_color }}>
          {priority.priority_name || "—"}
        </span>
      </p>

      <p>
        <span className="font-medium">Status:</span>{" "}
        <span style={{ color: status.status_color }}>
          {status.status_name || "—"}
        </span>
      </p>

      {selectedTask?.category_values?.length > 0 && (
        <div>
          {selectedTask.category_values.map((cat, index) => (
            <p key={index}>
              <span className="font-medium">{cat.category_name}:</span>{" "}
              <span style={{ color: cat.value_color }}>{cat.value_name}</span>
            </p>
          ))}
        </div>
      )}

      <p>
        <span className="font-medium">Created on:</span>{" "}
        <span>{new Date(selectedTask?.date).toLocaleDateString()}</span>
      </p>
    </div>
  </div>
</div>

{/* DESCRIPTION */}
<div className="text-gray-700 text-sm mt-3 whitespace-pre-line">
  {selectedTask?.task_description}
</div>

                  {!isCompleted ? (
                    // 🔸 If NOT completed — show Edit button + anything else you want
                    <div className="flex justify-start space-x-2 absolute bottom-2 right-4">
                      <button
                        type="button"
                        onClick={() => {
                          handleEdit(selectedTask, "edit-task");
                        }}
                        className="bg-[#F24E1E] text-white px-2 py-2 rounded-md hover:opacity-90 cursor-pointer flex items-center justify-center"
                      >
                        <img
                          src="/Category/Edit.png"
                          alt="Edit"
                          className="w-4 h-4"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleDeleteTask(selectedTask.id);
                        }}
                        className="bg-[#F24E1E] text-white px-2 py-2 rounded-md hover:opacity-90 cursor-pointer flex items-center justify-center"
                      >
                        <img
                          src="/Category/Delete.png"
                          alt="Edit"
                          className="w-4 h-4"
                        />
                      </button>
                    </div>
                  ) : (
                    // ✅ If completed — show message or disabled state
                    <div className="absolute bottom-2 right-4 flex items-center space-x-3 text-xs text-gray-600">
                      {/* ✅ Completed Date Text */}
                      <p className="italic">
                        Task completed on:{" "}
                        <span className="text-gray-800 font-medium">
                          {selectedTask.completedOn
                            ? new Date(
                                selectedTask.completedOn,
                              ).toLocaleString()
                            : "—"}
                        </span>
                      </p>

                      {/* 🗑️ Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          handleDeleteTask(selectedTask.id);
                        }}
                        className="bg-[#F24E1E] text-white px-2 py-2 rounded-md hover:opacity-90 cursor-pointer flex items-center justify-center shadow-md transition"
                      >
                        <img
                          src="/Category/Delete.png"
                          alt="Delete"
                          className="w-4 h-4"
                        />
                      </button>
                    </div>
                  )}
                </>
              );
            })()
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a task to see details
            </div>
          )}
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

                  <form
                    className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 mb-[1.2%] bg-white w-[87%] h-[80%]"
                    onSubmit={handleAddTask}
                  >
                    <div
                      className="absolute overflow-x-auto max-w-full px-4 py-4 border-1 border-gray-300 shadow-2xl 
               bg-white w-[100%] h-[85%]"
                    >
                      <div className="mb-8 h-[12%] w-[60%] relative">
                        <label
                          htmlFor="task_title"
                          className="block text-black-700 font-semibold text-sm mb-1"
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[90%] text-xs"
                          style={{
                            paddingLeft: "2.5%", // make space for the background icon
                          }}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              task_title: e.target.value,
                            })
                          }
                          id="task_title"
                          name="task_title"
                        />
                      </div>

                      <div className="mb-8 h-[12%] w-[60%] relative overflow-visible">
                        <label
                          htmlFor="date"
                          className="block text-black font-semibold text-sm mb-1"
                        >
                          Date
                        </label>

                        <div className="relative h-full">
                          <input
                            type="text"
                            id="date"
                            name="date"
                            readOnly
                            value={taskForm.date}
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="w-full px-[3%] py-[2%] border-2 rounded-md border-gray-300 h-[90%] text-xs cursor-pointer"
                          />

                          {/* Calendar Icon */}
                          <img
                            src="/DashboardMenu/Date.png"
                            alt="calendar icon"
                            className="absolute right-[3%] top-[25%] w-[4%] h-[4%] min-w-[16px] min-h-[16px] cursor-pointer"
                            onClick={() => setShowCalendar(!showCalendar)}
                          />

                          {/* Calendar Popup */}
                          {showCalendar && (
                            <div className="absolute z-50 left-0 top-full mt-[1%] bg-white shadow-2xl p-2 rounded-md border border-gray-200">
                              <Calendar
                                onChange={(value) => {
                                  const localDate = new Date(
                                    value.getTime() -
                                      value.getTimezoneOffset() * 60000,
                                  )
                                    .toISOString()
                                    .split("T")[0];

                                  setTaskForm({ ...taskForm, date: localDate });
                                  setShowCalendar(false);
                                }}
                                value={
                                  taskForm.date
                                    ? new Date(taskForm.date)
                                    : new Date()
                                }
                                className="rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-2 h-[12%] w-[100%]">
                        <label className="block text-black font-semibold text-sm mb-1">
                          Priority
                        </label>
                        <div className="flex flex-wrap space-x-6">
                          {priorities.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-1"
                            >
                              {/* colored dot */}
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.priority_color }}
                              ></span>

                              {/* priority name */}
                              <span className="text-gray-500 text-sm">
                                {item.priority_name}
                              </span>

                              {/* checkbox */}
                              <input
                                type="checkbox"
                                checked={taskForm.priority_id === item.id}
                                onChange={() =>
                                  setTaskForm({
                                    ...taskForm,
                                    priority_id:
                                      taskForm.priority_id === item.id
                                        ? null
                                        : item.id,
                                  })
                                }
                                className="ml-1 accent-current border-gray-300 rounded-none focus:ring-0 outline-none cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      {categories.map((category) => (
                        <div key={category.id} className="mb-2">
                          {/* Category name */}
                          <label className="block text-black font-semibold text-sm mb-1">
                            {category.category_name}
                          </label>

                          <div className="flex flex-wrap space-x-6">
                            {(categoryValues[category.id] || []).map(
                              (value) => {
                                const selected = taskForm.extra_categories.some(
                                  (c) =>
                                    c.category_id === category.id &&
                                    c.value_id === value.id,
                                );

                                return (
                                  <div
                                    key={value.id}
                                    className="flex items-center space-x-1"
                                  >
                                    {/* colored dot */}
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor: value.value_color,
                                      }}
                                    ></span>

                                    {/* gray text */}
                                    <span className="text-gray-500 text-sm">
                                      {value.value_name}
                                    </span>

                                    {/* checkbox (only one per category) */}
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={() =>
                                        setTaskForm((prev) => {
                                          const alreadySelected =
                                            prev.extra_categories.some(
                                              (c) =>
                                                c.category_id === category.id &&
                                                c.value_id === value.id,
                                            );

                                          // Remove existing if selected, otherwise replace previous selection in the same category
                                          const updated = alreadySelected
                                            ? prev.extra_categories.filter(
                                                (c) =>
                                                  c.category_id !== category.id,
                                              )
                                            : [
                                                ...prev.extra_categories.filter(
                                                  (c) =>
                                                    c.category_id !==
                                                    category.id,
                                                ),
                                                {
                                                  category_id: category.id,
                                                  category_name:
                                                    category.category_name, // ✅ add category_name
                                                  value_id: value.id,
                                                  value_name: value.value_name,
                                                  value_color:
                                                    value.value_color,
                                                },
                                              ];

                                          return {
                                            ...prev,
                                            extra_categories: updated,
                                          };
                                        })
                                      }
                                      className="ml-1 accent-current border-gray-300 rounded-none focus:ring-0 outline-none cursor-pointer"
                                    />
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex space-x-10 mt-4 w-[100%]">
                        {/* Task Description */}
                        <div className="w-[60.75%]">
                          <label className="block text-black font-semibold text-sm mb-1">
                            Task Description
                          </label>
                          <textarea
                            id="task_description"
                            name="task_description"
                            placeholder="Start writing here..."
                            value={taskForm.task_description}
                            onChange={(e) =>
                              setTaskForm({
                                ...taskForm,
                                task_description: e.target.value,
                              })
                            }
                            className="w-full h-[200px] border-2 border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:border-black resize-none"
                          />
                        </div>

                        {/* Upload Image */}
                        <div className="w-[34%] flex flex-col items-center">
                          <label className="block text-black font-semibold text-sm mb-1 self-start">
                            Upload Image
                          </label>

                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            className={`w-full h-[200px] border-2 rounded-md flex flex-col items-center justify-center cursor-pointer transition 
            ${
              dragActive ? "border-[#FF6767] bg-[#FFF5F5]" : "border-gray-300"
            }`}
                          >
                            {taskForm.task_image ? (
                              <div className="flex flex-col items-center">
                                <img
                                  src={URL.createObjectURL(taskForm.task_image)}
                                  alt="Preview"
                                  className="w-[100px] h-[100px] object-cover rounded-md mb-2"
                                />
                                <button
                                  onClick={() =>
                                    setTaskForm({
                                      ...taskForm,
                                      task_image: null,
                                    })
                                  }
                                  className="text-gray-600 text-sm font-semibold cursor-pointer mt-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <>
                                <img
                                  src="/DashboardMenu/Dropbox.png"
                                  alt="Upload icon"
                                  className="w-10 h-10 opacity-60 mb-2"
                                />
                                <p className="text-gray-400 text-xs mb-1">
                                  Drag & Drop files here
                                </p>
                                <p className="text-gray-400 text-xs">or</p>
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current.click()}
                                  className="text-gray-600 text-sm font-semibold cursor-pointer mt-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                >
                                  Browse
                                </button>
                                <input
                                  ref={fileInputRef} // 👈 attach ref here
                                  id="file-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageChange}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start space-x-3 absolute bottom-0 left-4">
                      <button
                        type="submit"
                        className="bg-[#F24E1E] text-white px-6 py-2 rounded-md hover:opacity-90 transition cursor-pointer"
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setTaskForm({
                            task_title: "",
                            date: "",
                            priority_id: 0,
                            status_id: 0,
                            task_description: "",
                            task_image: null, // reset image, user can upload new one
                            extra_categories: [],
                          });
                        }}
                        className="bg-[#F24E1E] text-white px-4 py-2 rounded-md hover:opacity-90 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
              {modalType === "edit-task" && (
                <>
                  <h2 className="relative inline-block text-xl font-semibold text-black-600">
                    Edit Task
                    <span className="absolute left-0 bottom-[-1px] w-[90%] border-b-3 border-[#F24E1E]"></span>
                  </h2>

                  <form
                    className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 mb-[1.2%] bg-white w-[87%] h-[80%]"
                    onSubmit={handleEditTask}
                  >
                    <div
                      className="absolute overflow-x-auto max-w-full px-4 py-4 border-1 border-gray-300 shadow-2xl 
               bg-white w-[100%] h-[85%]"
                    >
                      <div className="mb-8 h-[12%] w-[60%] relative">
                        <label
                          htmlFor="task_title"
                          className="block text-black-700 font-semibold text-sm mb-1"
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border-2 rounded-md border-gray-300 h-[90%] text-xs"
                          style={{
                            paddingLeft: "2.5%", // make space for the background icon
                          }}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              task_title: e.target.value,
                            })
                          }
                          defaultValue={formData?.task_title || ""}
                          id="task_title"
                          name="task_title"
                        />
                      </div>

                      <div className="mb-8 h-[12%] w-[60%] relative overflow-visible">
                        <label
                          htmlFor="date"
                          className="block text-black font-semibold text-sm mb-1"
                        >
                          Date
                        </label>

                        <div className="relative h-full">
                          <input
                            type="text"
                            id="date"
                            name="date"
                            readOnly
                            onClick={() => setShowCalendar(!showCalendar)}
                            value={
                              formData?.date
                                ? new Date(formData.date).toLocaleDateString(
                                    "en-CA",
                                  ) // keeps YYYY-MM-DD format but localized
                                : ""
                            }
                            className="w-full px-[3%] py-[2%] border-2 rounded-md border-gray-300 h-[90%] text-xs cursor-pointer"
                          />

                          {/* Calendar Icon */}
                          <img
                            src="/DashboardMenu/Date.png"
                            alt="calendar icon"
                            className="absolute right-[3%] top-[25%] w-[4%] h-[4%] min-w-[16px] min-h-[16px] cursor-pointer"
                            onClick={() => setShowCalendar(!showCalendar)}
                          />

                          {/* Calendar Popup */}
                          {showCalendar && (
                            <div className="absolute z-50 left-0 top-full mt-[1%] bg-white shadow-2xl p-2 rounded-md border border-gray-200">
                              <Calendar
                                onChange={(value) => {
                                  const localDate = new Date(
                                    value.getTime() -
                                      value.getTimezoneOffset() * 60000,
                                  )
                                    .toISOString()
                                    .split("T")[0];

                                  setTaskForm({ ...taskForm, date: localDate });
                                  setShowCalendar(false);
                                }}
                                value={
                                  taskForm.date
                                    ? new Date(taskForm.date)
                                    : new Date()
                                }
                                className="rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-2 h-[12%] w-[100%]">
                        <label className="block text-black font-semibold text-sm mb-1">
                          Priority
                        </label>
                        <div className="flex flex-wrap space-x-6">
                          {priorities.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-1"
                            >
                              {/* colored dot */}
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.priority_color }}
                              ></span>

                              {/* priority name */}
                              <span className="text-gray-500 text-sm">
                                {item.priority_name}
                              </span>

                              {/* checkbox */}
                              <input
                                type="checkbox"
                                checked={taskForm.priority_id === item.id}
                                onChange={() =>
                                  setTaskForm({
                                    ...taskForm,
                                    priority_id:
                                      taskForm.priority_id === item.id
                                        ? null
                                        : item.id,
                                  })
                                }
                                className="ml-1 accent-current border-gray-300 rounded-none focus:ring-0 outline-none cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mb-2 h-[12%] w-[100%]">
                        <label className="block text-black font-semibold text-sm mb-1">
                          Status
                        </label>
                        <div className="flex flex-wrap space-x-6">
                          {statuses.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-1"
                            >
                              {/* colored dot */}
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.status_color }}
                              ></span>

                              {/* status name */}
                              <span className="text-gray-500 text-sm">
                                {item.status_name}
                              </span>

                              {/* checkbox */}
                              <input
                                type="checkbox"
                                checked={taskForm.status_id === item.id}
                                onChange={() =>
                                  setTaskForm({
                                    ...taskForm,
                                    status_id:
                                      taskForm.status_id === item.id
                                        ? null
                                        : item.id,
                                  })
                                }
                                className="ml-1 accent-current border-gray-300 rounded-none focus:ring-0 outline-none cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      {categories.map((category) => (
                        <div key={category.id} className="mb-2">
                          {/* Category name */}
                          <label className="block text-black font-semibold text-sm mb-1">
                            {category.category_name}
                          </label>

                          <div className="flex flex-wrap space-x-6">
                            {(categoryValues[category.id] || []).map(
                              (value) => {
                                const selected = taskForm.extra_categories.some(
                                  (c) =>
                                    c.category_id === category.id &&
                                    c.value_id === value.id,
                                );

                                return (
                                  <div
                                    key={value.id}
                                    className="flex items-center space-x-1"
                                  >
                                    {/* colored dot */}
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor: value.value_color,
                                      }}
                                    ></span>

                                    {/* gray text */}
                                    <span className="text-gray-500 text-sm">
                                      {value.value_name}
                                    </span>

                                    {/* checkbox (only one per category) */}
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={() =>
                                        setTaskForm((prev) => {
                                          const alreadySelected =
                                            prev.extra_categories.some(
                                              (c) =>
                                                c.category_id === category.id &&
                                                c.value_id === value.id,
                                            );

                                          // Remove existing if selected, otherwise replace previous selection in the same category
                                          const updated = alreadySelected
                                            ? prev.extra_categories.filter(
                                                (c) =>
                                                  c.category_id !== category.id,
                                              )
                                            : [
                                                ...prev.extra_categories.filter(
                                                  (c) =>
                                                    c.category_id !==
                                                    category.id,
                                                ),
                                                {
                                                  category_id: category.id,
                                                  category_name:
                                                    category.category_name, // ✅ add category_name
                                                  value_id: value.id,
                                                  value_name: value.value_name,
                                                  value_color:
                                                    value.value_color,
                                                },
                                              ];

                                          return {
                                            ...prev,
                                            extra_categories: updated,
                                          };
                                        })
                                      }
                                      className="ml-1 accent-current border-gray-300 rounded-none focus:ring-0 outline-none cursor-pointer"
                                    />
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex space-x-10 mt-4 w-[100%]">
                        {/* Task Description */}
                        <div className="w-[60.75%]">
                          <label className="block text-black font-semibold text-sm mb-1">
                            Task Description
                          </label>
                          <textarea
                            id="task_description"
                            name="task_description"
                            placeholder="Start writing here..."
                            defaultValue={formData?.task_description}
                            onChange={(e) =>
                              setTaskForm({
                                ...taskForm,
                                task_description: e.target.value,
                              })
                            }
                            className="w-full h-[200px] border-2 border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:border-black resize-none"
                          />
                        </div>

                        {/* Upload Image */}
                        <div className="w-[34%] flex flex-col items-center">
                          <label className="block text-black font-semibold text-sm mb-1 self-start">
                            Upload Image
                          </label>

                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            className={`w-full h-[200px] border-2 rounded-md flex flex-col items-center justify-center cursor-pointer transition 
            ${
              dragActive ? "border-[#FF6767] bg-[#FFF5F5]" : "border-gray-300"
            }`}
                          >
                            {taskForm.task_image ? (
                              <div className="flex flex-col items-center">
                                <img
                                  src={URL.createObjectURL(taskForm.task_image)}
                                  alt="Preview"
                                  className="w-[100px] h-[100px] object-cover rounded-md mb-2"
                                />
                                <button
                                  onClick={() =>
                                    setTaskForm({
                                      ...taskForm,
                                      task_image: null,
                                    })
                                  }
                                  className="text-gray-600 text-sm font-semibold cursor-pointer mt-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <>
                                <img
                                  src="/DashboardMenu/Dropbox.png"
                                  alt="Upload icon"
                                  className="w-10 h-10 opacity-60 mb-2"
                                />
                                <p className="text-gray-400 text-xs mb-1">
                                  Drag & Drop files here
                                </p>
                                <p className="text-gray-400 text-xs">or</p>
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current.click()}
                                  className="text-gray-600 text-sm font-semibold cursor-pointer mt-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                >
                                  Browse
                                </button>
                                <input
                                  ref={fileInputRef} // 👈 attach ref here
                                  id="file-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageChange}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start space-x-3 absolute bottom-0 left-4">
                      <button
                        type="submit"
                        className="bg-[#F24E1E] text-white px-6 py-2 rounded-md hover:opacity-90 transition cursor-pointer"
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setTaskForm({
                            task_title: "",
                            date: "",
                            priority_id: 0,
                            status_id: 0,
                            task_description: "",
                            task_image: null, // reset image, user can upload new one
                            extra_categories: [],
                          });
                        }}
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

export default MyTask;