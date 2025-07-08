from sshtunnel import SSHTunnelForwarder

# Step 1: Koneksi ke jump server (bastion)
jump_server = SSHTunnelForwarder(
    ssh_address_or_host=('103.182.234.231', 22),
    ssh_username='labpolinema',
    ssh_password='123456',
    remote_bind_address=('192.168.60.108', 22),  # Kita mau ke internal server
)

jump_server.start()

# Step 2: Koneksi dari jump server ke server PostgreSQL
db_server = SSHTunnelForwarder(
    ssh_address_or_host=('127.0.0.1', jump_server.local_bind_port),
    ssh_username='smartfarming2',
    ssh_password='agrilinkvocpro2024',
    remote_bind_address=('127.0.0.1', 5432),
    local_bind_address=('127.0.0.1', 6543),  # <== INI YANG DITETAPKAN
)


db_server.start()

print("Tunnel berhasil dibuka!")
print(f"Gunakan port ini di SQLAlchemy atau pgAdmin: {db_server.local_bind_port}")
print(f"Contoh URI SQLAlchemy:")
print(f"postgresql://sf_adonis:pass_sf_adonis@127.0.0.1:{db_server.local_bind_port}/sf_db")

input("Tekan Enter untuk menghentikan tunnel...")

# Stop tunnel saat program ditutup
db_server.stop()
jump_server.stop()