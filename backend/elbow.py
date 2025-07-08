import matplotlib
matplotlib.use('Agg')

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from sklearn.cluster import KMeans
from io import BytesIO
import base64
import pandas as pd

def get_elbow_and_cluster_plot_base64(df_numeric):
    if df_numeric is None or df_numeric.empty:
        raise ValueError("Data tidak boleh kosong")

    if not isinstance(df_numeric.index, pd.DatetimeIndex):
        raise ValueError("Index DataFrame harus berupa DatetimeIndex")

    required_columns = ['temperature', 'ph', 'humidity']
    for col in required_columns:
        if col not in df_numeric.columns:
            raise ValueError(f"Kolom '{col}' tidak ditemukan di dataset")

    inertia = []
    k_values = range(1, 10)
    for k in k_values:
        kmeans = KMeans(n_clusters=k, random_state=42)
        kmeans.fit(df_numeric[required_columns])
        inertia.append(kmeans.inertia_)

    k_opt = 4
    kmeans_final = KMeans(n_clusters=k_opt, random_state=42)
    df_clustered = df_numeric.copy()
    df_clustered['Cluster'] = kmeans_final.fit_predict(df_numeric[required_columns])
    df_clustered['Month'] = df_clustered.index.to_period('M').astype(str)

    with BytesIO() as buffer:
        fig = plt.figure(figsize=(18, 24))
        colors = ['blue', 'orange', 'gray', 'green', 'purple', 'cyan']

        # 1. Elbow Method
        ax1 = fig.add_subplot(3, 2, 1)
        ax1.plot(k_values, inertia, marker='o', color='black')
        ax1.set_title("1. Elbow Method")
        ax1.set_xlabel("Jumlah Cluster (k)")
        ax1.set_ylabel("Inertia")
        ax1.grid(True)

        # 2. Cluster per Bulan (Grouped Bar)
        ax2 = fig.add_subplot(3, 2, 2)
        cluster_per_month = df_clustered.groupby(['Cluster', 'Month']).size().unstack(fill_value=0)
        cluster_per_month.T.plot(kind='bar', ax=ax2, color=colors[:len(cluster_per_month)], width=0.8)
        ax2.set_title("2. Rekomendasi per Bulan per Cluster")
        ax2.set_xlabel("Bulan")
        ax2.set_ylabel("Jumlah Data")
        ax2.legend(title="Cluster", loc='upper right')
        ax2.grid(True)

        # 3. Visualisasi 2D (pH vs Humidity)
        ax3 = fig.add_subplot(3, 2, 3)
        for i, cluster in enumerate(df_clustered['Cluster'].unique()):
            cluster_data = df_clustered[df_clustered['Cluster'] == cluster]
            ax3.scatter(cluster_data['ph'], cluster_data['humidity'],
                        label=f"Cluster {cluster}",
                        color=colors[i % len(colors)],
                        s=30)
        ax3.set_title("3. Cluster 2D (pH vs Humidity)")
        ax3.set_xlabel("pH")
        ax3.set_ylabel("Humidity")
        ax3.legend()
        ax3.grid(True)

        # 4. Visualisasi 3D
        ax4 = fig.add_subplot(3, 2, 4, projection='3d')
        for i, cluster in enumerate(df_clustered['Cluster'].unique()):
            cluster_data = df_clustered[df_clustered['Cluster'] == cluster]
            ax4.scatter(cluster_data['temperature'], cluster_data['ph'], cluster_data['humidity'],
                        label=f"Cluster {cluster}",
                        color=colors[i % len(colors)],
                        s=20)
        ax4.set_title("4. Cluster 3D")
        ax4.set_xlabel("Temperature")
        ax4.set_ylabel("pH")
        ax4.set_zlabel("Humidity")
        ax4.legend()

        # 5. Rekap Jumlah per Cluster
        ax5 = fig.add_subplot(3, 2, 5)
        cluster_counts = df_clustered['Cluster'].value_counts().sort_index()
        cluster_counts.plot(kind='bar', color=[colors[i % len(colors)] for i in cluster_counts.index], ax=ax5)
        ax5.set_title("5. Jumlah Data per Cluster")
        ax5.set_xlabel("Cluster")
        ax5.set_ylabel("Jumlah Data")
        ax5.grid(True)

        plt.tight_layout(h_pad=3.5)
        plt.savefig(buffer, format='png', bbox_inches='tight')
        plt.close(fig)
        buffer.seek(0)
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
