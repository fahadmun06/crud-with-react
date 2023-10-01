import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './Home'
import UpdateTodo from './Home/UpdateTodo'
import PrivateRoute from 'components/PrivateRoute'

export default function Index() {
    return (
        <div className='dashboard'>
            <Routes>
                <Route path='/' element={<Navigate to="/dashboard/todos" />} />
                <Route path='/todos' element={<PrivateRoute Component={Home} allowedRoles={["superAdmin", "customer"]} />} />
                <Route path='/todos/:id' element={<UpdateTodo />} />
                {/* <Route path='register' element={<Register />} />
            <Route path='forgot-password' element={<ForgotPassword />} />
        <Route path='reset-password' element={<ResetPassword />} /> */}
                <Route path="*" element={<h1>404</h1>} />
            </Routes>
        </div>
    )
}