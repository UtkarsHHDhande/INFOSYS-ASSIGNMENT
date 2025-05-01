const express = require('express');
const path = require('path');
const { findCollaborations, competitors, targetCompany } = require('./scraper');
const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const port = 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse query parameters
app.use(express.urlencoded({ extended: true }));

// Route to display collaborations
app.get('/', async (req, res) => {
    try {
        const collaborations = await findCollaborations(competitors, targetCompany);
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const startIndex = (page - 1) * perPage;
        const endIndex = page * perPage;
        const paginatedCollaborations = collaborations.slice(startIndex, endIndex);
        const totalPages = Math.ceil(collaborations.length / perPage);

        res.render('index', { collaborations: paginatedCollaborations, currentPage: page, totalPages: totalPages });
    } catch (error) {
        console.error('Error fetching collaborations:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to export as CSV
app.get('/export-csv', async (req, res) => {
    try {
        const collaborations = await findCollaborations(competitors, targetCompany);
        const csvWriterInstance = csvWriter({
            path: 'collaborations.csv',
            header: [
                { id: 'competitor', title: 'Competitor' },
                { id: 'title', title: 'Title' },
                { id: 'link', title: 'Link' },
                { id: 'snippet', title: 'Snippet' }
            ]
        });

        await csvWriterInstance.writeRecords(collaborations);
        res.download('collaborations.csv', 'collaborations.csv', (err) => {
            if (err) {
                console.error('Error downloading CSV:', err);
                res.status(500).send('Error downloading CSV');
            }
            fs.unlinkSync('collaborations.csv'); // Remove the file after download
        });
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to export as JSON
app.get('/export-json', async (req, res) => {
    try {
        const collaborations = await findCollaborations(competitors, targetCompany);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=collaborations.json');
        res.send(JSON.stringify(collaborations, null, 2));
    } catch (error) {
        console.error('Error exporting JSON:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});