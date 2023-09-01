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
const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

function cleanString(str) {
    return str.replace(/\s+/g, ' ').replace(/\t+/g, '').trim();
}

function sortKeys(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {});
}

function hashObject(obj) {
    const clone = JSON.parse(JSON.stringify(obj));
    delete clone.lastUpdated;
    const str = JSON.stringify(clone);
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

const targetURL = 'https://sah.fo/?p=579';

const getSchedule = async ($) => {
    const weekNumber = cleanString($('h4.week_number').text().trim());
    const days = $('ul.schedule li.day');
    const dayData = [];
    const tableData = [];

    days.each((index, element) => {
        const day = {};
        day.weekNumber = weekNumber;
        day.dayname = cleanString($(element).find('h6.dayname').text().trim());
        day.date = cleanString($(element).find('div.date').text().trim());
        day.title = cleanString($(element).find('div.title').text().trim());
        day.content = cleanString($(element).find('div.content').text().trim());
        if (day.dayname || day.date || day.title || day.content) {
            dayData.push(sortKeys(day));  // Sort the keys before pushing
        }
    });

    const tableRows = $('#ease_contentitem_4375 table tbody tr');
    tableRows.each((index, row) => {
        const rowData = {};
        const cells = $(row).find('td');
        cells.each((cellIndex, cell) => {
            const cellContent = cleanString($(cell).text().trim());
            if (cellIndex === 0) {
                rowData.time = cellContent;
            } else {
                const dayName = cleanString($(tableRows.eq(0).find('td').eq(cellIndex)).text().trim());
                rowData[dayName] = cellContent;
            }
        });
        if (Object.keys(rowData).length > 1) {
            tableData.push(sortKeys(rowData));  // Sort the keys before pushing
        }
    });

    const allData = {
        weekSchedule: dayData,
        tableSchedule: tableData,
        lastUpdated: formattedDate
    };

    const ref = db.ref('calendar');
    const snapshot = await ref.once('value');
    const prevData = snapshot.val() || {};

    const newHash = hashObject(allData);
    const  oldHash = hashObject(prevData);


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
