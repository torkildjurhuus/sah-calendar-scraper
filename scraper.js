const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

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

    const ref = db.ref('calendar');
    ref.set(allData, (error) => {
        if (error) {
            console.log("Data could not be saved:", error);
        } else {
            console.log("Data saved successfully!");
        }
    });
};

axios.get(targetURL).then((response) => {
    const body = response.data;
    const $ = cheerio.load(body);
    getSchedule($);
});
