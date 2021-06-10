
const axios = require('axios');

async function searchBooks(query){
    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
        // console.log(response.data.items[0].volumeInfo)
        return response.data.items
    } catch (error) {
        console.log(error)
        console.log(error.response.body);
    }
};





module.exports = {searchBooks}