var assert = require('assert')
var expect = require('expect.js')
const fs = require('fs');
const fsPromises = require('fs').promises;
const { queryBooks, 
    parseBookData,
    isDefaultInput,
    selectBookFromQuery,
    addToReadingList,
    getReadingList,
    resetReadingList
} = require('../myBooks.js')

describe("Menu isDefaultInput()", function(){
    it("return true if valid default option", function(){
        expect(isDefaultInput("*search")).to.be(true)
        expect(isDefaultInput("*home")).to.be(true)
        
    })
    it("Should return false if not a default option", function () {
        expect(isDefaultInput("1")).to.be(false)
        expect(isDefaultInput(" ")).to.be(false)
        expect(isDefaultInput("hello")).to.be(false)
    })
})

describe("Books queryBooks()", function () {
    it("should return an array with results, max length of 5", async function () {
        const books = await queryBooks("Hey")
        expect(books.length).to.be(5)
        
    })
    it("it should return nothing if the search result is empty", async function (){
        const books = await queryBooks("jkewfkewjbfgwejgbfwre")
        expect(books).to.be(undefined)
    })
    
})
describe("Pasrse Data parseBookData()", function () {
    it("should return an object", async function () {
        const books = await queryBooks("Star Trek")
        const book = books[0].volumeInfo
        const data = parseBookData(book)
        expect(data).to.be.an("object")

    })
    it("The object returned should have title, authors, and publisher", async function () {
        const books = await queryBooks("Star Trek")
        const book = books[0].volumeInfo
        const data = parseBookData(book)
        expect(data).to.have.key("title")
        expect(data).to.have.key("authors")
        expect(data).to.have.key("publisher")
    })
    it("should be able to handle edge case of having no auhtor or publisher", function (){
        const book = {
            title: "Everyman",
            author: undefined,
            publish: undefined
        }
        const data = parseBookData(book)
        expect(data.title).to.be("Everyman")
        expect(data.authors).to.be("Unknown")
        expect(data.publisher).to.be("Unknown")
    })
    it("should return false if title undefined", function () {
        const book = {
            title: undefined,
            author: undefined,
            publish: undefined
        }
        const data = parseBookData(book)
        expect(data).to.be(false)
    })

})

describe("Select Book selectBookFromQuery()", function () {
    it("should throw error message if invalid input", function () {
        
        expect(() => (selectBookFromQuery("8"))).to.throwError(new Error(`I'm sorry "8" doesn't seem to be in your current search, please try again`))
        expect(() => (selectBookFromQuery("Picard"))).to.throwError(new Error(`I'm sorry "Picard" doesn't seem to be in your current search, please try again`))
    })
})

describe("Get Reading List getReadingList()", function () {
    it("should reset the list when formatted incorrectly", async function () {
        fs.writeFileSync('readingList.json', JSON.stringify('{{{}}}'))
        setTimeout(async () => {
            const list = await getReadingList()
            expect(list).to.be.an('array')
        }, 200)
    })
    it("should return an array", async function () {
        const list = await getReadingList()
        expect(list).to.be.an('array')
    })
    it("should return an array of book objects", async function () {
        const books = await queryBooks("Star Trek")
        const book = books[0].volumeInfo
        const data = parseBookData(book)

        const list = await getReadingList()
        if (list.length === 0) {
            list.push(data)
        }
        expect(list).to.be.an('array')
        expect(list[0]).to.be.an('object')

    })
})

describe("Add To Reading List addToReadingList()", function () {
    it("should reset the reading list if formatted incorrectly and add book", async function(){
        fs.writeFileSync('readingList.json', JSON.stringify(''))
        const books = await queryBooks("Star Trek")
        const book = books[0].volumeInfo
        const data = parseBookData(book)
        addToReadingList(data)
        setTimeout(async () => {
            const list = await getReadingList()
            expect(list).to.be.an('array')
        }, 100)
    })
    it("should add book to reading list", async function () {
        const books = await queryBooks("Star Trek")
        const book = books[0].volumeInfo
        const data = parseBookData(book)
        addToReadingList(data)
        
        const list = await getReadingList()
        expect(list[list.length - 1].title).to.be(data.title)
        expect(list[list.length - 1].authors.toString()).to.be(data.authors.toString())
        expect(list[list.length - 1].publisher).to.be(data.publisher)
    })
    
})

describe("Reset List resetReadingList()", function(){
    it("should reset the reading list to an empty array", async function(){
        resetReadingList()
        const list = await getReadingList()
        expect(list).to.be.an('array')
        expect(list.length).to.be(0)
    })
})








