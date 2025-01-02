import sqlite3
from flask import Flask, request, jsonify, render_template
from expense_tracker import (
    initialize_db,
    getExpenses,
    addExpense,
    getBudget,
    setBudget
)

app = Flask(__name__)

# ---------- DATABASE INITIALIZATION ----------
initialize_db()


# ---------- INDEX ROUTE ----------
@app.route('/')
def index():
    """Serve the main HTML page."""
    return render_template('index.html')


# ---------- EXPENSE ROUTES ----------
@app.route('/expenses', methods=(['GET', 'POST']))
def handle_expenses():
    """
    GET: Fetch all expenses.
    POST: Add a new expense.
    """
    if request.method == 'GET':
        expenses = getExpenses()
        return jsonify(expenses)
    
    if request.method == 'POST':
        data = request.json
        required_fields = ['name', 'category', 'amount', 'date']
        
        # Validate incoming data
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        try:
            addExpense(data['name'], data['category'], data['amount'], data['date'])
            return jsonify({"message": "Expense added successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
@app.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    try:
        with sqlite3.connect('expenses.db') as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM expenses WHERE id = ?',(expense_id,))
            conn.commit()
        return jsonify({"message": "Expense deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

        


            


# ---------- BUDGET ROUTES ----------
@app.route('/budget', methods=['GET', 'POST'])
def handle_budget():
    """
    GET: Fetch the current budget.
    POST: Set a new budget.
    """
    if request.method == 'GET':
        budget = getBudget()
        return jsonify({"amount": budget})
    
    if request.method == 'POST':
        data = request.json
        
        if 'amount' not in data:
            return jsonify({"error": "Missing 'amount' field"}), 400
        
        try:
            setBudget(data['amount'])
            return jsonify({"message": "Budget set successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500


# ---------- RUN APP ----------
if __name__ == "__main__":
    app.run(debug=True)