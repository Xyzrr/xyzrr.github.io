package main

import (
	"fmt"
	"log"
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
	Orientation   int       `json:"orientation"`
	LastFallTime  int       `json:"lastFallTime"`
	LockStartTime int       `json:"lockStartTime"`
}

type PlayerState struct {
	Field       [40][20]int  `json:"field"`
	ActivePiece ActivePiece  `json:"activePiece"`
	Hold        int          `json:"hold"`
	Held        bool         `json:"held"`
	NextPieces  [5]Tetromino `json:"nextPieces"`
}

type PlayerInput struct {
	tick    int
	command int
}

var initialPlayerState = PlayerState{
	Field: [40][20]int{},
	ActivePiece: ActivePiece{
		Position:      Pos{18, 2},
		PieceType:     J,
		Orientation:   0,
		LastFallTime:  0,
		LockStartTime: 0,
	},
	Hold:       0,
	Held:       false,
	NextPieces: [5]Tetromino{J, Z, T, I, O},
}

var clients = make(map[*websocket.Conn]string)
var playerStates = make(map[string]PlayerState)
var inputQueue = make([]PlayerInput, 0)

func main() {
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

func updateGame(state PlayerState) PlayerState {
	state.ActivePiece.Position.Row++
	return state
}

func runGames() {
	fmt.Println("Starting to run games")
	ticker := time.NewTicker(200 * time.Millisecond)

	for {
		<-ticker.C
		for client, id := range clients {
			state := playerStates[id]
			playerStates[id] = updateGame(state)
			client.WriteJSON(playerStates)
		}
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
	playerStates[newID] = initialPlayerState
	for {
		var input PlayerInput
		err := conn.ReadJSON(&input)

		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, conn)
			break
		}

		inputQueue = append(inputQueue, input)
	}
}

// [END all]
