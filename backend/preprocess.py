import pandas as pd
from sklearn.impute import SimpleImputer
import psycopg2

def preprocess_data():
    # Koneksi langsung ke database PostgreSQL
    conn = psycopg2.connect(
        host="localhost",
        port=6543,
        database="sf_main_db",
        user="sf_backend",
        password="agrilink_be"
    )

    # Ambil data sensor_id = 2
    query = """
    SELECT 
        (payload->>'soilTemperature')::float AS temperature,
        (payload->>'soilHumidity')::float AS humidity,
        (payload->>'soilPh')::float AS ph,
        read_at AS created_at,
        sensor_id
    FROM public.sensor_readings
    WHERE sensor_id = 2
    ORDER BY created_at DESC;
    """
    df = pd.read_sql(query, conn)
    df["created_at"] = pd.to_datetime(df["created_at"])

    # Resample per 8 jam
    df.set_index("created_at", inplace=True)
    df_resampled = df.resample("8h").mean().dropna().reset_index()

    created_at_series = df_resampled["created_at"].reset_index(drop=True)
    sensor_id_series = pd.Series([2] * len(df_resampled))

    df_numeric = df_resampled[["ph", "humidity", "temperature"]]

    # Imputasi nilai yang hilang (jika ada)
    imputer = SimpleImputer(strategy='mean')
    df_numeric = pd.DataFrame(imputer.fit_transform(df_numeric), columns=df_numeric.columns)

    # Gabungkan kembali dengan metadata
    df_cleaned = df_numeric.copy()
    df_cleaned["created_at"] = created_at_series
    df_cleaned["sensor_id"] = sensor_id_series

    return df_cleaned
