const list = document.getElementById('expense-list');
async function fetchExpenses()
{
    try {
        //Receive data from the database
        const response = await fetch('/expenses');
        const expenses = await response.json();
        //Format the data into the list item elements
        const expenseList = document.getElementById('expense-list');
        expenseList.innerHTML = ''; // Clear existing list

        expenses.forEach(expense => {
            const li = document.createElement('li');
            li.innerHTML = `Name: ${expense.name}<br>
            Category: ${expense.category}<br>
            Amount: $${expense.amount}<br>
            Date: ${expense.date}<br>
            <button class="delete" onclick="deleteExpense(${expense.id})">Delete</button>`;
            expenseList.appendChild(li);
            

        });
    } catch (error) 
    {
        console.error('Error fetching expenses:', error);
        document.getElementById('error-message').textContent = "Error fetching expenses:" + error;
    }
    
}

async function addExpense()
{
    //Take the values from each input in the html elements
    let name = document.getElementById('expense-name').value;
    let category = document.getElementById('expense-category').value;
    let amount = document.getElementById('expense-amount').value;
    let date = document.getElementById('expense-date').value;

    const addMessage = document.getElementById('add-message');
    //Create an object variable storing the data values
    const expense = 
    {
        name: name,
        category: category,
        amount: parseFloat(amount),
        date: date
    };
    //Add the object into the database using json file formatting
    try {
        await fetch('/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expense)
        });

        fetchExpenses(); // Refresh expense list
        updateBudget(); //Update the budget information
        document.getElementById('expense-name').value = "";
        document.getElementById('expense-category').selectedIndex = 0;
        document.getElementById('expense-amount').value = "";
        document.getElementById('expense-date').value = "";

        addMessage.textContent = "Expense has been added!";
        setTimeout(function(){addMessage.style.display = "none"}, 3000);
        
    } catch (error) 
    {
        console.error('Error adding expense:', error);
        document.getElementById('add-message').textContent = "Error adding expense:" + error;
    }

}
async function deleteExpense(expense_id)
{
    errorMessage = document.getElementById("error-message");
    deleteMessage = document.getElementById('delete-expense');
    if(!expense_id)
        {
            console.error("Error: Expense required.");
            errorMessage.textContent = "Error: Expense required.";
            return;
        }
    try
    {
        //Use the API to delete the specific expense using its ID
        const response = await fetch(`/expenses/${expense_id}`, {method: 'DELETE'});
        if(!response.ok)
        {
            throw new Error(`Error deleting expense:${response.statusText}`);
        }
        deleteMessage.textContent = "Expense has been deleted";
        setTimeout(function(){deleteMessage.style.display = "none"}, 3000);
        fetchExpenses(); //Update web page
        updateBudget(); // Update web page
        
    }
    catch(error)
    {
        console.error(`Error deleting expense:${error}`);
        errorMessage.textContent = `Error deleting expense: ${error}`;
    }
}


async function setBudget()
{
    //Get the budget input element
    const budget_value = document.getElementById('budget-amount').value;
    //Create budget object
    const budget = 
    {
        amount: parseFloat(budget_value)
    };
    //Send it to the budget database
    try {
        await fetch('/budget', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(budget)
        });

        updateBudget(); // Refresh budget display
        document.getElementById('budget-amount').value = "";
    } 
    catch (error) 
    {
        console.error('Error setting budget:', error);
        document.getElementById('budget-error').textContent = "Error setting budget: " + error;
    }
}

async function updateBudget()
{
    //Access the database and return content as json file
    try {
        const response = await fetch('/budget');
        const data = await response.json();
        const budget = data.amount || 0;
        const budgetStatus = document.getElementById('budget-info');

        if (!response.ok)
            {
                throw new Error(`Error: ${response.status}`);
            }
            //Use the total expenses to calculate if budget has been surpassed. If it has, then display the difference.
        const totalExpenses = await getTotalExpenses();
            if(totalExpenses > budget)
            {
                let budgetDiff = totalExpenses - budget;
                budgetDiff = Number(budgetDiff);
                budgetStatus.textContent = `Your budget is $${budget.toFixed(2)}.\n You're $${budgetDiff.toFixed(2)} off your budget.`; 
            }
            else
            {
                budgetStatus.textContent = `Your budget is $${budget.toFixed(2)}. Total Expenses: $${totalExpenses.toFixed(2)}`;
            }
        
    } catch (error) 
    {
        console.error('Error updating budget:', error);
        document.getElementById('budget-error').textContent = "Error updating budget: " + error;
    }
}

async function getTotalExpenses()
{
    //Access the database and return content with json file
    try 
    {
        const response = await fetch('/expenses');
        const expenses = await response.json();

        if(!response.ok)
        {
            throw new Error(`Error: ${response.status}`);
        }
        

        const total = expenses.reduce((accumulator, expense) => accumulator + expense.amount, 0);

        document.getElementById('total-expense').textContent = `Total Expenses: $${total.toFixed(2)}`;
        return total;
    } catch (error) 
    {
        console.error('Error calculating total expenses:', error);
        document.getElementById('total-expense').textContent = "Error calculator total expenses: " + error;
        return 0;
    }
}



//Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchExpenses();
    updateBudget();
});





