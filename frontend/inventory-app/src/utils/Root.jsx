import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'



const Root = () => {
    const {user} = useAuth()
    const navigate = useNavigate()

    useEffect(()=>{
        if(user){
            if(user.role === "admin"){
                navigate("/admin-dashboard")
            }else if(user.role === "boardMember"){
                navigate("/boardMember-dashboard")
            }else if(user.role === "member"){
                navigate("/member-dashboard")
            }else{
                navigate("/login")
            }
        }else{
            navigate("/login")
        }
    },[user, navigate])
  return null
}

export default Root



