# myBooks
This is a simple command line app using Google Books API. You can search and add books to a reading list. The reading list is stored locally and will not be lossed when the app closes.

## Installation
Download or clone the git repo. Open up a terminal and navigate to the project folder myBooks. This application uses the axios library so you'll have to run:
```
npm install
```
Once the installation is complete, all we have to do is start the application by running:
```
node myBooks.js
```

## Resetting Reading List
The reading list uses fs.writeFileSync to add book information to the readingList.json file. If you'd like to reset your reading list, start the app and from the main menu run:
```
*reset
```
