# Taghvim data

To change the data, see [CONTRIBUTING.md](CONTRIBUTING.md). Each change on `main` makes a new release of the extension automatically.

This repository contains the holidays, the Hijri corrections, and the daily photos for the Taghvim browser extension. Each build of the extension contains a copy of this repository, so the page shows it immediately and offline. After the page shows, it checks GitHub for changes (at most once in 10 minutes). When you push a change to the `main` branch, users see it on their next new tab after that check, or immediately when they click the ⟳ button.

## Files

| Path | Content |
| --- | --- |
| `recurring.json` | Events that occur on the same day each year, in the Jalali or the Gregorian calendar. |
| `years/<jalali year>.json` | Events for one Jalali year only. Put lunar (Hijri) holidays here, because their Jalali date changes each year. |
| `backgrounds.json` | The list of daily background photos of the new tab page, with the location and the credit of each photo. |
| `backgrounds/` | The background photos: WebP, landscape, approximately 2560 px width and 400 KB. |
| `hijri.json` | Corrections for the Hijri (lunar) date. |
| `images/` | Images for the events. Square images of approximately 256×256 pixels are best. SVG, PNG, JPEG, and WebP are all good. |
| `schema.json`, `backgrounds.schema.json`, `hijri.schema.json` | JSON schemas. Editors such as VS Code use them to check the files. |

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

The lunar holidays of a year are in the official calendar, which time.ir also shows. The dates of the calendar are a forecast: the moon-sighting committee (ستاد استهلال) announces the real first day of each Hijri month, and it can be one day later. When an announcement is different from the calendar, change the dates of that month in `years/<year>.json` and the `start` of that month in `hijri.json`. In 1405, the announced months up to Rabi al-Thani 1448 were the same as the calendar; the months from Jumada al-Thani 1448 are still a forecast.

1. Get the official dates from the calendar of the University of Tehran Geophysics Institute (calendar.ut.ac.ir).
2. Create `years/<year>.json` with `"year": <year>` and one event for each holiday.
3. Run `node scripts/validate.mjs`.
4. Push the change, or open a pull request. The `validate` GitHub Action runs the same check.

## Daily backgrounds

The new tab page shows one photo from `backgrounds.json` each day. All users see the same photo on the same day. The photos in the build show immediately. The page downloads a photo that you add after the build, keeps it on the computer, and also downloads such photos for the next 3 days.

IMPORTANT: To change a photo or an event image, give the new file a new name. The extension uses the copy in its build for a known file name.

```json
{
  "id": "isfahan-si-o-se-pol",
  "image": "backgrounds/isfahan-si-o-se-pol.webp",
  "position": "center",
  "place": { "fa": "سی‌وسه‌پل", "en": "Si-o-se-pol" },
  "region": { "fa": "اصفهان، ایران", "en": "Isfahan, Iran" },
  "description": {
    "fa": "طاق‌های روشن سی‌وسه‌پل در شب و بازتاب آن‌ها در آب زاینده‌رود.",
    "en": "The lit arches of the Si-o-se-pol bridge at night, reflected in the Zayanderud river."
  },
  "credit": "Photo: Reza Haji-pour · CC BY 3.0",
  "source": "https://commons.wikimedia.org/wiki/File:Si-o-se-Pol.jpg"
}
```

- `place` and `region`: the page writes them over the photo, in the bottom-right corner.
- `description`: optional. One or two lines about the photo (a maximum of 160 characters). The page writes it under the location.
- `position`: the CSS `object-position` of the photo. Use it to keep the important part visible on wide screens, for example `center 40%`.
- `credit` and `source`: required. All current photos come from Wikimedia Commons, and their licenses (CC BY and CC BY-SA) require the name of the photographer and the license.

To add a photo, convert it to WebP with 2560 px width and approximately 400 KB, add an entry to `backgrounds.json`, and run `node scripts/validate.mjs`. With [cwebp](https://developers.google.com/speed/webp/docs/cwebp): `cwebp -size 400000 -pass 6 -m 6 -resize 2560 0 -metadata none in.jpg -o backgrounds/name.webp`. The `-metadata none` option removes the camera data (such as GPS) from the file.

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

## Releases

Each push to `main` that passes the `validate` check makes a new release of the extension, with the code of the latest extension release and the new data. The release version adds a fourth number to the extension version, for example `1.4.0.12`.

- With the secret `TAGHVIM_RELEASE_TOKEN`, the release starts immediately. It is a fine-grained personal access token with "Contents: Read and write" on the extension repository.
- Without the secret, the extension repository finds the change at its daily check (03:17 UTC).
- For a fork, set the repository variable `EXTENSION_REPOSITORY` to `owner/repo` of the extension.
