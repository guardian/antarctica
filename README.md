# Antarctica embeddable widget

Embeddable trip status widget

## What is it?
Tracks the journey of Guardian journalists on their voyage to Antarctica via an embeddable widget.
Uses an `<iframe>` to embed the widget in a live-blog or article.

### Embed code
```html
    <iframe src="http://interactive.guim.co.uk/embed/antarctica-2013/" style="width: 100%; height: 560px; overflow: hidden;" seamless frameborder="0" scrolling="no"></iframe>
````

### Customising the widget
To choose a specific update to show add the query string `update_id` and the desired entry to show.

`http://interactive.guim.co.uk/embed/antarctica-2013/?update_id=2`

There is a customise widget page that will generate the updated embed code: http://interactive.guim.co.uk/embed/antarctica-2013/embed.html

## Where's the data coming from?
A Google spreadsheet: https://docs.google.com/a/guardian.co.uk/spreadsheet/ccc?key=0AkRR3zKqdlUHdDI1NzZ2RVJSdGNOek9WWTdiUUxyTEE

The spreadsheet is converted into JSONP and uploaded to S3 every minute.

The JSONP feed is located at http://interactive.guim.co.uk/spreadsheetdata/0AkRR3zKqdlUHdDI1NzZ2RVJSdGNOek9WWTdiUUxyTEE.jsonp
