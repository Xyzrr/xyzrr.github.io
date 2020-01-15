package main

import (
	"fmt"
	"math/rand"
	"time"
)

type Pos struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

type ActivePiece struct {
	Position      Pos       `json:"position"`
	PieceType     Tetromino `json:"pieceType"`
	Orientation   byte      `json:"orientation"`
	LastFallTime  int64     `json:"lastFallTime"`
	LockStartTime int64     `json:"lockStartTime"`
}

type GameField [MatrixRows][MatrixCols]byte

type PlayerState struct {
	Field       GameField     `json:"field"`
	ActivePiece ActivePiece   `json:"activePiece"`
	Hold        byte          `json:"hold"`
	Held        bool          `json:"held"`
	NextPieces  [15]Tetromino `json:"nextPieces"`
}

func getTime() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}

func AddPositions(a Pos, b Pos) Pos {
	return Pos{a.Row + b.Row, a.Col + b.Col}
}

func SubPositions(a Pos, b Pos) Pos {
	return Pos{a.Row - b.Row, a.Col - b.Col}
}

func ActivePieceIsColliding(activePiece ActivePiece, field GameField) bool {
	minos := GetMinos(activePiece.PieceType, activePiece.Orientation)

	for _, mino := range minos {
		pos := AddPositions(activePiece.Position, mino)
		if pos.Row < 0 || pos.Row >= MatrixRows || pos.Col < 0 || pos.Col >= MatrixCols || field[pos.Row][pos.Col] != 0 {
			return true
		}
	}

	return false
}

func (state *PlayerState) startLockingIfOnGround(breakLock bool) {
	testPiece := state.ActivePiece
	testPiece.Position.Row++
	onGround := ActivePieceIsColliding(testPiece, state.Field)
	if onGround {
		if state.ActivePiece.LockStartTime == 0 || breakLock {
			state.ActivePiece.LockStartTime = getTime()
		}
		state.ActivePiece.LastFallTime = 0
	} else {
		state.ActivePiece.LockStartTime = 0
		if state.ActivePiece.LastFallTime == 0 {
			state.ActivePiece.LastFallTime = getTime()
		}
	}
}

func (state *PlayerState) AttemptMoveActivePiece(offset Pos) {
	ap := state.ActivePiece
	ap.Position = AddPositions(ap.Position, offset)
	colliding := ActivePieceIsColliding(ap, state.Field)
	if !colliding {
		state.ActivePiece.Position = ap.Position
	}
	state.startLockingIfOnGround(!colliding)
}

func RotateActivePiece(activePiece ActivePiece, rotation byte) ActivePiece {
	activePiece.Orientation = (activePiece.Orientation + rotation + 4) % 4
	return activePiece
}

func (state *PlayerState) AttemptRotateActivePiece(dir byte) {
	rotatedPiece := RotateActivePiece(state.ActivePiece, dir)
	beforeOffsets := GetOffsets(state.ActivePiece.PieceType, state.ActivePiece.Orientation)
	afterOffsets := GetOffsets(rotatedPiece.PieceType, rotatedPiece.Orientation)
	for i := range beforeOffsets {
		testPiece := rotatedPiece
		trueOffset := SubPositions(beforeOffsets[i], afterOffsets[i])
		testPiece.Position = AddPositions(testPiece.Position, trueOffset)
		if !ActivePieceIsColliding(testPiece, state.Field) {
			fmt.Println("HEY", trueOffset, i, testPiece.Position)
			state.ActivePiece = testPiece
			break
		}
	}
}

func GenerateRandomBag() [7]Tetromino {
	bag := [7]Tetromino{Z, S, L, J, T, O, I}
	for i := len(bag) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		bag[i], bag[j] = bag[j], bag[i]
	}
	return bag
}

func getInitialActivePieceState(t Tetromino) ActivePiece {
	return ActivePiece{
		Position:      Pos{18, 2},
		PieceType:     t,
		Orientation:   0,
		LastFallTime:  getTime(),
		LockStartTime: 0,
	}
}

func (state *PlayerState) PopNextActivePiece() {
	if state.NextPieces[7] == 0 {
		bag := GenerateRandomBag()
		copy(state.NextPieces[7:], bag[:])
	}
	state.ActivePiece = getInitialActivePieceState(state.NextPieces[0])
	copy(state.NextPieces[:], state.NextPieces[1:])
}

func (state *PlayerState) CheckForClears() {
	linesCleared := 0
	for i := 0; i < 5; i++ {
		testRow := state.ActivePiece.Position.Row + i
		if testRow < MatrixRows && !SliceContainsByte(state.Field[testRow][:], 0) {
			copy(state.Field[1:], state.Field[:testRow])
			linesCleared++
		}
	}
}

func SliceContainsByte(slice []byte, target byte) bool {
	for _, v := range slice {
		if v == target {
			return true
		}
	}
	return false
}

func (state *PlayerState) LockActivePiece() {
	minos := GetMinos(state.ActivePiece.PieceType, state.ActivePiece.Orientation)
	for _, mino := range minos {
		pos := AddPositions(state.ActivePiece.Position, mino)
		state.Field[pos.Row][pos.Col] = byte(state.ActivePiece.PieceType)
	}
	state.CheckForClears()
}

func MoveToGround(activePiece ActivePiece, field GameField) ActivePiece {
	activePiece.Position.Row++
	for !ActivePieceIsColliding(activePiece, field) {
		activePiece.Position.Row++
	}
	activePiece.Position.Row--
	return activePiece
}

func (state *PlayerState) HardDrop() {
	state.ActivePiece = MoveToGround(state.ActivePiece, state.Field)
	state.LockActivePiece()
	state.PopNextActivePiece()
	state.Held = false
}

func (state *PlayerState) HoldActivePiece() {
	if state.Held {
		return
	}
	if state.Hold != 0 {
		tempHold := state.Hold
		state.Hold = byte(state.ActivePiece.PieceType)
		state.ActivePiece = getInitialActivePieceState(Tetromino(tempHold))
	} else {
		state.Hold = byte(state.ActivePiece.PieceType)
		state.PopNextActivePiece()
	}
	state.Held = true
}

func (state *PlayerState) Tick() {
	time := getTime()

	// handle falling
	dropSpeed := int64(200)
	if state.ActivePiece.LastFallTime > 0 && time-state.ActivePiece.LastFallTime >= dropSpeed {
		state.AttemptMoveActivePiece(Pos{1, 0})
		state.ActivePiece.LastFallTime += dropSpeed
	}

	if state.ActivePiece.LockStartTime > 0 && time-state.ActivePiece.LockStartTime >= lockDelay {
		state.LockActivePiece()
		state.PopNextActivePiece()
		state.Held = false
	}
}

func getInitialPlayerState() PlayerState {
	bag := GenerateRandomBag()
	nextPieces := [15]Tetromino{}
	copy(nextPieces[:], bag[:])
	return PlayerState{
		Field:       GameField{},
		ActivePiece: getInitialActivePieceState(J),
		Hold:        0,
		Held:        false,
		NextPieces:  nextPieces,
	}
}
