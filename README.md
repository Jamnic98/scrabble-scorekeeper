# Scrabble Scorekeeper
> A program that calculates the number of points awarded for a move in the popular board game, *Scrabble*.
> 
> App link: https://scrabble-scorekeeper.netlify.app/

## Table of contents
* [General info](#general-info)
* [Screenshots](#screenshots)
* [How to use](#how-to-use)
* [Features](#features)
* [Built with](#built-with)


## General info

This project was designed to make playing the board game version of *Scrabble* more enjoyable, by providing a fast and reliable method of calculating turn scores. The program features an easy-to-use graphical user interface comprised of a virtual board and table. With the use of keystrokes, the user can place tiles on the virtual board to mirror the state of the actual board. 


## Screenshots
### Usage demo:
![Scrabble Scorekeeper Usage Demo](https://user-images.githubusercontent.com/44094740/104004433-a9791e80-519b-11eb-989f-ed604a78da45.gif)


| Tiles | Starting screen |
| ------------- | ------------- |
| ![Scrabble Scorekeeping Tiles](https://user-images.githubusercontent.com/44094740/99147316-f0ed9d80-2677-11eb-846a-52713c49c507.png) | ![Starting Page](https://user-images.githubusercontent.com/44094740/99147318-f1863400-2677-11eb-9058-a6207b2635fc.png) |

## How to use
### At the start screen:
Type in the player names in turn order, pressing the enter key to add a player to the list. Once each player name has been entered, click the button labelled 'GENERATE' and the program will generate a board and table. 
N.B. Player names are restricted to 6 letters so that when displayed as the column title in the table, they are guaranteed to fit within the width of the column.

### Adding tiles:
Click the square on the board upon which the a is to be placed. The square should be selected and flashing yellow.
A tile can now be added by typing the corresponding letter on the keyboard, however, if the number of tiles a player has placed is more than one, the program needs to know which direction to add the subsequent tiles. To set the direction, either click the respective button to the right of the board or use the arrow keys on the keyboard. After all the tiles have been placed, pressing the enter key will submit the move for validation. If the move is NOT deemed to be a valid *Scrabble* move, close the alert box then use the backspace key to remove tiles in reverse order of placement. 
To add a blank tile, use the space bar then type in the letter the blank tile represents.


## Features
* Has built-in *Scrabble* rules.
* Includes a dictionary to validate words.
* Keeps track of the remaining tiles.


## Built with
* React 17.0.1
* JavaScript (ES6)
* HTML 5
* CSS 3
