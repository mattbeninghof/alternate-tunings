# Alternate Tuning Guide

An interactive companion to Bill Sethares' free [Alternate Tuning Guide](https://sethares.engr.wisc.edu/alternatetunings/alltunings.pdf): 38 alternate guitar tunings plus standard, each with

- the tuning strip from the book: sounding pitch, MIDI number, half steps to retune from standard, and the fret that matches the next string
- Sethares' commentary and the songs that use the tuning
- related tunings (transpositions and one-string neighbors), computed
- a full fretboard note map with any scale from the book's table highlighted
- a chord voicing finder for any root and chord type, with fingerings, barres and positions, plus an auto-generated chord chart in the tuning's natural key
- plucked-string playback for open strings, single notes and chord voicings
- a tuning identifier that reproduces the book's cross index for any six notes you type

Plain HTML, CSS and JavaScript. No build step, no dependencies, relative paths only, so it runs from any folder or GitHub Pages subpath.

## Files

- `index.html` markup and styles
- `app.js` views, routing, SVG fretboards and chord diagrams, audio
- `engine.js` music theory: retune and fret rows, chord identification, voicing search, tuning identifier
- `data.js` the 39 tunings, interval tables, cross index and guide text
- `icons/`, `manifest.webmanifest` favicon set and PWA manifest
- `test/engine.test.js` node test suite for the engine (`node --test test/`)

## Routes

- `#home`, `#find`, `#guide`
- `#t/open-g` any tuning by id
- `#c/D-A-D-G-A-D` any custom tuning (use `s` for sharp: `#c/D-A-D-Fs-A-D`)
- `#find/B F# B E G# C#` prefilled identifier

## Credits

Tuning data and commentary are from Bill Sethares' Alternate Tuning Guide, used with gratitude. Chord fingerings are computed from the book's interval tables rather than copied from its chord pages. Pitches are sounding pitch (standard low E = E2 = MIDI 40).
