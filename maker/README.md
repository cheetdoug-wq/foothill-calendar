# Cheet's Press calendar maker

Makes one customer's calendar from their order.

## Setup (once per machine)
    cd maker && npm install && pip install playwright && python3 -m playwright install chromium

## Make a calendar
1. Write `orders/CP-XXXX.json` (orders/ is not committed, it has customer info):

```json
{
  "order": "CP-1114868",
  "forName": "Mom",
  "months": ["2027-01", "2027-02", "2027-03"],
  "dates": [{"month": "2027-01", "day": 9, "label": "Grandma's birthday"}],
  "funDays": true,
  "hideNamesOnline": false,
  "overrides": {
    "2027-01": {
      "weeks": [{"title": "Snow Day Week", "sub": "Custom line", "style": "6"}],
      "fun": {"12": ["Pancake Day", "Pancakes for dinner."]}
    }
  }
}
```
   - `funDays: false` = only real holidays and the customer's dates.
   - `hideNamesOnline: true` = the online pages say "Your calendar" and "Special day" instead of names.
   - `overrides` = for customers who described their months. `style` is the scene: 1 oak meadow, 1s spring, 1u summer, 2 turkeys at golden hour (2s, 2u), 3 sunset hawk over the river, 4 frosty morning (4s misty spring), 5 night river with otter and meteors, 6 snowy solstice, 7 full moon cabin and owl, 8 fireworks and fox.
2. `node make.js orders/CP-XXXX.json` -> writes `../o/<slug>/index.html` (online animations) and `out/<slug>/print.html`. The slug is random and saved back into the order file, so re-running keeps the same QR codes.
3. `python3 render.py out/<slug>/print.html` -> `out/<slug>/calendar.pdf` plus page PNGs to check.
4. Commit and push `o/<slug>/` so the QR codes work. Then send the PDF.

Print: 11 x 8.5 landscape, double-sided, flip on the short edge. Each month is one sheet: front = month grid, back = QR codes and what to do.

## Instagram Reels
`reels/reel.html` is the source for the Reels in `/media` (open `/maker/reels/reel.html?r=1` through `6` on a local server to watch one). 1 to 3 are the first three ads; 4 is the "Cheet picks the holidays" skit, 5 is "a regular calendar vs yours", 6 is the gift ad, 7 is the "dog rates Christmas gifts" skit.
`sfx.py` synthesizes every sound effect from sine waves and noise (nothing sampled, nothing to credit); `render.py` mixes them in from the `sfx` list in each reel definition. Run `python3 maker/reels/sfx.py demo.wav` to hear one of each.
`python3 maker/reels/render.py` re-renders all of them to `media/reelN.mp4` at 1080x1920, 30 frames a second, one exact frame at a time.
`python3 maker/reels/render.py 2 music.mp3` renders reel 2 with a music file mixed in.

## Instagram still posts
`reels/post.html` ("November, as scheduled by my dog") and `reels/post2.html` ("I gave my dog access to the calendar").
    python3 maker/reels/render-post.py out.png          # post.html
    python3 maker/reels/render-post.py post2 out.png    # post2.html
