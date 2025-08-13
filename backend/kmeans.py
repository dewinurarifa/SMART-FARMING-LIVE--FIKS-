import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def rekomendasi_perawatan(cluster):
    if cluster == 0:
        return "Penyiraman"
    elif cluster == 1:
        return "Pemupukan"
    elif cluster == 2:
        return "Penyiraman"
    elif cluster == 3:
        return "Optimal"
    else:
        return "Perlu Pengecekan"

def rekomendasi_detail(row):
    if row['Cluster'] == 0:
        return "Periksa kelembapan. Kemungkinan terlalu kering."
    elif row['Cluster'] == 1:
        return "pH rendah. Tambahkan pupuk npk"
    elif row['Cluster'] == 2:
        return "Suhu tinggi. Gunakan paranet/irigasi tambahan."
    elif row['Cluster'] == 3:
        return "Kondisi optimal.pH rendah. "
    return "Tidak ada rekomendasi."

def run_kmeans(df_cleaned, n_clusters=4):
    df_numeric = df_cleaned[["ph", "humidity", "temperature"]]
    scaler = StandardScaler()
    df_scaled = pd.DataFrame(scaler.fit_transform(df_numeric), columns=df_numeric.columns)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    df_scaled['cluster'] = kmeans.fit_predict(df_scaled)

    df_cleaned = df_cleaned.copy().reset_index(drop=True)
    df_cleaned['Cluster'] = df_scaled['cluster']
    df_cleaned['Tanggal'] = df_cleaned['created_at'].dt.strftime('%Y-%m-%d')
    df_cleaned['Jam'] = df_cleaned['created_at'].dt.strftime('%H:%M:%S')
    df_cleaned['Rekomendasi'] = df_cleaned['Cluster'].apply(rekomendasi_perawatan)
    df_cleaned['Rekomendasi Perawatan'] = df_cleaned.apply(rekomendasi_detail, axis=1)
    df_cleaned[['ph', 'humidity', 'temperature']] = df_cleaned[['ph', 'humidity', 'temperature']].round(1)

    df_cleaned['Label_Aktual'] = df_cleaned['Rekomendasi'].map({
        "Penyiraman": 0,
        "Pemupukan": 1,
        "Perlu Pengecekan": 2,
        "Optimal": 3
    })
    
    return df_cleaned
