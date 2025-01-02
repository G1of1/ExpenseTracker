import sqlite3
from typing import List, Dict

from flask import jsonify

# Database file name
DB_NAME = 'expenses.db'


# ---------- INITIALIZE DATABASE ----------
def initialize_db():
    """Initialize the database with required tables."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS expenses(
                            id INTEGER PRIMARY KEY,
                            name TEXT,
                            category TEXT,
                            amount REAL,
                            date TEXT)''')
        cursor.execute('''CREATE TABLE IF NOT EXISTS budget(
                            id INTEGER PRIMARY KEY,
                            amount REAL)''')
        conn.commit()


# ---------- GET EXPENSES ----------
def getExpenses() -> List[Dict]:
    """Retrieve all expenses from the database."""
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM expenses')
            rows = cursor.fetchall()
        return [{"id": row[0], "name": row[1], "category": row[2], "amount": row[3], "date": row[4]} for row in rows]
    except Exception as e:
        return jsonify({"error" : str(e)}), 500


# ---------- ADD EXPENSE ----------
def addExpense(name: str, category: str, amount: float, date: str):
    """Add a new expense to the database."""
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO expenses (name, category, amount, date) VALUES (?, ?, ?, ?)', 
                       (name, category, amount, date))
            conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------- GET BUDGET ----------
def getBudget() -> float:
    """Retrieve the budget from the database."""
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT amount FROM budget LIMIT 1')
            row = cursor.fetchone()
            return float(row[0]) if row else 0.0
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------- SET BUDGET ----------
def setBudget(amount: float):
    """Set or update the budget in the database."""
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM budget')
            cursor.execute('INSERT INTO budget (amount) VALUES (?)', (amount,))
            conn.commit()
        return jsonify({"message": "Budget set"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


        
    


# ---------- MAIN ----------
if __name__ == '__main__':
    initialize_db()
    print("Database initialized successfully.")