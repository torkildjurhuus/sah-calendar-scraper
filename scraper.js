const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const targetURL = 'https://sah.fo/?p=579';

const getSchedule = ($) => {
    const weekNumber = $('h4.week_number').text().trim();
    const days = $('ul.schedule li.day');
    const dayData = [];
    const tableData = [];

    days.each((index, element) => {
        const day = {};
        day.weekNumber = weekNumber;
        day.dayname = $(element).find('h6.dayname').text().trim();
        day.date = $(element).find('div.date').text().trim();
        day.title = $(element).find('div.title').text().trim();
        day.content = $(element).find('div.content').text().trim();
        if (day.dayname || day.date || day.title || day.content) {
            dayData.push(day);
        }
    });

    // Scrape the table
    const tableRows = $('#ease_contentitem_4375 table tbody tr');
    tableRows.each((index, row) => {
        const rowData = {};
        const cells = $(row).find('td');

        cells.each((cellIndex, cell) => {
            const cellContent = $(cell).text().trim();
            if (cellIndex === 0) {
                rowData.time = cellContent;
            } else {
                const dayName = $(tableRows.eq(0).find('td').eq(cellIndex)).text().trim();
                rowData[dayName] = cellContent;
            }
        });

        if (Object.keys(rowData).length > 1) { // Skip empty or incomplete rows
            tableData.push(rowData);
        }
    });

    const allData = {
        weekSchedule: dayData,
        tableSchedule: tableData
    };

    fs.writeFile('calendar.json', JSON.stringify(allData, null, 2), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Data written to file successfully!');
    });
};

axios.get(targetURL).then((response) => {
    const body = response.data;
    const $ = cheerio.load(body);
    getSchedule($);
});
