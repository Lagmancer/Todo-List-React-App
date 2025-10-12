import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'

const Register = () => {
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    firstname: '',
    lastname: '',
  })

  const [cpass, setCPass] = useState({
    cpassword: '',
  })
  const [agree, setAgree] = useState(false) // ✅ track checkbox
  const navigate = useNavigate()

  // Handle input change
  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleChanges2 = (e) => {
    setCPass({ ...cpass, [e.target.name]: e.target.value })
  }

  // Simple email validation regex
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. Check if passwords match
    if (values.password !== cpass.cpassword) {
      Swal.fire({
        icon: 'error',
        title: 'Mismatch Passwords',
        confirmButtonColor: "#FF6767",
        text: 'Passwords do not match!',
      })
      return
    }

    // 2. Check if email is valid
    if (!validateEmail(values.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        confirmButtonColor: "#FF6767",
        text: 'Please enter a valid email address',
      })
      return
    }
    
    // 3. ✅ Check terms
    if (!agree) {
        return Swal.fire({
          icon: 'warning',
          title: 'Terms Not Accepted',
          confirmButtonColor: "#FF6767",
          text: 'You must agree to the terms before creating an account.',
        })
      }

    try {
      // 4. Send request to backend
      const response = await axios.post('http://localhost:3000/auth/register', values)

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Account Created',
          confirmButtonColor: "#FF6767",
          text: 'Successfully created an account!',
        }).then(() => {
          navigate('/login') // redirect after OK
        })
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        confirmButtonColor: "#FF6767",
        text: err.response?.data?.message || 'Something went wrong, account creation failed',
      })
    }
  }

  return (
    <div className="m-0 p-0 h-screen w-screen flex justify-center items-center h-screen bg-cover bg-center bg-[url('/Register/Background.png')]" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <div className = "w-1/2 relative h-screen flex items-end">
        <img className = "mr-[50%] w-[70%] h-[90%] object-contain" src={"/Register/Image.png"} alt="Image" />
      </div>
      <div className='w-1/2 px-12 py-5 h-screen'>
        <h2 className='font-montserrat text-4xl font-bold mb-8 mt-6'>Sign Up</h2>
        <form className="h-[80%]" onSubmit={handleSubmit}>
          <div className="mb-2 h-[12.5%] relative">
            <img
              src="/Register/FirstName.png"
              alt="First Name Icon"
              className="absolute left-[2.5%] center top-[40%] transform -translate-y-1/2 
               w-[5%] h-[50%] object-contain pointer-events-none"
            />
            <input type="text" placeholder='Enter First Name' className='input-firstname w-full px-3 py-2 border rounded-md border-gray-500 h-[80%] text-xs'
              style={{
                paddingLeft: '12.5%' // make space for the background icon
              }}
              name="firstname" onChange={handleChanges} />
          </div>
          <div className="mb-2 h-[12.5%] relative">
            <img
              src="/Register/LastName.png"
              alt="Last Name Icon"
              className="absolute left-[2.5%] center top-[40%] transform -translate-y-1/2 
               w-[5%] h-[50%] object-contain pointer-events-none"
            />
            <input type="text" placeholder='Enter Last Name' className='w-full px-3 py-2 border rounded-md border-gray-500 h-[80%] text-xs'
              style={{
                paddingLeft: '12.5%' // make space for the background icon
              }}
              name="lastname" onChange={handleChanges} />
          </div>
          <div className="mb-2 h-[12.5%] relative">
            <img
              src="/Register/UserName.png"
              alt="Username Icon"
              className="absolute left-[2.5%] center top-[40%] transform -translate-y-1/2 
               w-[5%] h-[50%] object-contain pointer-events-none"
            />
            <input type="text" placeholder='Enter Username' className='w-full px-3 py-2 border rounded-md border-gray-500 h-[80%] text-xs'
              style={{
                paddingLeft: '12.5%' // make space for the background icon
              }}
              name="username" onChange={handleChanges} />
          </div>
          <div className="mb-2 h-[12.5%] relative">
            <img
              src="/Register/Email.png"
              alt="Email Icon"
              className="absolute left-[2.5%] center top-[40%] transform -translate-y-1/2 
               w-[5%] h-[50%] object-contain pointer-events-none"
            />
            <input type="email" placeholder='Enter Email' className='w-full px-3 py-2 border rounded-md border-gray-500 h-[80%] text-xs'
              style={{
                paddingLeft: '12.5%' // make space for the background icon
              }}
              name="email" onChange={handleChanges} />
          </div>
          <div className="mb-2 h-[12.5%] relative">
            <img
              src="/Register/Password.png"
              alt="Password Icon"
              className="absolute left-[2.5%] center top-[40%] transform -translate-y-1/2 
               w-[5%] h-[50%] object-contain pointer-events-none"
            />
            <input type="password" placeholder='Enter Password' className='w-full px-3 py-2 border rounded-md border-gray-500 h-[80%] text-xs'
              style={{
                paddingLeft: '12.5%' // make space for the background icon
              }}
              name="password" onChange={handleChanges} />
          </div>
          <div className="mb-2 h-[12.5%] relative">
            <img
              src="/Register/CPassword.png"
              alt="CPassword Icon"
              className="absolute left-[2.5%] center top-[40%] transform -translate-y-1/2 
               w-[5%] h-[50%] object-contain pointer-events-none"
            />
            <input type="password" placeholder='Confirm Password' className='w-full px-3 py-2 border rounded-md border-gray-500 h-[80%] text-xs'
              style={{
                paddingLeft: '12.5%' // make space for the background icon
              }}
              name="cpassword" onChange={handleChanges2} />
          </div>
           <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="mr-2 rounded-none w-[5%] h-[5%]"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="terms" className="text-gray-700">
              I agree to all terms
            </label>
          </div>
          <button className="w-1/4 h-[12.5%] bg-red-600 text-white py-2 border rounded-md opacity-50 hover:opacity-100 cursor-pointer transition-all duration-300">Register</button>
        </form>
        <div className="mt-8 text-sm">
          <span>Already have an account?</span>
          <Link to='/login' className='text-blue-500'> Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Register