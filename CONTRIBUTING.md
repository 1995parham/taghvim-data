# Contributing

All changes to this repository go into the next release of the Taghvim extension automatically. You do not need to change the extension.

## Change the data in the browser

You do not need git or any tools on your computer.

1. Open the file on GitHub, for example `recurring.json`, and click the pencil icon ("Edit this file").
2. Make the change. Keep the JSON format: use quotes, commas, and brackets as in the other entries.
3. Click "Commit changes…", then "Propose changes". If you have no write access, GitHub makes a fork for you.
4. Click "Create pull request".
5. Wait for the `validate` check. If it fails, open the check to see the error, and edit the file again.

When the pull request is merged, the extension repository makes a new release with the new data.

## What to change

| You want to… | Change this file |
| --- | --- |
| Add a holiday that has the same date each year | `recurring.json` |
| Add a lunar (Hijri) holiday or a one-time event | `years/<Jalali year>.json` (create the file for a new year) |
| Correct the Hijri date | `hijri.json` |
| Add a daily background photo | `backgrounds/` (the photo) and `backgrounds.json` |
| Add an image for an event | `images/` (the image) and the `image` field of the event |

`README.md` explains each field. The JSON schemas (`schema.json`, `backgrounds.schema.json`, `hijri.schema.json`) let editors such as VS Code check the files while you type.

## Rules

- Write each title and description in Persian (`fa`) and English (`en`).
- Keep each description to one or two lines (a maximum of 160 characters).
- For lunar holidays, use the official dates of the University of Tehran Geophysics Institute (calendar.ut.ac.ir).
- Use only photos that you may share, with a free license such as CC BY or CC BY-SA. Put the photographer and the license in `credit`, and the page of the photo in `source`.
- Convert photos to WebP with approximately 2560 px width and 400 KB, and remove the camera data: `cwebp -size 400000 -pass 6 -m 6 -resize 2560 0 -metadata none in.jpg -o backgrounds/name.webp`. The `validate` check warns when a photo is larger than 600 KB.
- To change a photo or an image, give the new file a new name. Released extensions keep their own copy of each known file name.

## Check on your computer

```
node scripts/validate.mjs
```

The check needs Node.js 18 or later. The `validate` workflow runs the same check on each pull request.
