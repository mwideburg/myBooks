// require the util for get requests and fs for file reading and writing
const {searchBooks} = require('./util')
const fs = require('fs');

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
    // we will keep track of which page we are on in order to keep out input open
    // and based on which page we are on we will use those conditionals to create our
    // console output
let current_page = "main"

// Keep a history of what was last searched to add to the reading list if the user chooses
let current_search = {};


const getInput = () => {
    // get user input
    const standard_input = process.stdin;
    standard_input.setEncoding('utf-8');
    standard_input.on('data', function (data) {
        // don't record enter
        const entry = data.split('\n')[0]

        // We will only end up checking current_page, but initialize all the options
        selectMenu(entry)
        queryBooks(entry)
        listingsMenu(entry)
        
        // Our home entry to get back to main menu
        if(entry === "*home"){
            mainMenu()
            current_page = "main"
        }
        
    })
    return;
}


const mainMenu = () => {
    MENU_OPTIONS.forEach(option => console.log(option))
}

// Listen for user selection on main menu
const selectMenu = (data) => {
    if(current_page != "main") return;
    if (data === '*home') return;

    // Reset the reading list
    if (data === 'reset') {
        console.log("resetting reading list...")
        reset()
        console.log(line_sm)
        mainMenu()
        return;
    }

    switch (+data) {
        case 1:
            searchForBooks()
            setTimeout(() => {
                current_page = "search"
            }, 100)
            break;
        case 2:
            showReadingList()
            break;
        case 3:
            console.log("Thanks, have a wonderful day")
            process.exit()
        
        default:
            console.log("Please enter a valid option (1, 2 or 3)")
            break;
    }
    return;
}

// Query for books using user input
const queryBooks = (data) => {
    // return if not on search page or input is *home
    if (current_page != "search" || data === "*home") return;

    // Queries must be in certain format for spaces
    const query = data.split(' ').join('+')

    // Async function search books from util
    searchBooks(query).then(books => {
        // print out results and continue
        listBooks(books, query)
    })
}

//Simple search for books dialogue
const searchForBooks = () => {   
    console.log("Search for a book or books, to exit back to home, enter *home")
}

// Lists the search results
const listBooks = (books, query) => {

    // No results error message
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
    // There are some weird undefined books that slip through the api, this is what I used to work around those
    // undefined title or authors:
        // We'll use the current_size as the actual result counter
        // We'll use i to iterate through the Books
        // Once i is over books.length or the current size is 5 we'll stop the loop
    let current_size = 0
    let i = 0;

    while( i < books.length && current_size < 5){
        
        const book = books[i].volumeInfo
        // We'll only add the book if title is defined
        if(book.title != undefined && book != undefined){
            // We dont want the inputs to start at 0, 1 looks better, and
            // will work well when the user selects to add to reading list
            results[current_size + 1] = {
                title: book.title,
                //Ternary to put unknown instead of undefined
                authors: (book.authors === undefined) ? "Unknown" : book.authors,
                publisher: (book.publisher === undefined) ? "Unknown" : book.publisher
            }

            // Print what was added to results, this will end up becoming the search history,
            // So just to make sure, lets print what we just added and not the book itself
            console.log(current_size + 1)
            // Print each key in color cyan
            PRINT_KEYS.forEach(key => {
                console.log(cyan, `${key}, ${results[current_size + 1][key]}`)
            })
            console.log(line_sm)
            current_size += 1
            
        }
        i += 1
    }

    // set current_search as the results we just printed
    current_search = results

    // List the options
    LIST_OPTIONS.forEach(line => console.log(line))
    // Set the next page to listings
    current_page = "listings"
}

// Gets the input after search to write to reading list or go back to search/home
const listingsMenu = (data) => {
    if(current_page != "listings") return;
    
    
    if ( data === 'search'){
        searchForBooks();
        setTimeout(() => {
            // we want a little delay so the input is not carried through
            current_page = 'search'
        }, 100)
        return;
    }
    // Get the input, if valid, write the book to the file, else send error message
    const id = +data

    if(current_search[id] != undefined){
        // create some nice spacing to view the book selected
        for (i = 0; i < 3; i++) { console.log(line_lg)}
        // Let user know which book they selected
        console.log(yellow, `${current_search[id].title} added to your reading list`)

        for (i = 0; i < 3; i++) { console.log(line_lg) }
        // Read the file, parse it into a json object, this is an array as of now, and then
        // push the knew content into that array from the current_search
        fs.readFile("readingList.json", (err, data) => {
            if (err) {
                console.log(red, "There seems to be a pretty bad error with your reading list, were sorry about that...")
                console.log(red, "To try and fix please enter")
                console.log(yellow, "reset")
                console.log(red, "at the main menu, you will lose your current reading list.")
                mainMenu()
                current_page = "main"
                return;
                // throw err;
            }else{
                const content = JSON.parse(data);
                content.push(current_search[id])
                fs.writeFileSync('readingList.json', JSON.stringify(content))
                setTimeout(() => {
                    mainMenu()
                    current_page = "main"
                }, 1000)
            }
            
        });

        // Delay a little before the menu pops back up
        
        
    }else{
        // error message
        console.log(`I'm sorry ${id} doesn't seem to be in your current search, please try again`)
    }
}

// Prints out the reading list
const showReadingList = () => {
    

    // Reads the file and prints out each item in the json object
    fs.readFile("readingList.json", (err, data) => {
        if (err) {
            console.log(red, "There seems to be a pretty bad error with your reading list, were sorry about that...")
            console.log(red, "To try and fix please enter")
            console.log(yellow, "reset")
            console.log(red, "at the main menu, you will lose your current reading list.")
            mainMenu()
            return;
            // throw err;
        }else{
            if(data.length === 0){
                reset()
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

    // print out main menu after slight delay
    

    
}

// reset the reading file, more for my testing, but still handy
const reset = () => {
    fs.writeFileSync('readingList.json', JSON.stringify([]))
}

// first we print welcome message, then the menu, and then we enable the user input
const start = () => {
    for (i = 0; i < 3; i++) {
        console.log(line_lg)
    }
    console.log(cyan, "Welcome to myBooks, a simple app using Google books api!")
    for (i = 0; i < 3; i++) {
        console.log(line_lg)
    } 
    mainMenu()
    getInput()
}

// Start the app
start()