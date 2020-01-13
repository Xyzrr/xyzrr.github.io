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
		if tick%1 == 0 {
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

	clientID := xid.New().String()
	conn.WriteJSON(map[string]string{"type": "id", "id": clientID})
	clients[conn] = clientID
	is := getInitialPlayerState()
	playerStates[clientID] = &is
	for {
		var input PlayerInput
		err := conn.ReadJSON(&input)

		if err != nil {
			log.Printf("error: %v", err)
			delete(playerStates, clientID)
			delete(clients, conn)
			break
		}
		fmt.Println("Received player input", input)

		input.PlayerID = clientID

		playerInputs <- input
	}
}

// [END all]
