from flask import Flask, jsonify
from flask_cors import CORS

from preprocess import preprocess_data
from kmeans import run_kmeans
from elbow import get_elbow_and_cluster_plot_base64

app = Flask(__name__)
CORS(app)

@app.route("/api/data")
def get_clustered_data():
    df_cleaned = preprocess_data()
    df_clustered = run_kmeans(df_cleaned)

    # Format datetime agar sesuai format UTC string
    df_clustered["created_at"] = df_clustered["created_at"].dt.strftime('%a, %d %b %Y %H:%M:%S GMT')

    return jsonify(df_clustered.to_dict(orient="records"))

@app.route("/api/elbow")
def get_elbow_plot():
    try:
        df_cleaned = preprocess_data()
        print("[DEBUG] df_cleaned head:", df_cleaned.head())

        df_numeric = df_cleaned.drop(columns=['created_at', 'sensor_id'], errors='ignore')
        df_numeric = df_numeric.select_dtypes(include='number')
        df_numeric.index = df_cleaned['created_at']  # Pastikan index berupa datetime
        print("[DEBUG] df_numeric columns:", df_numeric.columns)

        if df_numeric.empty:
            raise ValueError("Data numerik kosong")

        base64_image = get_elbow_and_cluster_plot_base64(df_numeric)
        return jsonify({"image": base64_image})
    except Exception as e:
        print("[ERROR]", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)