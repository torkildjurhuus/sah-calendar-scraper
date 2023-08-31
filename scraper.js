const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const crypto = require('crypto');

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

function hashObject(obj) {
    const clone = JSON.parse(JSON.stringify(obj));
    delete clone.lastUpdated; // Remove the lastUpdated field
    const str = JSON.stringify(clone);
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

const targetURL = 'https://sah.fo/?p=579';

const getSchedule = async ($) => {
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
        if (Object.keys(rowData).length > 1) {
            tableData.push(rowData);
        }
    });

    const allData = {
        weekSchedule: dayData,
        tableSchedule: tableData,
        lastUpdated: new Date().toISOString()
    };

    const ref = db.ref('calendar');
    const snapshot = await ref.once('value');
    const prevData = snapshot.val() || {};

    const newHash = hashObject(allData);
    const oldHash = hashObject(prevData);

    if (newHash !== oldHash) {
        ref.set(allData, (error) => {
            if (error) {
                console.log("Data could not be saved:", error);
            } else {
                console.log("Data saved successfully!");
            }
            admin.app().delete();
        });
    } else {
        console.log("No changes in the data. Not updating.");
        admin.app().delete();
    }
};

axios.get(targetURL).then((response) => {
    const body = response.data;
    const $ = cheerio.load(body);
    getSchedule($);
});
