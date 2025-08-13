import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';
import strawbery from './assets/strawbery.jpg';
import { Link, useLocation } from 'react-router-dom';
import {
  Thermometer,
  Droplet,
  TestTube,
  MapPin,
  ThumbsUp,
  Droplets,
  Sprout,
  Search,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const Spinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin h-5 w-5 border-2 border-[#7B8BD4] border-t-transparent rounded-full" />
  </div>
);

const SpinnerWhite = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
  </div>
);

const getIconByRecommendationPopup = (recommendation) => {
  switch (recommendation) {
    case "Optimal":
      return <ThumbsUp className="text-red-700 w-6 h-6" />;
    case "Penyiraman":
      return <Droplets className="text-red-700 w-6 h-6" />;
    case "Pemupukan":
      return <Sprout className="text-red-700 w-6 h-6" />;
    case "Perlu Pengecekan":
      return <Search className="text-red-700 w-6 h-6" />;
    default:
      return null;
  }
};

const getIconByRecommendation = (recommendation) => {
  switch (recommendation) {
    case "Optimal":
      return <ThumbsUp className="text-white w-6 h-6" />;
    case "Penyiraman":
      return <Droplets className="text-white w-6 h-6" />;
    case "Pemupukan":
      return <Sprout className="text-white w-6 h-6" />;
    case "Perlu Pengecekan":
      return <Search className="text-white w-6 h-6" />;
    default:
      return null;
  }
};

const Home = () => {
  const location = useLocation();
  const [latestData, setLatestData] = useState(null);
  const [demoData, setDemoData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ Tambahkan fungsi logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login"; // ganti path sesuai kebutuhanmu
  };

  const fetchData = () => {
    axios
      .get("http://localhost:5000/api/data")
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const latest = sorted[0];
        setLatestData(latest);
        setDemoData(sorted.slice(0, 10).reverse());
        setLoading(false);
        if (latest?.Rekomendasi !== "Optimal") {
          setShowPopup(true);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = latestData
    ? `${new Date(latestData.created_at).toLocaleDateString('id-ID', { weekday: 'long' })}, ${String(new Date(latestData.created_at).getDate()).padStart(2, '0')}-${String(new Date(latestData.created_at).getMonth() + 1).padStart(2, '0')}-${new Date(latestData.created_at).getFullYear()}`
    : '';

  const renderChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={demoData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="created_at"
          tickFormatter={(value) => {
            const date = new Date(value);
            const tanggal = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            const jam = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
            return `${tanggal} ${jam}`;
          }}
          tick={{ fontSize: 10 }}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(value) => {
            const date = new Date(value);
            return `${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID')}`;
          }}
        />
        <Line
          type="monotone"
          dataKey={selectedMetric}
          stroke="#7B8BD4"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  // ✅ Tambahkan fallback jika latestData belum ada
  if (!latestData && !loading) {
    return <div className="p-6 text-gray-500">Tidak ada data yang tersedia.</div>;
  }

  return (
    <div className="bg-[#F9FAFF] min-h-screen flex justify-center items-start px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4 sm:p-6">

        {showPopup && latestData?.Rekomendasi !== 'Optimal' && (
          <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-red-50 text-red-700 p-6 rounded-xl shadow-xl text-center w-80">
            <div className="flex justify-end">
              <button onClick={() => setShowPopup(false)}>
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
            <AlertTriangle className="mx-auto w-10 h-10 text-red-500 mb-2 animate-bounce" />
            <h2 className="text-lg font-bold mb-1">{latestData?.Rekomendasi}</h2>
            <div className="flex justify-center mb-2 animate-pulse">
              {getIconByRecommendationPopup(latestData?.Rekomendasi)}
            </div>
          </div>
        )}

        <header className="flex flex-wrap justify-center sm:justify-between items-center gap-4 mb-6">
          <nav className="flex flex-wrap justify-center space-x-6">
            <Link
              to="/"
              className={`text-sm sm:text-base font-semibold ${
                location.pathname === "/" ? "font-bold text-[#7B8BD4]" : "text-[#7B8BD4]"
              }`}
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-500 font-semibold ml-4"
            >
              Logout
            </button>
          </nav>
        </header>

        <section className="relative rounded-xl overflow-hidden bg-gradient-to-tr from-[#8B8EDC] via-[#B7B9E9] to-[#D9D9F3] p-6 h-52 sm:h-56 md:h-64 lg:h-72 mb-6">
          <img alt="Greenhouse" className="absolute inset-0 w-full h-full object-cover opacity-30" src={strawbery} />
          <div className="relative z-10 flex items-center space-x-4 text-white">
            <Thermometer className="w-10 h-10" />
            <div>
              {loading ? (
                <SpinnerWhite />
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
            {loading ? <SpinnerWhite /> : formattedDate}
          </div>
        </section>

        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-4 text-[#7B8BD4] text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <Droplet className="w-5 h-5" />
              <div>
                <div>Soil Humidity</div>
                <div className="font-normal text-[10px]">
                  {loading ? <Spinner /> : `${latestData?.humidity}%`}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <div>
                <div>Soil pH</div>
                <div className="font-normal text-[10px]">
                  {loading ? <Spinner /> : latestData?.ph}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5" />
              <div>
                <div>Temperature</div>
                <div className="font-normal text-[10px]">
                  {loading ? <Spinner /> : `${latestData?.temperature}°C`}
                </div>
              </div>
            </div>

            <div className="bg-[#7B8BD4] rounded-xl p-4 text-white text-xs font-semibold max-w-xs">
              <div className="flex items-center mb-2">
                {getIconByRecommendation(latestData?.Rekomendasi)}
              </div>
              {loading ? (
                <SpinnerWhite />
              ) : (
                <>
                  <h1 className="text-sm font-bold mb-1">{latestData?.Rekomendasi}</h1>
                  <p className="text-xs">{latestData?.["Rekomendasi Perawatan"]}</p>
                </>
              )}
            </div>
          </div>

          <div className="md:w-2/3 bg-white rounded-xl p-4 sm:p-6 shadow-inner text-[#7B8BD4] text-xs font-semibold">
            <div className="flex justify-between mb-4 space-x-4">
              {['temperature', 'humidity', 'ph'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`${
                    selectedMetric === metric
                      ? 'text-[#7B8BD4] font-bold border-b-2 border-[#7B8BD4]'
                      : 'text-[#A3A9D1]'
                  } transition-all duration-150`}
                >
                  {metric === 'temperature'
                    ? 'Temperature'
                    : metric === 'humidity'
                    ? 'Humidity'
                    : 'Soil pH'}
                </button>
              ))}
            </div>
            {loading ? <Spinner /> : renderChart()}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
