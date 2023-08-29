# Web Scraper for My Daughter's Homework

## Overview

This is a specialized Node.js application designed to scrape my daughter's homework schedule from a specific webpage and store it in a Firebase Realtime Database. The scraping process is automated and runs every 30 minutes using GitHub Actions.

## Features

- **Data Scraping**: Utilizes `axios` for making GET requests to fetch HTML data from a specific URL. Employs `cheerio` to parse HTML and extract relevant data such as day names, dates, and events.

- **Data Storage**: The scraped data is stored in a Firebase Realtime Database, allowing for real-time updates and easy data retrieval.

- **Automation**: The scraper is set up to run automatically every 30 minutes using GitHub Actions. This ensures that the database is consistently up-to-date without manual intervention.

## Technologies Used

- Node.js
- axios
- cheerio
- Firebase Realtime Database
- GitHub Actions

## Sample Data Schema

The data is stored in Firebase in the following JSON format:

```json
{
  "weekSchedule": [
    {
      "dayname": "Monday",
      "date": "29th August",
      "title": "Event Title",
      "content": "Event content"
    }
  ],
  "tableSchedule": [
    {
      "time": "09:00",
      "Monday": "Math",
      "Tuesday": "English",
      "Wednesday": "Science"
    }
  ]
}
