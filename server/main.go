package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/rs/cors"
	"github.com/rs/xid"
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

type PlayerInput struct {
	Time     int64  `json:"time"`
	Command  byte   `json:"command"`
	PlayerID string `json:"playerID`
}

var clients = make(map[*websocket.Conn]string)
var playerStates = make(map[string]*PlayerState)
var playerInputs = make(chan PlayerInput, 16384)

func main() {
	InitTetrominos()

	// use PORT environment variable, or default to 8080
	port := "8080"
	if fromEnv := os.Getenv("PORT"); fromEnv != "" {
		port = fromEnv
	}

	// register hello function to handle all requests
	server := http.NewServeMux()
	server.HandleFunc("/", hello)
	server.HandleFunc("/socket", socketHandler)

	go runGames()

	// start the web server on port and accept requests
	log.Printf("Server listening on port %s", port)
	err := http.ListenAndServe(":"+port, cors.AllowAll().Handler(server))
	log.Fatal(err)
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

func (state *PlayerState) LockActivePiece() {
	minos := GetMinos(state.ActivePiece.PieceType, state.ActivePiece.Orientation)
	for _, mino := range minos {
		pos := AddPositions(state.ActivePiece.Position, mino)
		state.Field[pos.Row][pos.Col] = byte(state.ActivePiece.PieceType)
	}
}

func (state *PlayerState) Tick() {
	time := getTime()

	// handle falling
	// const dropSpeed = softDrop
	//   ? constants.SOFT_DROP_SPEED
	//   : constants.TICK_DURATION;
	dropSpeed := int64(200)
	// fmt.Println("Tick", time, state.ActivePiece.LastFallTime)
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

func updateGames(states map[string]*PlayerState, inputs []PlayerInput) map[string]*PlayerState {
	result := make(map[string]*PlayerState)
	for k, v := range states {
		c := *v
		result[k] = &c
	}
	// fmt.Println("result", result)
	for id := range result {
		result[id].Tick()
	}
	for _, inp := range inputs {
		switch inp.Command {
		case 1:
			result[inp.PlayerID].AttemptMoveActivePiece(Pos{0, -1})
		case 2:
			result[inp.PlayerID].AttemptMoveActivePiece(Pos{0, 1})
		case 3:
			result[inp.PlayerID].AttemptRotateActivePiece(1)
		case 4:
			result[inp.PlayerID].AttemptRotateActivePiece(3)
		case 5:
			result[inp.PlayerID].AttemptMoveActivePiece(Pos{1, 0})
		}
	}
	return result
}

func runGames() {
	fmt.Println("Starting to run games")
	tick := 0
	ticker := time.NewTicker(17 * time.Millisecond)

	for {
		<-ticker.C
		inputs := make([]PlayerInput, 0)
		for len(playerInputs) > 0 {
			inputs = append(inputs, <-playerInputs)
		}
		playerStates = updateGames(playerStates, inputs)
		if tick%10 == 0 {
			for client := range clients {
				client.WriteJSON(playerStates)
			}
		}
		tick++
	}
}

// hello responds to the request with a plain-text "Hello, world" message.
func hello(w http.ResponseWriter, r *http.Request) {
	log.Printf("Serving request: %s", r.URL.Path)
	host, _ := os.Hostname()
	fmt.Fprintf(w, "Hello, world!\n")
	fmt.Fprintf(w, "Version: 2.0.0\n")
	fmt.Fprintf(w, "Hostname: %s\n", host)
}

var upgrader = websocket.Upgrader{
	CheckOrigin:     func(r *http.Request) bool { return true },
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func socketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
		return
	}
	defer conn.Close()

	newID := xid.New().String()
	conn.WriteJSON(map[string]string{"type": "id", "id": newID})
	clients[conn] = newID
	is := getInitialPlayerState()
	playerStates[newID] = &is
	for {
		var input PlayerInput
		err := conn.ReadJSON(&input)

		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, conn)
			break
		}
		fmt.Println("Received player input", input)

		input.PlayerID = newID

		playerInputs <- input
	}
}

// [END all]
