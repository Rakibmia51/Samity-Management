import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const {login} = useAuth()

    const handleSubmit = async(e) =>{
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const response = await axios.post(`http://localhost:3000/api/auth/login`,
                {email, password}
            )
            if(response.data.success){
                await login(response.data.user, response.data.token)
                if(response.data.user.role === "admin"){
                    navigate("/admin-dashboard");

                }else if(response.data.user.role === "boardMember"){
                    navigate("/boardMember-dashboard");
                }else if(response.data.user.role === "member"){
                    navigate("/member-dashboard");
                }else{
                    setError(response.data.message)
                }
            }
        } catch (error) {
            if(error.response){
                setError(error.response.data.message)
            }else{
                setError("Server Error")
            }
        }finally{
            setLoading(false)
        }
    }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        {/* --- Background Elements Starts --- */}
        {/* ১. বড় নীল সার্কেল (Animated) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>

        {/* ২. বড় বেগুনি সার্কেল (Animated) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-bounce duration-[10000ms]"></div>

        {/* ৩. গ্রিড প্যাটার্ন (Optional: আরও প্রফেশনাল লুকের জন্য) */}
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com')] opacity-10"></div>
        {/* --- Background Elements Ends --- */}

        <div className="relative z-10 w-full max-w-md px-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-white tracking-tight">
                    Invest<span className="text-blue-500">Smart</span>
                </h2>
                <p className="text-slate-400 mt-2 text-sm">Secure Your Future with Ease</p>
            </div>

                {/* Glassmorphic Login Card */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Login</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                            <input 
                            type="email" 
                            placeholder='Enter your email'
                            className="w-full mt-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                            onChange={(e)=>setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                            <input 
                            type="password"
                            placeholder='••••••••'
                            className="w-full mt-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                            onChange={(e)=>setPassword(e.target.value)} 
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 mb-4 transition-all duration-300">
                            <div className="bg-red-500 rounded-full p-1">
                            <svg xmlns="http://w3.org" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            </div>
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <button 
                        type='submit'
                        disabled={loading} // লোডিং অবস্থায় বাটন ডিজেবল থাকবে
                        className={`w-full mt-4 flex items-center justify-center gap-3 font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg ${
                            loading 
                            ? 'bg-blue-800 cursor-not-allowed opacity-80' 
                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 active:scale-[0.98]'
                        } text-white`}
                        >
                        {loading ? (
                            <>
                            {/* লোডিং স্পিনার আইকন */}
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Processing...</span>
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-xs font-medium tracking-widest text-slate-500 uppercase italic">
                            Powered by <span className="text-blue-500/80 font-bold not-italic">NextBarta</span> 
                            <span className="mx-2 text-slate-700">|</span> 
                            <span className="text-slate-400">Rakib mia</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>

  )
}

export default Login