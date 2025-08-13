import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { X, Thermometer, MapPin, Droplet, TestTube } from "lucide-react";
import strawbery from "./assets/strawbery.jpg";

// Komponen loading spinner
const Spinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin h-6 w-6 border-4 border-[#7B8BD4] border-t-transparent rounded-full" />
  </div>
);

const KMeans = () => {
  const location = useLocation();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const [imageData, setImageData] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/elbow")
      .then(res => {
        if (res.data.image) {
          setImageData(res.data.image);
          setError("");
          setShowError(false);
        } else {
          setError("Gambar tidak ditemukan di respons.");
          setShowError(true);
        }
      })
      .catch(() => {
        setError("Gagal mengambil data dari server.");
        setShowError(true);
      });

    axios.get("http://localhost:5000/api/data")
      .then(res => {
        const latest = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        setLatestData(latest);
      })
      .catch(err => console.error("Gagal ambil data sensor:", err))
      .finally(() => setLoading(false));
  }, []);

  const formattedDate = latestData
    ? `${new Date(latestData.created_at).toLocaleDateString("id-ID", { weekday: "long" })}, ${String(new Date(latestData.created_at).getDate()).padStart(2, "0")}-${String(new Date(latestData.created_at).getMonth() + 1).padStart(2, "0")}-${new Date(latestData.created_at).getFullYear()}`
    : "";

  return (
    <div className="bg-[#F9FAFF] min-h-screen flex justify-center items-start px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4 sm:p-6">

        {/* NAVBAR */}
        <header className="flex flex-wrap justify-center sm:justify-between items-center gap-4 mb-6">
          <nav className="flex flex-wrap justify-center space-x-6">
            {role !== "admin" && (
              <Link
                to="/home"
                className={`text-sm sm:text-base font-semibold ${location.pathname === "/home" ? "font-bold text-[#7B8BD4]" : "text-[#A3A9D1]"}`}
              >
                Home
              </Link>
            )}
            {role === "admin" && (
              <>
                <Link
                  to="/kmeans"
                  className={`text-sm sm:text-base font-semibold ${location.pathname === "/kmeans" ? "font-bold text-[#7B8BD4]" : "text-[#A3A9D1]"}`}
                >
                  K-Means
                </Link>
                <Link
                  to="/akurasi"
                  className={`text-sm sm:text-base font-semibold ${location.pathname === "/akurasi" ? "font-bold text-[#7B8BD4]" : "text-[#A3A9D1]"}`}
                >
                  Akurasi
                </Link>
              </>
            )}
            <button onClick={handleLogout} className="text-red-500 font-semibold ml-4">
              Logout
            </button>
          </nav>
        </header>

        {/* HERO SECTION */}
        <section className="relative rounded-xl overflow-hidden bg-gradient-to-tr from-[#8B8EDC] via-[#B7B9E9] to-[#D9D9F3] p-6 h-52 sm:h-56 md:h-64 lg:h-72 mb-4">
          <img src={strawbery} alt="Greenhouse" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="relative z-10 flex items-center space-x-4 text-white">
            <Thermometer className="w-10 h-10" />
            <div>
              {loading ? (
                <Spinner />
              ) : (
                <>
                  <span className="text-4xl sm:text-5xl font-light">{latestData?.temperature}°</span>
                  <div className="text-xs sm:text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Greenhouse, Farm
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="absolute bottom-4 right-6 text-white text-[10px] sm:text-xs">
            {loading ? <Spinner /> : formattedDate}
          </div>
        </section>

        {/* SENSOR INFO */}
        <section className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          {["humidity", "ph", "temperature"].map((type, idx) => {
            const Icon = type === "humidity" ? Droplet : type === "ph" ? TestTube : Thermometer;
            const label = type === "humidity" ? "Soil Humidity" : type === "ph" ? "Soil pH" : "Temperature";
            const value = type === "humidity" ? `${latestData?.humidity}%` : type === "ph" ? latestData?.ph : `${latestData?.temperature}°C`;

            return (
              <div key={idx} className="flex items-center bg-[#7B8BD4] text-white rounded-xl px-4 py-3 flex-1">
                <Icon className="w-6 h-6 mr-3" />
                {loading ? <Spinner /> : (
                  <div className="text-sm">
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs">{value}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* ERROR MESSAGE */}
        {showError && error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg shadow-inner relative">
            <button
              onClick={() => setShowError(false)}
              className="absolute top-2 right-2 hover:text-red-900"
              aria-label="Close error message"
            >
              <X className="w-5 h-5" />
            </button>
            {error}
          </div>
        )}

        {/* TITLE & IMAGE */}
        <section className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#4F6BED] mb-2">Visualisasi Clustering Smart Farming</h2>
          <p className="text-[#7B8BD4] max-w-3xl mx-auto text-sm sm:text-base leading-relaxed">
            Gambar berikut menampilkan hasil <strong>Clustering Suhu Tanaman</strong>,{" "}
            <strong>Pemetaan Lingkungan berdasarkan pH &amp; Kelembaban</strong>, serta{" "}
            <strong>Elbow Method</strong> untuk menentukan jumlah klaster optimal.
          </p>
        </section>

        {/* IMAGE */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <div className="space-y-10">
            <img
              src={`data:image/png;base64,${imageData}`}
              alt="Visualisasi Clustering"
              className="w-full max-w-4xl rounded-xl shadow-lg border border-gray-300 mx-auto transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default KMeans;
