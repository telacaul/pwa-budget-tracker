// create variable to hold db connection
let db;

// establish a connection to IndexedDB database
const request = indexedDB.open('budget_tracker', 1);


request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table) called 'new_budget'
    db.createObjectStore('new_budget', { autoIncrement: true });
};


// upon a success
request.onsuccess = function(event) {
    // when db is successfully created, save reference to db in global variable
    db = event.target.result;

    // check if app is online,
    if (navigator.onLine) {
        // insert function below
        budgetData()
    }
};


request.onerror = function(event) {
    console.log(event.target.errorCode);
};


// function to write data
function saveRecord(record) {
    // open a new transaction with the database with read and write
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object strore for 'new_budget'
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to store with add method
    budgetObjectStore.add(record);
}


// POST data to server
function budgetData() {
    // open a transaction on db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access you object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();


    getAll.onsuccess = function() {
        // if theres data in indexedDB's store, send to server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open one more transaction
                const transaction = db.transaction(['new_budget'], 'readwrite');
                
                // access the new_budget object store
                const budgetObjectStore = transaction.objectStore('new_budget');

                // clear all items in store
                budgetObjectStore.clear();

                alert('All budget data have been submited!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

}


// listen for app coming back online
window.addEventListener('online', budgetData);