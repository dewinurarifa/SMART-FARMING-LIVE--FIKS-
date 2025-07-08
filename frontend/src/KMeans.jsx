import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  Thermometer,
  MapPin,
  Droplet,
  TestTube
} from "lucide-react";
import strawbery from "./assets/strawbery.jpg";

const Spinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin h-6 w-6 border-4 border-[#7B8BD4] border-t-transparent rounded-full" />
  </div>
);

const KMeans = () => {
  const location = useLocation();

  // ─── STATE ──────────────────────────────────────────────
  const [imageData, setImageData] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [showError, setShowError] = useState(true);

  // ─── EFFECT: GET IMAGE + LATEST SENSOR DATA ─────────────
  useEffect(() => {
    // Elbow / clustering image
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
      .catch(err => {
        console.error("Gagal mengambil Elbow plot:", err);
        setError("Gagal mengambil data dari server.");
        setShowError(true);
      });

    // Latest sensor data
    axios.get("http://localhost:5000/api/data")
      .then(res => {
        const latest = res.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        setLatestData(latest);
      })
      .catch(err => console.error("Gagal mengambil data sensor:", err))
      .finally(() => setLoading(false));
  }, []);

  // ─── FORMAT DATE ────────────────────────────────────────
  const formattedDate = latestData
    ? `${new Date(latestData.created_at).toLocaleDateString("id-ID", { weekday: "long" })}, ${String(new Date(latestData.created_at).getDate()).padStart(2, "0")}-${String(new Date(latestData.created_at).getMonth() + 1).padStart(2, "0")}-${new Date(latestData.created_at).getFullYear()}`
    : "";

  // ─── RENDER ─────────────────────────────────────────────
  return (
    <div className="bg-[#F9FAFF] min-h-screen flex justify-center items-start px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4 sm:p-6">

        {/* ── NAVBAR ─────────────────────────────── */}
        <header className="flex flex-wrap justify-center sm:justify-between items-center gap-4 mb-6">
          <nav className="flex flex-wrap justify-center space-x-6">
            <Link
              to="/"
              className={`text-sm sm:text-base font-semibold ${location.pathname === "/" ? "font-bold text-[#7B8BD4]" : "text-[#7B8BD4]"}`}
            >Home</Link>
            <Link
              to="/kmeans"
              className={`text-sm sm:text-base font-semibold ${location.pathname === "/kmeans" ? "font-bold text-[#7B8BD4]" : "text-[#A3A9D1]"}`}
            >K-Means</Link>
          </nav>
        </header>

        {/* ── HERO ──────────────────────────────── */}
        <section className="relative rounded-xl overflow-hidden bg-gradient-to-tr from-[#8B8EDC] via-[#B7B9E9] to-[#D9D9F3] p-6 h-52 sm:h-56 md:h-64 lg:h-72 mb-4">
          <img
            src={strawbery}
            alt="Greenhouse"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 flex items-center space-x-4 text-white">
            <Thermometer className="w-10 h-10" />
            <div>
              {loading ? (
                <Spinner />
              ) : (
                <>
                  <span className="text-4xl sm:text-5xl font-light">{latestData?.temperature}°</span>
                  <div className="text-xs sm:text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />Greenhouse, Farm
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="absolute bottom-4 right-6 text-white text-[10px] sm:text-xs">
            {loading ? <Spinner /> : formattedDate}
          </div>
        </section>

        {/* ── INFO BOXES (Humidity, pH, Temp) ───── */}
        <section className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          {/* Soil Humidity */}
          <div className="flex items-center bg-[#7B8BD4] text-white rounded-xl px-4 py-3 flex-1">
            <Droplet className="w-6 h-6 mr-3" />
            {loading ? (
              <Spinner />
            ) : (
              <div className="text-sm">
                <p className="font-semibold">Soil Humidity</p>
                <p className="text-xs">{latestData?.humidity}%</p>
              </div>
            )}
          </div>
          {/* Soil pH */}
          <div className="flex items-center bg-[#7B8BD4] text-white rounded-xl px-4 py-3 flex-1">
            <TestTube className="w-6 h-6 mr-3" />
            {loading ? (
              <Spinner />
            ) : (
              <div className="text-sm">
                <p className="font-semibold">Soil pH</p>
                <p className="text-xs">{latestData?.ph}</p>
              </div>
            )}
          </div>
          {/* Temperature */}
          <div className="flex items-center bg-[#7B8BD4] text-white rounded-xl px-4 py-3 flex-1">
            <Thermometer className="w-6 h-6 mr-3" />
            {loading ? (
              <Spinner />
            ) : (
              <div className="text-sm">
                <p className="font-semibold">Temperature</p>
                <p className="text-xs">{latestData?.temperature}°C</p>
              </div>
            )}
          </div>
        </section>

        {/* ── ERROR POPUP ───────────────────────── */}
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

        {/* ── TITLE & DESCRIPTION ──────────────── */}
        <section className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#4F6BED] mb-2">
            Visualisasi Clustering Smart Farming
          </h2>
          <p className="text-[#7B8BD4] max-w-3xl mx-auto text-sm sm:text-base leading-relaxed">
            Gambar berikut menampilkan hasil <strong>Clustering Suhu Tanaman</strong>,{" "}
            <strong>Pemetaan Lingkungan berdasarkan pH &amp; Kelembaban</strong>, serta{" "}
            <strong>Elbow Method</strong> untuk menentukan jumlah klaster optimal.
          </p>
        </section>

        {/* ── VISUALISASI GAMBAR ───────────────── */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <div className="space-y-10">
            <img
              src={`data:image/png;base64,${imageData}`}
              alt="Visualisasi Clustering"
              className="w-full max-w-4xl rounded-xl shadow-lg border border-gray-300 mx-auto transition-transform duration-300 hover:scale-[1.02]"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[#7B8BD4] text-sm font-semibold max-w-5xl mx-auto">
              <div className="bg-[#F3F4FF] rounded-xl p-5 shadow hover:shadow-md transition transform hover:-translate-y-1">
                <h3 className="font-semibold mb-2">1. Clustering Suhu</h3>
                <p className="font-normal text-xs leading-relaxed">
                  Memvisualisasikan suhu tanaman berdasarkan cluster untuk memahami kondisi yang berbeda.
                </p>
              </div>
              <div className="bg-[#F3F4FF] rounded-xl p-5 shadow hover:shadow-md transition transform hover:-translate-y-1">
                <h3 className="font-semibold mb-2">2. Pemetaan Lingkungan</h3>
                <p className="font-normal text-xs leading-relaxed">
                  Distribusi nilai pH dan kelembaban tanaman dikelompokkan ke dalam cluster visual.
                </p>
              </div>
              <div className="bg-[#F3F4FF] rounded-xl p-5 shadow hover:shadow-md transition transform hover:-translate-y-1">
                <h3 className="font-semibold mb-2">3. Elbow Method</h3>
                <p className="font-normal text-xs leading-relaxed">
                  Digunakan untuk menentukan jumlah cluster optimal berdasarkan nilai inertia (jarak internal).
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default KMeans;
