import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Dashboard from './Components/Dashboard/Dashboard.jsx'
import Register from './Components/Register/Register.jsx'
import Login from './Components/Login/Login.jsx'

function App() {

  return (
    <BrowserRouter>
     <Routes>
      <Route path='/' element={<Dashboard/>}></Route>
      <Route path='/register' element={<Register/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
     </Routes>
    </BrowserRouter>
  )
}

export default App
