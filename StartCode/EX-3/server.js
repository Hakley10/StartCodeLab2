const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    console.log(`Received ${method} request for ${url}`);

    if (url === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Welcome to the Home Page');
    }

    if (url === '/contact' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`
            <form method="POST" action="/contact">
                <input type="text" name="name" placeholder="Your name" required />
                <button type="submit">Submit</button>
            </form>
        `);
    }

    if (url === '/contact' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const parsedData = new URLSearchParams(body);
            const name = parsedData.get('name')?.trim();

            // ✅ Validate name is not empty
            if (!name) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                return res.end(`<h2>Name is required. Please go back and try again.</h2>`);
            }

            // ✅ Create a new submission object
            const submission = { name, time: new Date().toISOString() };

            // ✅ Load existing data or initialize an empty array
            fs.readFile('submissions.json', 'utf8', (err, data) => {
                let submissions = [];

                if (!err && data) {
                    try {
                        submissions = JSON.parse(data);
                    } catch (e) {
                        console.error('Error parsing existing submissions:', e);
                    }
                }

                // ✅ Add new submission
                submissions.push(submission);

                // ✅ Save updated array to the JSON file
                fs.writeFile('submissions.json', JSON.stringify(submissions, null, 2), err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        return res.end('Error saving your submission.');
                    }

                    // ✅ Send back confirmation as HTML
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                            <head><title>Thank You</title></head>
                            <body>
                                <h2>Thank you, ${name}!</h2>
                                <p>Your submission was received successfully.</p>
                                <a href="/contact">Submit another</a>
                            </body>
                        </html>
                    `);
                });
            });
        });

        return;
    }

    // Fallback for undefined routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
});

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
