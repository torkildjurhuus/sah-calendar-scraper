# Web Scraper for my daughters homework

## Overview

This project is a Node.js application designed to scrape my daughters homework from a targeted webpage. It uses `axios` for HTTP requests and `cheerio` for parsing the HTML data.

## Features

- Utilizes `axios` to make GET requests to fetch HTML data from a specified URL.
- Employs `cheerio` to parse HTML and extract relevant data such as day names, dates, and events.
- Stores the scraped data in a JSON file named `calendar.json`.

## Technologies Used

- Node.js
- axios
- cheerio
- fs (Node.js File System module)

## How to Use

1. Clone the repository.
2. Navigate to the project directory.
3. Run `yarn install` to install the dependencies.
4. Run `node <your-scraper-file-name>.js` to execute the scraper.

### Sample Data Schema

The data is scraped and stored in the following JSON format:

\```json
[
  {
    "dayname": "Monday",
    "date": "29th August",
    "title": "Event Title",
    "content": "Event content"
  }
]
\```

