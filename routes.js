const express = require('express');
const fs = require('fs');
const { google } = require('googleapis');
const router = express.Router();

router.get('/events', async (req, res) => {
  try {
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]
    );

    const token = JSON.parse(fs.readFileSync('token.json'));
    oAuth2Client.setCredentials(token);

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    res.json(events.data.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
