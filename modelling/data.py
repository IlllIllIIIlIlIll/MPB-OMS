import pandas as pd
import numpy as np
import datetime
import random

# Daftar halte pada rute Blok M - Kota yang Anda berikan
halte_list = ["Blok M", "Masjid Agung", "Bundaran Senayan", "Gelora Bung Karno", "Polda Metro Jaya", "Bendungan Hilir", "Karet", "Dukuh Atas 1", "Tosari", "Bundaran HI", "Sarinah", "Bank Indonesia", "Monas", "Harmoni", "Sawah Besar", "Mangga Besar", "Glodok", "Kota"]

def generate_mock_data_by_minute(num_minutes):
    data = []
    start_time = datetime.datetime(2025, 1, 1, 6, 0, 0)
    current_passengers = 15
    max_passengers = 50
    
    current_halte_index = 0
    
    for i in range(num_minutes):
        current_timestamp = start_time + datetime.timedelta(minutes=i)
        
        # Simulasi perubahan halte setiap 5 menit
        if i % 5 == 0 and i != 0:
            current_halte_index = (current_halte_index + 1) % len(halte_list)
            
            # Perubahan jumlah penumpang saat di halte
            passengers_on = random.randint(0, 10)
            passengers_off = random.randint(0, 10)
            current_passengers += (passengers_on - passengers_off)
            current_passengers = max(0, current_passengers)
            current_passengers = min(max_passengers, current_passengers)

        halte = halte_list[current_halte_index]

        for second in range(60):
            data_timestamp = current_timestamp + datetime.timedelta(seconds=second)
            
            # Tambahkan sedikit fluktuasi acak untuk setiap detik
            final_count = current_passengers + random.randint(-1, 1)
            final_count = max(0, final_count)
            final_count = min(max_passengers, final_count)
            
            data.append([data_timestamp.strftime('%Y:%m:%d %H:%M:%S'), halte, final_count])
    
    return pd.DataFrame(data, columns=['Timestamp', 'Halte', 'Jumlah Penumpang'])

mock_dataset = generate_mock_data_by_minute(1000)

mock_dataset['Status Kepadatan'] = mock_dataset['Jumlah Penumpang'].apply(
    lambda x: 'Kosong' if x < 10 else ('Sedang' if 10 <= x < 20 else 'Hampir Penuh')
)

mock_dataset.to_csv('transjakarta_blok_m_kota_dataset_max_50.csv', index=False)
print("Dataset fiktif berhasil dibuat dengan jumlah penumpang maksimal 50.")
print("File tersimpan sebagai transjakarta_blok_m_kota_dataset_max_50.csv")