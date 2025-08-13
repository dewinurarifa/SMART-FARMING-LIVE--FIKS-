import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix, accuracy_score

def evaluate_model(df_clustered):
    if 'Label_Aktual' not in df_clustered.columns or 'Cluster' not in df_clustered.columns:
        return "Kolom 'Label_Aktual' atau 'Cluster' tidak ditemukan di data.", None, None, None, None

    df_valid = df_clustered.dropna(subset=['Label_Aktual'])
    if df_valid.empty:
        return "Data tidak tersedia untuk evaluasi (semua nilai Label_Aktual kosong).", None, None, None, None

    y_true = df_valid['Label_Aktual'].astype(int).values
    y_pred = df_valid['Cluster'].astype(int).values

    labels = sorted(np.unique(np.concatenate((y_true, y_pred))))
    cm = confusion_matrix(y_true, y_pred, labels=labels)

    # TP, FP, FN, TN
    TP = np.diag(cm)
    FP = np.sum(cm, axis=0) - TP
    FN = np.sum(cm, axis=1) - TP
    TN = []
    for i in range(len(labels)):
        temp = np.delete(cm, i, 0)
        temp = np.delete(temp, i, 1)
        TN.append(temp.sum())
    TN = np.array(TN)

    # Global metrics
    accuracy = accuracy_score(y_true, y_pred)
    precision = np.mean(np.divide(TP, TP + FP, out=np.zeros_like(TP, dtype=float), where=(TP + FP) != 0))
    recall = np.mean(np.divide(TP, TP + FN, out=np.zeros_like(TP, dtype=float), where=(TP + FN) != 0))
    specificity = np.mean(np.divide(TN, TN + FP, out=np.zeros_like(TN, dtype=float), where=(TN + FP) != 0))
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) != 0 else 0

    # Per-label metrics table
    rekomendasi_names = {
        0: 'Perlu Penyiraman',
        1: 'Perlu Pemupukan',
        2: 'Perlu Pengecekan',
        3: 'Optimal'
    }

    table = {}
    for idx, label in enumerate(labels):
        label_name = rekomendasi_names.get(label, f'Label {label}')
        tp, fp, fn, tn = TP[idx], FP[idx], FN[idx], TN[idx]

        acc = (tp + tn) / (tp + fp + fn + tn) if (tp + fp + fn + tn) > 0 else 0
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_s = 2 * (prec * rec) / (prec + rec) if (prec + rec) > 0 else 0

        table[label_name] = {
            "accuracy": round(acc, 2),
            "precision": round(prec, 2),
            "recall": round(rec, 2),
            "f1_score": round(f1_s, 2)
        }

    result = {
        "accuracy": round(accuracy, 2),
        "precision": round(precision, 2),
        "recall": round(recall, 2),
        "specificity": round(specificity, 2),
        "f1_score": round(f1, 2)
    }

    return result, cm, y_true, y_pred, table
