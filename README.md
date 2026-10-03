# Straw Hat: Pirate Hunter

A small, original 2D browser beat-'em-up built with plain HTML, CSS and JavaScript (Canvas + Web Audio). No libraries, no downloads, no build step.

Find the pirates, defeat them, save the village, and beat the Pirate Captain at the dock.

## Run

Double-click `index.html`, or:

```bash
python server.py   # then open http://localhost:8000
```

## Controls

| Key | Action |
| --- | --- |
| W A S D | Move (W/S walk into the screen) |
| Shift | Run |
| Space | Jump |
| Left Mouse | Attack: punch, punch, heavy (combo) |
| Right Mouse | Special wave (cooldown) |
| Q | Dash / dodge |
| E | Smash crates and barrels |
| Esc | Pause |

## Features

- Procedurally drawn and animated hero and pirates (Grunt, Fighter, Captain boss)
- 3 missions, boss with melee, heavy, dash and ground-slam attacks
- Procedural music (exploration, combat, boss, victory) and sound effects via Web Audio
- Main menu, settings (volume sliders), pause, game over and victory screens

## Structure

```
index.html  style.css  server.py
js/  main.js player.js enemies.js combat.js missions.js audio.js ui.js world.js
assets/  (empty - everything is generated in code)
```
