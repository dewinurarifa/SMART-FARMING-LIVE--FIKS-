// lucide-react untuk mengambil icon library react
// framer-motion untuk animasi
import foto from './assets/foto_buah.jpg';
import vector from './assets/vector.jpg';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, Droplet, Vegan, Thermometer, Calendar, Clock, ThumbsUp, Droplets, Sprout, Search } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [latestData, setLatestData] = useState(null);

  const fetchData = () => {
    axios
      .get("http://localhost:5000/api/data")
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setLatestData(sorted[0]);
      })
      .catch((err) => {
        console.error("Gagal mengambil data:", err);
      });
  };

  // digunakan render ulang jika ada data yang berubah
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = latestData
    ? `${new Date(latestData.created_at).toLocaleDateString('id-ID', { weekday: 'long' })}, ${String(new Date(latestData.created_at).getDate()).padStart(2, '0')}-${String(new Date(latestData.created_at).getMonth() + 1).padStart(2, '0')}-${new Date(latestData.created_at).getFullYear()}`
    : 'Loading...';

  const getIconByRecommendation = (recommendation) => {
    switch (recommendation) {
      case "Optimal":
        return <ThumbsUp className="text-white w-32 h-32" />;
      case "Penyiraman":
        return <Droplets className="text-white w-32 h-32" />;
      case "Pemupukan":
        return <Sprout className="text-white w-32 h-32" />;
      case "Perlu Pengecekan":
        return <Search className="text-white w-32 h-32" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <div className="h-[60vh] sm:h-[70vh] lg:h-screen relative">
        <img src={foto} alt="Foto Greenhouse" className="w-full h-full object-cover brightness-75" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center px-4">
          <motion.h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            Smart Farming
          </motion.h1>
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${vector})`, zIndex: -1 }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-4 relative z-10">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                <Vegan className="text-green-700" /> STROBERI
              </h1>
              <InfoCard title="Jam" icon={<Clock />} value={latestData ? new Date(latestData.created_at).toLocaleTimeString('id-ID') : 'Loading...'} />
              <InfoCard title="Kelembapan Tanah" icon={<Droplet />} value={latestData ? `${latestData.humidity} %` : 'Loading...'} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                <Calendar className="text-green-700" /> {formattedDate}
              </h1>
              <InfoCard title="Suhu" icon={<Sun />} value={latestData ? `${latestData.temperature} °C` : 'Loading...'} />
              <InfoCard title="PH Tanah" icon={<Thermometer />} value={latestData ? latestData.ph : 'Loading...'} />
            </div>
          </motion.div>

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
              Rekomendasi Pemeliharaan
            </h1>

            <div className="bg-green-700 w-full sm:max-w-2xl mx-auto rounded-xl shadow-md p-6 mb-4">
              <motion.div
                className="flex justify-center mb-6"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.95, rotate: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {latestData ? getIconByRecommendation(latestData.Rekomendasi) : null}
              </motion.div>

              <h1 className="text-white text-2xl sm:text-3xl font-bold">
                {latestData ? latestData.Rekomendasi : 'Loading...'}
              </h1>
              <p className="text-white text-base sm:text-lg mt-4">
                {latestData ? latestData.Penjelasan : 'Loading...'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value, icon }) {
  return (
    <motion.div className="bg-green-700 h-48 sm:h-56 lg:h-64 w-full rounded-xl mb-4 flex items-center justify-center shadow-lg" whileHover={{ scale: 1.03 }}>
      <div className="p-4 text-center text-white">
        <div className="flex justify-center mb-2 text-2xl sm:text-3xl lg:text-4xl">{icon}</div>
        <h1 className="text-base sm:text-lg lg:text-xl font-medium">{title}</h1>
        <p className="text-2xl sm:text-4xl lg:text-5xl font-bold mt-2">{value}</p>
      </div>
    </motion.div>
  );
}

export default App;