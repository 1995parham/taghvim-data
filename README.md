# Taghvim data

This repository contains the holidays and events for the Taghvim browser extension. The extension reads the files directly from GitHub. When you push a change to the `main` branch, users see it in a maximum of six hours, or immediately when they click the refresh button.

## Files

| Path | Content |
| --- | --- |
| `recurring.json` | Events that occur on the same day each year, in the Jalali or the Gregorian calendar. |
| `years/<jalali year>.json` | Events for one Jalali year only. Put lunar (Hijri) holidays here, because their Jalali date changes each year. |
| `backgrounds.json` | The list of daily background photos of the new tab page, with the location and the credit of each photo. |
| `backgrounds/` | The background photos. Use landscape photos of approximately 2560 px width and less than 1.5 MB. |
| `hijri.json` | Corrections for the Hijri (lunar) date. |
| `images/` | Images for the events. Square images of approximately 256×256 pixels are best. SVG, PNG, JPEG, and WebP are all good. |
| `schema.json` | The JSON schema of the event files. |

## Event format

```json
{
  "id": "yalda",
  "jalali": "09-30",
  "holiday": false,
  "title": { "fa": "شب یلدا", "en": "Yalda Night" },
  "description": { "fa": "بلندترین شب سال.", "en": "The longest night of the year." },
  "image": "images/yalda.svg"
}
```

- `id`: a unique name with lowercase letters, digits, and hyphens.
- `jalali` or `gregorian`: use one of them. Use `MM-DD` in `recurring.json`. Use `YYYY-MM-DD` in a year file.
- `holiday`: `true` makes the day red in the calendar.
- `title` and `description`: a string, or an object with `fa` and `en`. Keep the description to one or two lines (a maximum of 160 characters).
- `image`: optional. A path in this repository (`images/x.png`) or an `https://` URL.

## Add the lunar holidays of a year

1. Get the official dates from the calendar of the University of Tehran Geophysics Institute (calendar.ut.ac.ir).
2. Create `years/<year>.json` with `"year": <year>` and one event for each holiday.
3. Run `node scripts/validate.mjs`.
4. Push the change. The `validate` GitHub Action runs the same check.

## Daily backgrounds

The new tab page shows one photo from `backgrounds.json` each day. All users see the same photo on the same day. The page keeps each downloaded photo on the computer, and it also downloads the photos of the next 3 days. Thus the page works offline.

```json
{
  "id": "isfahan-si-o-se-pol",
  "image": "backgrounds/isfahan-si-o-se-pol.jpg",
  "position": "center",
  "place": { "fa": "سی‌وسه‌پل", "en": "Si-o-se-pol" },
  "region": { "fa": "اصفهان، ایران", "en": "Isfahan, Iran" },
  "credit": "Photo: Reza Haji-pour · CC BY 3.0",
  "source": "https://commons.wikimedia.org/wiki/File:Si-o-se-Pol.jpg"
}
```

- `place` and `region`: the page writes them over the photo, in the bottom-right corner.
- `position`: the CSS `object-position` of the photo. Use it to keep the important part visible on wide screens, for example `center 40%`.
- `credit` and `source`: required. All current photos come from Wikimedia Commons, and their licenses (CC BY and CC BY-SA) require the name of the photographer and the license.

To add a photo, resize it to 2560 px width (`sips -Z 2560 -s format jpeg -s formatOptions 60 in.jpg --out backgrounds/name.jpg`), add an entry to `backgrounds.json`, and run `node scripts/validate.mjs`.

## Hijri date

The extension calculates the Hijri date offline with the Umm al-Qura calendar. The official Iranian date uses moon sighting, so it can be one day different. Use `hijri.json` to correct it:

```json
{
  "adjust": 0,
  "months": [
    { "month": "1448-06", "start": "2026-11-11" },
    { "month": "1448-07", "start": "2026-12-10" }
  ]
}
```

- `months`: the official first day of each Hijri month, as a Gregorian date. Add each month in sequence when the official calendar announces it. A listed month applies to the 30 days from its start.
- `adjust`: the number of days to add to the Umm al-Qura date, for dates that no listed month covers. For example, `-1` makes the date one day earlier.
