// require the util for get requests and fs for file reading and writing
const {searchBooks} = require('./util')
const fs = require('fs');
const fsPromises = require('fs').promises;
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
    "To search again please type in '*search'",
    "To go back to the main menu please type in *home"
]

const PRINT_KEYS = ["title", "authors", "publisher"]

// CLI Colors
const yellow = '\x1b[33m%s\x1b[0m'
const cyan = '\x1b[36m%s\x1b[0m'
const red = '\x1b[31m%s\x1b[0m'
const white = '\x1b[37m%s\x1b[0m'

// Set current page to main for initial opening of app:
let current_page = "main"


let current_search = {};


const mainMenu = () => {
    MENU_OPTIONS.forEach(option => console.log(option))
    current_page = "main"
}

const isDefaultInput = (entry) => {
    if (entry === '*home'){
        mainMenu()
        return true;
    }
    if(entry === "*search") {
        searchForBooks()
        return true;
    }
    if (entry === '*reset') {
        console.log("resetting reading list...")
        resetReadingList()
        console.log(line_sm)
        mainMenu()
        return true;
    }
    return false;
}

const passUserInput = async (entry) => {
    switch (current_page) {
        case "main":
            selectMenu(entry)
            break;
        case "search":
            const books = await queryBooks(entry)
            listQueryResults(books, entry)
            break;
        case "query_results":
            try{
                selectBookFromQuery(entry)
            }catch(err){
                console.log(err)
            }
            break;
        default:
            break;
    }

}

const selectMenu = (data) => {
    switch (+data) {
        case 1: 
            searchForBooks()
            break;
        case 2:
            showReadingList()
            break;
        case 3:
            console.log("Thanks, have a wonderful day")
            readline.close();
            break;
        default:
            console.log("Please enter a valid option (1, 2, 3, *search)")
            break;
    }
    return;
}

const queryBooks = async (data) => {
    const query = data.split(' ').join('+')
    const books = await searchBooks(query).then(books => {
        if (checkValidResults(books, query)){
            const topFive = []
            books.forEach(book => {
                if(topFive.length === 5){
                    return;
                }
                if (book.volumeInfo.title != undefined) {
                    topFive.push(book)
                }
            })
            return topFive
        }
    })
    return books
}

const searchForBooks = () => {   
    console.log("Search for a book or books, to exit back to home, enter *home") 
    current_page = "search"
}

const checkValidResults = (books, query) => {
    if (books === undefined) {
        console.log(red, `Sorry there are no results for...`)
        console.log(yellow, query)
        console.log(red, "Please try searching for something else")
        console.log(line_sm)
        searchForBooks()
        return false;
    }
    return true;
}
const parseBookData = (book) => {
    if (book.title === undefined || book === undefined) {
        return false;
    }
    const data = {
        title: book.title,
        authors: (book.authors === undefined) ? "Unknown" : book.authors,
        publisher: (book.publisher === undefined) ? "Unknown" : book.publisher
    }
    return data
}
const printBookData = (book, index, color, color2) => {
    console.log(color2, index)
    PRINT_KEYS.forEach(key => {
        console.log(color, `${key}: ${book[key]}`)
    })
    console.log(line_sm)
}

const printBooks = (books, color1, color2) => {
    let index = 1
    const results = {}
    books.forEach(data => {
        let book_obj = false;
        if (data.volumeInfo){
            const book = data.volumeInfo
            book_obj = parseBookData(book)
        }else{
            book_obj = data
        }
        if (book_obj) {
            results[index] = book_obj
            printBookData(results[index], index, color1, color2)
            index += 1
        }
    })
    return results
}
const listQueryResults = (books, query) => {
    current_page = "query_results"
    console.log(`RESULTS for "${query}"`)

    const results = printBooks(books, cyan, yellow)
    current_search = results
    LIST_OPTIONS.forEach(line => console.log(line))
    
}

const printThreeLgLines = () => {
    for (i = 0; i < 3; i++) { console.log(line_lg)}
}

const selectBookFromQuery = (data) => {
    const id = +data
    if(current_search[id] != undefined){
        printThreeLgLines()
        console.log(yellow, `${current_search[id].title} added to your reading list`)
        printThreeLgLines()
        addToReadingList(current_search[id])
    }else{
        throw (new Error(`I'm sorry "${data}" doesn't seem to be in your current search, please try again`))
    }
}

const addToReadingList = async (book) => {
    const content = await getReadingList()
    content.push(book)
    fs.writeFileSync('readingList.json', JSON.stringify(content))
    setTimeout(() => {
        mainMenu()
    }, 1000)

}

const readingListError = () => {
    console.log(red, "There seems to be a pretty bad error with your reading list, were sorry about that...")
    console.log(red, "To try and fix please enter")
    console.log(yellow, "*reset")
    console.log(red, "at the main menu, you will lose your current reading list.")
    mainMenu()
    return;
}

const getReadingList = async () => {
    try{
        const content = await fsPromises.readFile("readingList.json", (err, data) => {
            if (err) {
                readingListError()
                return;
            } else {
                return data
            }
        })
        const data = JSON.parse(content)
        
        if(data instanceof Array){
            return data
        }else{
            resetReadingList()
            return []
            
        }
        
    } catch(e) {
        readingListError()
    } 
}

const showReadingList = async () => {
    const content = await getReadingList()
        .then(content => content)
        .catch((err) => {console.log(err)})
    
    console.log("READING LIST")
    console.log(line_lg)
    printBooks(content, yellow, white)

    setTimeout(() => {
        mainMenu()
    }, 500)
}

const resetReadingList = () => {
    return fs.writeFileSync('readingList.json', JSON.stringify([]))
}

const start = async () => {
    
    printThreeLgLines()
    console.log(cyan, "Welcome to myBooks, a simple app using Google books api!")
    printThreeLgLines()

    mainMenu()

    for await (const line of readline) {
        if (!isDefaultInput(line)){
            passUserInput(line)
        }
    }
    
}

start();

module.exports = { getReadingList, addToReadingList, parseBookData, queryBooks, listQueryResults, selectBookFromQuery, showReadingList, isDefaultInput }