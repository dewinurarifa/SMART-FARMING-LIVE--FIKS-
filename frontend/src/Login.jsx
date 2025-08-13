import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // bisa email atau username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin") {
      localStorage.setItem("role", "admin");
      localStorage.setItem("token", "admin-token");
      navigate("/kmeans");
    } else if (username === "petani" && password === "123456") {
      localStorage.setItem("role", "petani");
      localStorage.setItem("token", "petani-token");
      navigate("/home");
    } else {
      setError("Username atau Password salah");
    }
  };

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-tr from-[#8b8edc] via-[#b7b9e9] to-[#d9d9f3]">
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 sm:p-12 overflow-hidden">
        {/* Gradient Blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-tr from-[#7B8BD4] to-[#4F6BED] rounded-full filter blur-3xl opacity-40 animate-blob"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-[#B7B9E9] to-[#8B8EDC] rounded-full filter blur-3xl opacity-30 animate-blob"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          aria-hidden="true"
          className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-tr from-[#D9D9F3] to-[#B7B9E9] rounded-full filter blur-2xl opacity-50 animate-blob"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-[#4F6BED] mb-8 relative z-10 text-center">
          Welcome Back
        </h1>

        {/* Form */}
        <form onSubmit={handleLogin} className="relative z-10 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#7B8BD4] mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin atau petani"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B8BD4] focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#7B8BD4] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B8BD4] focus:border-transparent transition"
            />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-[#7B8BD4] hover:bg-[#6a7ac1] text-white font-semibold py-3 rounded-xl shadow-lg transition focus:outline-none focus:ring-4 focus:ring-[#4F6BED]"
          >
            Sign In
          </button>
        </form>

        {/* Sign up */}
        <p className="mt-8 text-center text-sm text-[#7B8BD4] relative z-10">
          Don't have an account?{" "}
          <a href="#" className="text-[#4F6BED] font-semibold hover:underline">
            Sign up
          </a>
        </p>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
