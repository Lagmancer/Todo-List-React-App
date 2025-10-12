import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Dashboard from './Components/Dashboard/Dashboard.jsx'
import Register from './Components/Register/Register.jsx'
import Login from './Components/Login/Login.jsx'
import VitalTask from './Components/VitalTask/VitalTask.jsx'
import MyTask from './Components/MyTask/MyTask.jsx'
import TaskCategories from './Components/TaskCategories/TaskCategories.jsx'
import Settings from './Components/Settings/Settings.jsx'
import ProtectedRoute from "./Components/ProtectedRoutes.jsx";

function App() {

  return (
    <BrowserRouter>
     <Routes>
      <Route path='/' element={ 
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>}>
      </Route>
      <Route path='/register' element={<Register/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/vitaltask' element={
        <ProtectedRoute>
          <VitalTask />
        </ProtectedRoute>}>
      </Route>
      <Route path='/mytask' element={
        <ProtectedRoute>
          <MyTask />
        </ProtectedRoute>}>
      </Route>
      <Route path='/taskcategories' element={
        <ProtectedRoute>
          <TaskCategories />
        </ProtectedRoute>}>
      </Route>
      <Route path='/settings' element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>}>
      </Route>
     </Routes>
    </BrowserRouter>
  )
}

export default App
