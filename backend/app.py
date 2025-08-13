from flask import Flask, jsonify
from flask_cors import CORS

# Import modul internal
from preprocess import preprocess_data
from kmeans import run_kmeans
from elbow import get_elbow_and_cluster_plot_base64
from akurasi import evaluate_model  # ✅ Evaluasi akurasi model

app = Flask(__name__)
CORS(app)

# Endpoint utama untuk mendapatkan data hasil clustering
@app.route("/api/data")
def get_clustered_data():
    df_cleaned = preprocess_data()
    df_clustered = run_kmeans(df_cleaned)

    # Format datetime ke UTC string agar konsisten
    df_clustered["created_at"] = df_clustered["created_at"].dt.strftime('%a, %d %b %Y %H:%M:%S GMT')

    return jsonify(df_clustered.to_dict(orient="records"))

# Endpoint untuk mendapatkan plot Elbow dan PCA 2D/3D (jika ada)
@app.route("/api/elbow")
def get_elbow_plot():
    try:
        df_cleaned = preprocess_data()
        print("[DEBUG] df_cleaned head:", df_cleaned.head())

        # Drop kolom non-numerik sebelum visualisasi
        df_numeric = df_cleaned.drop(columns=['created_at', 'sensor_id'], errors='ignore')
        df_numeric = df_numeric.select_dtypes(include='number')
        df_numeric.index = df_cleaned['created_at']  # Set index datetime

        print("[DEBUG] df_numeric columns:", df_numeric.columns)

        if df_numeric.empty:
            raise ValueError("Data numerik kosong")

        # Dapatkan visualisasi dalam bentuk Base64
        base64_image = get_elbow_and_cluster_plot_base64(df_numeric)
        return jsonify({"image": base64_image})
    except Exception as e:
        print("[ERROR /api/elbow]:", str(e))
        return jsonify({"error": str(e)}), 500

# Endpoint untuk evaluasi akurasi model (Label Aktual vs Cluster)
@app.route("/api/akurasi")
def get_akurasi():
    try:
        df_cleaned = preprocess_data()
        df_clustered = run_kmeans(df_cleaned)

        # Evaluasi akurasi dengan fungsi dari akurasi.py
        result, cm, y_true, y_pred, table = evaluate_model(df_clustered)

        return jsonify({
            "result": result,
            "confusion_matrix": cm.tolist() if cm is not None else [],
            "per_class_table": table
        })

    except Exception as e:
        print("[ERROR /api/akurasi]:", str(e))
        return jsonify({"error": str(e)}), 500

# Jalankan server Flask
if __name__ == "__main__":
    app.run(debug=True)
