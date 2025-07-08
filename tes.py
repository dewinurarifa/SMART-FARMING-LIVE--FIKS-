from sshtunnel import SSHTunnelForwarder
import socket
import sys

# Fungsi untuk cek apakah port sedang digunakan
def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

# Port statis yang diinginkan
STATIC_PORT = 1422

# Cek apakah port sudah digunakan sebelum memulai tunnel
if is_port_in_use(STATIC_PORT):
    print(f"[ERROR] Port {STATIC_PORT} sudah digunakan. Matikan proses lain atau pilih port lain.")
    sys.exit(1)

# Step 1: Koneksi ke jump server (bastion)
jump_server = SSHTunnelForwarder(
    ssh_address_or_host=('103.182.234.231', 22),
    ssh_username='labpolinema',
    ssh_password='123456',
    remote_bind_address=('192.168.60.108', 22),  # Internal server
)

jump_server.start()

# Step 2: Koneksi dari jump server ke server PostgreSQL
db_server = SSHTunnelForwarder(
    ssh_address_or_host=('127.0.0.1', jump_server.local_bind_port),
    ssh_username='smartfarming2',
    ssh_password='agrilinkvocpro2024',
    remote_bind_address=('127.0.0.1', 5432),
    local_bind_address=('127.0.0.1', STATIC_PORT),  # Port lokal statis
)

db_server.start()

print("✅ Tunnel berhasil dibuka!")
print(f"🔗 Gunakan port ini di SQLAlchemy atau pgAdmin: {STATIC_PORT}")
print(f"📦 Contoh URI SQLAlchemy:")
print(f"postgresql://sf_backend:agrilink_be@127.0.0.1:{STATIC_PORT}/sf_main_db")

input("\nTekan Enter untuk menghentikan tunnel...")

# Stop tunnel saat program ditutup
db_server.stop()
jump_server.stop()
