const {searchBooks} = require('./util')
const fs = require('fs');


const menu = ["[1]: Search for a Book", "[2]: Reading List", "[3]: Exit"] 
let currentPage = "main"

const myList = {}
let index = 1
let currentSearch = {};

const getInput = (context) => {
    const standard_input = process.stdin;
    standard_input.setEncoding('utf-8');
    standard_input.on('data', function (data) {
        const entry = data.split('\n')[0]
        selectMenu(entry)
        queryBooks(entry)
        listingsMenu(entry)
        if(entry === "*home"){
            mainMenu()
            currentPage = "main"
        }
        
    })
    return;
}


const mainMenu = () => {
    
    console.log("Please select an option by entering the corresponding number")
    menu.forEach(option => console.log(option))
    
}

const selectMenu = (data) => {
    if(currentPage != "main") return;
    if (data === '*home') return;
    if (data === 'reset') {
        console.log("resetting reading list...")
        reset()
        console.log("------------------------------")
        mainMenu()
        return;
    }
    switch (+data) {
        case 1:
            searchForBooks()
            setTimeout(() => {
                currentPage = "search"
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
const queryBooks = (data) => {
    if (currentPage != "search" || data === "*home") return;
    const query = data.split(' ').join('+')
    searchBooks(query).then(books => {
        listBooks(books, query)
    })
}
const searchForBooks = () => {
    
    console.log("Search for a book or books, to exit back to home, enter *home")
    
}

const listBooks = (books, query) => {
    if(books === undefined){
        console.log(`Sorry there are no results for...`)
        console.log(query)
        console.log("Please try searching for something else")
        console.log("-----------------------")
        searchForBooks()
        return;
    }
    const results = {}

    console.log("RESULTS")
    for(let i = 0; i < books.length && i < 5; i++){
        const book = books[i].volumeInfo
        results[i + 1] = {
                title: book.title,
                authors: book.authors,
                publisher: book.publisher,
        }
        
        console.log(i + 1)
        Object.keys(results[i + 1]).forEach(key => console.log('\x1b[36m%s\x1b[0m', `${key}: ${results[i + 1][key]}`))
        console.log("----------------------")
    }
    currentSearch = results
    console.log("If you would like to save a book to your list")
    console.log("please enter the corresponding number of which book you would like to save.")
    console.log("----------------")
    console.log("To search again please type in 'search'")
    console.log("To go back to the main menu please type in *home")
    currentPage = "listings"
}

const listingsMenu = (data) => {
    if(currentPage != "listings") return;
    
    if ( data === 'search'){
        searchForBooks();
        setTimeout(() => {
            currentPage = 'search'
        }, 100)
        return;
    }
    const id = +data
    if(currentSearch[id] != undefined){
        myList[index] = currentSearch[id]
        index++
        for (i = 0; i < 3; i++) { console.log("-----------------------------------------------------------")}
        console.log('\x1b[33m%s\x1b[0m', `${currentSearch[id].title} added to your reading list`)
        for (i = 0; i < 3; i++) { console.log("-----------------------------------------------------------") }
        fs.readFile("readingList.json", (err, data) => {
            if (err) {
                throw err;
            }
            const content = JSON.parse(data);
            content.push(currentSearch[id])
            fs.writeFileSync('readingList.json', JSON.stringify(content))
            
        })
        ;
        setTimeout(() => {
            mainMenu()
            currentPage = "main"
        }, 1000)
        
    }else{
        console.log(`I'm sorry ${id} doesn't seem to be in your current search, please try again`)
    }
}

const showReadingList = () => {
    console.log("READING LIST")
    console.log("-----------------------------------------------------------")
    fs.readFile("readingList.json", (err, data) => {
        if (err) {
            throw err;
        }
        const content = JSON.parse(data);
        for(i = 0; i < content.length; i++){
            const book = content[0]
            console.log(i + 1)
            Object.keys(content[i]).forEach(key => console.log(`${key}: ${content[i][key]}`))
            console.log("----------------------")
        }

        
    })

    // console.log(myList)
    setTimeout(() => {
        mainMenu()

    }, 500)

    
    
}

const reset = () => {
    fs.writeFileSync('readingList.json', JSON.stringify([]))
}

const start = () => {
    
    for (i = 0; i < 3; i++) {
            console.log("-----------------------------------------------------------")
    }
    
    console.log("\x1b[0m", "Welcome to myBooks, a simple app using Google books api!")
    for (i = 0; i < 3; i++) {
        console.log("-----------------------------------------------------------")
    }
    
        
    mainMenu()
    getInput()
    
    
}

// searchBooks("Harry+Potter").then(books => console.log(books[0]))
start()