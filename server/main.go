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
	Index    int    `json:index`
}

type WorldState struct {
	playerStates map[string]*PlayerState
}

var frameStartTime int64
var clients = make(map[*websocket.Conn]string)
var playerInputs = make(chan PlayerInput, 16384)
var newConnections = make(chan string, 256)
var killedConnections = make(chan string, 256)
var worldHistory = make([]WorldState, 0)

func getTime() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}

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

type UpdateMessage struct {
	NewState PlayerState
	Time     int64
}

func copyWorldState(ws WorldState) WorldState {
	var result WorldState
	result.playerStates = make(map[string]*PlayerState)
	for k, v := range ws.playerStates {
		c := *v
		result.playerStates[k] = &c
	}
	return result
}

func runGames() {
	fmt.Println("Starting to run games")

	worldHistory = append(worldHistory, WorldState{make(map[string]*PlayerState)})

	frameStartTime = getTime()
	tick := 0
	ticker := time.NewTicker(17 * time.Millisecond)

	for {
		<-ticker.C
		frameStartTime += 17

		newState := copyWorldState(worldHistory[len(worldHistory)-1])

		// add new players
		for len(newConnections) > 0 {
			clientID := <-newConnections
			is := getInitialPlayerState()
			newState.playerStates[clientID] = &is
		}

		// remove disconnected players
		for len(killedConnections) > 0 {
			clientID := <-killedConnections
			delete(newState.playerStates, clientID)
		}

		// process inputs
		inputs := make([]PlayerInput, 0)
		for len(playerInputs) > 0 {
			inputs = append(inputs, <-playerInputs)
		}
		updateGames(newState.playerStates, inputs)

		// update clients
		if tick%10 == 0 {
			for client := range clients {
				client.WriteJSON(newState.playerStates)
			}
		}

		fmt.Println("history", worldHistory)
		// get ready for next iteration
		worldHistory = append(worldHistory, newState)
		if len(worldHistory) > 128 {
			worldHistory = worldHistory[1:]
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

type initMessage struct {
	MessageType string `json:"messageType"`
	ID          string `json:"id"`
	Time        int64  `json:"time"`
}

func socketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
		return
	}
	defer conn.Close()

	clientID := xid.New().String()
	conn.WriteJSON(initMessage{"id", clientID, getFrameStartTime()})
	clients[conn] = clientID

	newConnections <- clientID
	for {
		var input PlayerInput
		err := conn.ReadJSON(&input)

		if err != nil {
			log.Printf("error: %v", err)
			killedConnections <- clientID
			delete(clients, conn)
			break
		}
		fmt.Println("Received player input", input)

		input.PlayerID = clientID

		playerInputs <- input
	}
}

// [END all]
