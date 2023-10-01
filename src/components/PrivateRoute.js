import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from 'contexts/AuthContext'

export default function PrivateRoute({ Component, allowedRoles = [] }) {
    const { isAuth, user } = useAuthContext()
    const location = useLocation()

    const accessedRole = allowedRoles.some((role) => user.roles.includes(role));

    if (!isAuth)
        return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />

    if (!allowedRoles.length || accessedRole)
        return (
            <Component />
        )

    return (
        <h1>You don't have access to see this page.</h1>
    )
}
