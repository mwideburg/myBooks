// require the util for get requests and fs for file reading and writing
const {searchBooks} = require('./util')
const fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Create menu option arrays to iterate through with line options to print
const line_lg = "-----------------------------------------------------------"
const line_sm = "------------------------------"

const MENU_OPTIONS = [
    "Please select an option by entering the corresponding number",
    "[1]: Search for a Book", 
    "[2]: Reading List", 
    "[3]: Exit"]

const LIST_OPTIONS = [
    "If you would like to save a book to your list", 
    "please enter the corresponding number of which book you would like to save.",
    line_sm,
    "To search again please type in 'search'",
    "To go back to the main menu please type in *home"
]

const PRINT_KEYS = ["title", "authors", "publisher"]

// CLI Colors
const yellow = '\x1b[33m%s\x1b[0m'
const cyan = '\x1b[36m%s\x1b[0m'
const red = '\x1b[31m%s\x1b[0m'


// Set current page to main for initial opening of app:
let current_page = "main"


let current_search = {};


function getUserInput(){
    readline.question('', entry => {
        checkInput(entry)
    });
}


const mainMenu = () => {
    MENU_OPTIONS.forEach(option => console.log(option))
    getUserInput()
   
}
const checkInput = (entry) => {
    if (entry === '*home'){
        mainMenu() 
        current_page = "main"
        return;
    }
    if(entry === "*search") {
        searchForBooks()
        current_page = "search"
        return;
    }
    if (entry === '*reset') {
        console.log("resetting reading list...")
        resetReadingList()
        console.log(line_sm)
        mainMenu()
        return;
    }

    switch (current_page) {
        case "main":
            selectMenu(entry)
            break;
        case "search":
            queryBooks(entry)
            break;
        case "query_results":
            selectBookFromQuery(entry)
            break;
        default:
            break;
    }
    return;
}

const selectMenu = (data) => {
    switch (+data) {
        case 1:
            setTimeout(() => {
                searchForBooks()
                current_page = "search"
            }, 200)
           
            break;
        case 2:
            showReadingList()
            break;
        case 3:
            console.log("Thanks, have a wonderful day")
            readline.close();
            break;
        default:
            console.log("Please enter a valid option (1, 2 or 3)")
            break;
    }
    return;
}


const queryBooks = (data) => {
    const query = data.split(' ').join('+')
    searchBooks(query).then(books => {
        listQueryResults(books, query)
    })
}

const searchForBooks = () => {   
    console.log("Search for a book or books, to exit back to home, enter *home")
    getUserInput() 
}


const listQueryResults = (books, query) => {
    current_page = "query_results"
    getUserInput()

    if(books === undefined){
        console.log(red,`Sorry there are no results for...`)
        console.log(yellow, query)
        console.log(red, "Please try searching for something else")
        console.log(line_sm)
        searchForBooks()
        return;
    }

    const results = {}

    console.log("RESULTS")
    
    let current_size = 0
    let i = 0;

    while( i < books.length && current_size < 5){
        
        const book = books[i].volumeInfo
        if(book.title != undefined && book != undefined){
            
            results[current_size + 1] = {
                title: book.title,
                authors: (book.authors === undefined) ? "Unknown" : book.authors,
                publisher: (book.publisher === undefined) ? "Unknown" : book.publisher
            }

            console.log(current_size + 1)
            PRINT_KEYS.forEach(key => {
                console.log(cyan, `${key}, ${results[current_size + 1][key]}`)
            })
            console.log(line_sm)
            current_size += 1
        }
        i += 1
    }

    current_search = results
    LIST_OPTIONS.forEach(line => console.log(line))
    
}


const selectBookFromQuery = (data) => {
    
    const id = +data
    if(current_search[id] != undefined){
        for (i = 0; i < 3; i++) { console.log(line_lg)}
        console.log(yellow, `${current_search[id].title} added to your reading list`)

        for (i = 0; i < 3; i++) { console.log(line_lg) }
        
        fs.readFile("readingList.json", (err, data) => {
            if (err) {
                console.log(red, "There seems to be a pretty bad error with your reading list, were sorry about that...")
                console.log(red, "To try and fix please enter")
                console.log(yellow, "*reset")
                console.log(red, "at the main menu, you will lose your current reading list.")
            }else{
                const content = JSON.parse(data);
                content.push(current_search[id])
                fs.writeFileSync('readingList.json', JSON.stringify(content))
            }
            setTimeout(() => {
                mainMenu()
                current_page = "main"
            }, 1000)
            
        });
    }else{
        // error message
        console.log(`I'm sorry "${data}" doesn't seem to be in your current search, please try again`)
        getUserInput()
    }
}

// Prints out the reading list
const showReadingList = () => {
    // Reads the file and prints out each item in the json object
    fs.readFile("readingList.json", (err, data) => {
        if (err) {
            console.log(red, "There seems to be a pretty bad error with your reading list, were sorry about that...")
            console.log(red, "To try and fix please enter")
            console.log(yellow, "*reset")
            console.log(red, "at the main menu, you will lose your current reading list.")
            mainMenu()
            return;
            // throw err;
        }else{
            if(data.length === 0){
                resetReadingList()
                showReadingList()
                return;
            }
            
            const content = JSON.parse(data);
            console.log("READING LIST")
            console.log(line_lg)
            for(i = 0; i < content.length; i++){
                const book = content[0]
                // We don't want the numbering to start at index 0, so we add 1 to start at 1
                console.log(i + 1)
                PRINT_KEYS.forEach(key => console.log(yellow, `${key}: ${content[i][key]}`))
                console.log(line_sm)
            }
            setTimeout(() => {
                mainMenu()
            }, 500)
        }
    }) 
}

const resetReadingList = () => {
    fs.writeFileSync('readingList.json', JSON.stringify([]))
}


const start = () => {
    for (i = 0; i < 3; i++) {
        console.log(line_lg)
    }
    console.log(cyan, "Welcome to myBooks, a simple app using Google books api!")
    for (i = 0; i < 3; i++) {
        console.log(line_lg)
    } 
    mainMenu()
    
}

// Start the app
start()