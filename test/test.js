var assert = require('assert')
var expect = require('expect.js')
const { queryBooks, 
    start, 
    listQueryResults, 
    selectBookFromQuery, 
    showReadingList, 
    isDefaultInput} = require('../myBooks.js')
describe("Menu isDefaultInput()", function(){
    it("return true if valid default option", function(){
        expect(isDefaultInput("*search")).to.be(true)
        expect(isDefaultInput("*home")).to.be(true)
        expect(isDefaultInput("*reset")).to.be(true)
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
    it("it should return nothing if the earch result is empty", async function (){
        const books = await queryBooks("jkewfkewjbfgwejgbfwre")
        expect(books).to.be(undefined)
    })
    
})

describe("Select Books selectBookFromQuery()"), function () {
    it("Should add a book to the reading list when a valid number is entered", async function (){
        const books = await queryBooks("Hey")
        selectBookFromQuery(1)
    } )
}