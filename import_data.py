import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import TeerResult, Base  # Imports your DB setup from main.py
import os

# 1. Connect to your database
engine = create_engine("sqlite:///./teer_data.db")
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

# 2. Define your CSV file name
CSV_FILE = "shillong.csv" # Change this to your actual file name if different

def import_csv_to_db():
    if not os.path.exists(CSV_FILE):
        print(f"❌ Could not find {CSV_FILE}. Make sure it is in the same folder.")
        return

    print(f"⏳ Reading {CSV_FILE}...")
    
    # Read the CSV (Adjust header=None if your CSV doesn't have column names)
    df = pd.read_csv(CSV_FILE, header=None, engine='python')
    
    # Clean the data exactly like your original script did
    if df.shape[1] == 1:
        df = df[0].astype(str).str.split(',', expand=True)
    df = df.iloc[:, :3]
    df = df.replace({'"': '', "'": ''}, regex=True)
    df.columns = ['Date', 'FR', 'SR']
    
    df['FR'] = pd.to_numeric(df['FR'], errors='coerce')
    df['SR'] = pd.to_numeric(df['SR'], errors='coerce')
    df = df.dropna(subset=['FR', 'SR'])
    df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')
    df = df.dropna(subset=['Date'])
    
    records_added = 0
    records_skipped = 0

    print("💾 Saving to database...")
    for _, row in df.iterrows():
        # Check if date already exists to prevent duplicates
        existing = session.query(TeerResult).filter(
            TeerResult.city == "Shillong",
            TeerResult.result_date == row['Date'].date()
        ).first()

        if not existing:
            new_result = TeerResult(
                city="Shillong",
                result_date=row['Date'].date(),
                fr=int(row['FR']),
                sr=int(row['SR'])
            )
            session.add(new_result)
            records_added += 1
        else:
            records_skipped += 1

    session.commit()
    print(f"✅ Import Complete! Added: {records_added} | Skipped (already existed): {records_skipped}")

if __name__ == "__main__":
    import_csv_to_db()