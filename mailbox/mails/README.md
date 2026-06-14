# Adding Mailbox Transmissions

Add a new `.json` file in this folder, then add its filename to `manifest.json`.

Each file should use this shape:

```json
{
  "id": 6,
  "sender": "ops@dbc.gov",
  "date": "2046-03-01 09:00",
  "subject": "[CLASSIFIED] New Mutation Report",
  "preview": "Short inbox preview text.",
  "drop": "Optional drop window",
  "bodyHtml": "<p>Your message body can use simple HTML.</p>",
  "images": [
    {
      "src": "img/example.png",
      "alt": "Evidence image",
      "captionHtml": "Optional caption."
    }
  ]
}
```

Images are resolved from `mailbox/index.html`, so existing mailbox images use paths like `img/chablis.png`.
