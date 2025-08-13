import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { Thermometer, MapPin, Droplet, TestTube } from "lucide-react";
import strawbery from "./assets/strawbery.jpg";

const Spinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin h-6 w-6 border-4 border-[#7B8BD4] border-t-transparent rounded-full" />
  </div>
);

const getMaxValue = (matrix) => Math.max(...matrix.flat());

const Akurasi = () => {
  const location = useLocation();
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState(null);

  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/data")
      .then(res => {
        const latest = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        setLatestData(latest);
      })
      .catch(err => console.error("Gagal ambil data sensor:", err));

    axios.get("http://localhost:5000/api/akurasi")
      .then(res => {
        setEvaluation(res.data || null);
      })
      .catch(err => {
        console.error("Gagal ambil evaluasi:", err);
        setEvaluation(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const formattedDate = latestData
    ? `${new Date(latestData.created_at).toLocaleDateString("id-ID", { weekday: "long" })}, ${String(new Date(latestData.created_at).getDate()).padStart(2, "0")}-${String(new Date(latestData.created_at).getMonth() + 1).padStart(2, "0")}-${new Date(latestData.created_at).getFullYear()}`
    : "";

  const labelList = evaluation ? Object.keys(evaluation.per_class_table) : [];

  return (
    <div className="bg-[#F9FAFF] min-h-screen flex justify-center items-start px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-800">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4 sm:p-6">

        {/* Header / Nav */}
        <header className="flex justify-between mb-6 items-center">
          <nav className="flex flex-wrap space-x-6 text-sm sm:text-base font-semibold items-center">

            {role !== "admin" && (
              <Link
                to="/home"
                className={`${
                  location.pathname === "/home" ? "font-bold text-[#7B8BD4]" : "text-[#A3A9D1]"
                }`}
              >
                Home
              </Link>
            )}

            {role === "admin" && (
              <>
                <Link
                  to="/kmeans"
                  className={`${
                    location.pathname === "/kmeans" ? "font-bold text-[#7B8BD4]" : "text-[#A3A9D1]"
                  }`}
                >
                  K-Means
                </Link>
                <Link
                  to="/akurasi"
                  className={`${
                    location.pathname === "/akurasi" ? "font-bold text-[#7B8BD4]" : "text-[#A3A9D1]"
                  }`}
                >
                  Akurasi
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="text-red-500 font-semibold ml-4"
            >
              Logout
            </button>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative rounded-xl overflow-hidden bg-gradient-to-tr from-[#8B8EDC] via-[#B7B9E9] to-[#D9D9F3] p-6 h-52 sm:h-56 mb-4">
          <img src={strawbery} alt="Greenhouse" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="relative z-10 flex items-center space-x-4 text-white">
            <Thermometer className="w-10 h-10" />
            <div>
              {loading ? <Spinner /> : (
                <>
                  <span className="text-4xl sm:text-5xl font-light">{latestData?.temperature}°</span>
                  <div className="text-xs flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Greenhouse, Farm
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="absolute bottom-4 right-6 text-white text-xs">
            {loading ? <Spinner /> : formattedDate}
          </div>
        </section>

        {/* Sensor Info */}
        <section className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          {["humidity", "ph", "temperature"].map((type, idx) => (
            <div key={idx} className="flex items-center bg-[#7B8BD4] text-white rounded-xl px-4 py-3 flex-1">
              {type === "humidity" ? <Droplet className="w-6 h-6 mr-3" /> :
                type === "ph" ? <TestTube className="w-6 h-6 mr-3" /> :
                  <Thermometer className="w-6 h-6 mr-3" />}
              <div>
                <p className="font-semibold">{type === "humidity" ? "Soil Humidity" : type === "ph" ? "Soil pH" : "Temperature"}</p>
                <p>{type === "humidity" ? `${latestData?.humidity}%` : type === "ph" ? latestData?.ph : `${latestData?.temperature}°C`}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Evaluasi */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-[#7B8BD4] mb-4">Evaluasi Akurasi Sistem</h2>

          {loading ? (
            <Spinner />
          ) : evaluation ? (
            <>
              <div className="bg-gray-100 p-4 rounded-md mb-6 border">
                <p><strong>Accuracy:</strong> {evaluation.result.accuracy}</p>
                <p><strong>Precision:</strong> {evaluation.result.precision}</p>
                <p><strong>Recall:</strong> {evaluation.result.recall}</p>
                <p><strong>F1 Score:</strong> {evaluation.result.f1_score}</p>
                <p><strong>Specificity:</strong> {evaluation.result.specificity}</p>
              </div>

              <h2 className="text-xl font-bold text-[#7B8BD4] mb-4">Evaluasi Per Kelas</h2>
              <table className="table-auto w-full border border-gray-300 mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">Label</th>
                    <th className="border px-3 py-2">Accuracy</th>
                    <th className="border px-3 py-2">Precision</th>
                    <th className="border px-3 py-2">Recall</th>
                    <th className="border px-3 py-2">F1 Score</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(evaluation.per_class_table).map(([label, metrics]) => (
                    <tr key={label}>
                      <td className="border px-3 py-2">{label}</td>
                      <td className="border px-3 py-2">{metrics.accuracy}</td>
                      <td className="border px-3 py-2">{metrics.precision}</td>
                      <td className="border px-3 py-2">{metrics.recall}</td>
                      <td className="border px-3 py-2">{metrics.f1_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2 className="text-xl font-bold text-[#7B8BD4] mb-4">Confusion Matrix (Visual)</h2>
              <table className="table-auto w-full border border-gray-300 mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">Actual \ Pred</th>
                    {labelList.map((label, idx) => (
                      <th key={`head-${idx}`} className="border px-3 py-2 text-center">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evaluation.confusion_matrix.map((row, rowIdx) => (
                    <tr key={`row-${rowIdx}`}>
                      <td className="border px-3 py-2 font-medium bg-gray-50">{labelList[rowIdx]}</td>
                      {row.map((val, colIdx) => {
                        const max = getMaxValue(evaluation.confusion_matrix);
                        const intensity = val / (max || 1);
                        const blue = Math.round(255 - (intensity * 150));
                        const bgColor = `rgb(${blue}, ${blue + 30}, 255)`;
                        const textColor = intensity > 0.6 ? "#fff" : "#000";
                        return (
                          <td
                            key={`cell-${rowIdx}-${colIdx}`}
                            className="border px-3 py-2 text-center font-semibold"
                            style={{
                              backgroundColor: val === 0 ? "#fff" : bgColor,
                              color: textColor
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-red-500">Data evaluasi tidak tersedia.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Akurasi;
