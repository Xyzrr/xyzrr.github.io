package main

import (
	"fmt"
	"math/rand"
	"sort"
)

type Pos struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

type ActivePiece struct {
	Position    Pos       `json:"position"`
	PieceType   Tetromino `json:"pieceType"`
	Orientation byte      `json:"orientation"`
	FallTimer   int64     `json:"fallTimer"`
	LockTimer   int64     `json:"lockTimer"`
}

type GameField [MatrixRows][MatrixCols]byte

type PlayerState struct {
	Field       GameField     `json:"field"`
	ActivePiece ActivePiece   `json:"activePiece"`
	Hold        byte          `json:"hold"`
	Held        bool          `json:"held"`
	NextPieces  [15]Tetromino `json:"nextPieces"`
	Time        int64         `json:"time"`
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
		if state.ActivePiece.LockTimer == -1 || breakLock {
			state.ActivePiece.LockTimer = 500
		}
		state.ActivePiece.FallTimer = -1
	} else {
		state.ActivePiece.LockTimer = -1
		if state.ActivePiece.FallTimer == -1 {
			state.ActivePiece.FallTimer = 200
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
			state.ActivePiece = testPiece
			break
		}
	}
}

func GenerateRandomBag(seed int64) [7]Tetromino {
	rand.Seed(seed)
	fmt.Println("bagging with seed", seed)
	bag := [7]Tetromino{Z, S, L, J, T, O, I}
	for i := len(bag) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		bag[i], bag[j] = bag[j], bag[i]
	}
	return bag
}

func getInitialActivePieceState(t Tetromino) ActivePiece {
	return ActivePiece{
		Position:    Pos{18, 2},
		PieceType:   t,
		Orientation: 0,
		FallTimer:   200,
		LockTimer:   -1,
	}
}

func (state *PlayerState) PopNextActivePiece() {
	if state.NextPieces[7] == 0 {
		bag := GenerateRandomBag(state.Time)
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

func (state *PlayerState) Tick(time int64) {
	// handle falling
	timePassed := time - state.Time

	if state.ActivePiece.FallTimer != -1 {
		state.ActivePiece.FallTimer -= timePassed
		if state.ActivePiece.FallTimer <= 0 {
			state.AttemptMoveActivePiece(Pos{1, 0})
			state.ActivePiece.FallTimer = 200
		}
	}

	if state.ActivePiece.LockTimer != -1 {
		state.ActivePiece.LockTimer -= timePassed
		if state.ActivePiece.LockTimer <= 0 {
			state.LockActivePiece()
			state.PopNextActivePiece()
			state.Held = false
		}
	}

	state.Time = time
}

func updateGames(states map[string]*PlayerState, inputs []PlayerInput, frameStartTime int64) {
	sort.Slice(inputs, func(i, j int) bool { return inputs[i].Index < inputs[j].Index })

	for _, inp := range inputs {
		switch inp.Command {
		case 1:
			states[inp.PlayerID].AttemptMoveActivePiece(Pos{0, -1})
		case 2:
			states[inp.PlayerID].AttemptMoveActivePiece(Pos{0, 1})
		case 3:
			states[inp.PlayerID].AttemptRotateActivePiece(1)
		case 4:
			states[inp.PlayerID].AttemptRotateActivePiece(3)
		case 5:
			states[inp.PlayerID].AttemptMoveActivePiece(Pos{1, 0})
		case 6:
			states[inp.PlayerID].HardDrop()
		case 7:
			states[inp.PlayerID].HoldActivePiece()
		case 8:
			is := getInitialPlayerState(frameStartTime)
			states[inp.PlayerID] = &is
		case 9:
			delete(states, inp.PlayerID)
		}
	}
	// since ticks are computed after all user input in the frame
	// has been processed, their intervals aren't as precise,
	// but meh
	for id := range states {
		states[id].Tick(frameStartTime)
	}
}

func getInitialPlayerState(frameStartTime int64) PlayerState {
	bag := GenerateRandomBag(frameStartTime)
	nextPieces := [15]Tetromino{}
	copy(nextPieces[:], bag[:])
	return PlayerState{
		Field:       GameField{},
		ActivePiece: getInitialActivePieceState(J),
		Hold:        0,
		Held:        false,
		NextPieces:  nextPieces,
		Time:        frameStartTime,
	}
}
