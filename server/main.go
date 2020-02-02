package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
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
	PlayerStates map[string]*PlayerState `json:"playerStates"`
}

var frameStartTime int64
var clients = make(map[*websocket.Conn]string)
var playerInputs = make(chan PlayerInput, 16384)
var worldHistory = make([]WorldState, 0)

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
	NewState WorldState `json:"newState"`
	Time     int64      `json:"time"`
}

func copyWorldState(ws WorldState) WorldState {
	var result WorldState
	result.PlayerStates = make(map[string]*PlayerState)
	for k, v := range ws.PlayerStates {
		c := *v
		result.PlayerStates[k] = &c
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

		// process inputs
		inputs := make(map[int][]PlayerInput)
		for len(playerInputs) > 0 {
			inp := <-playerInputs
			historyIndex := int64(len(worldHistory)) - 1 - (frameStartTime-inp.Time)/17

			if historyIndex > 0 {
				inputs[int(historyIndex)] = append(inputs[int(historyIndex)], inp)
			}
		}

		earliestInput := len(worldHistory) - 1
		for k := range inputs {
			if k < earliestInput {
				earliestInput = k
			}
		}

		// fmt.Println(inputs)
		for i := earliestInput; i < len(worldHistory); i++ {
			newState := copyWorldState(worldHistory[i])
			updateGames(newState.PlayerStates, inputs[i], frameStartTime)
			if i == len(worldHistory)-1 {
				worldHistory = append(worldHistory, newState)
				if len(worldHistory) > 128 {
					worldHistory = worldHistory[1:]
				}
			} else {
				worldHistory[i+1] = newState
			}
		}

		// update clients
		if tick%10 == 0 {
			for client := range clients {
				// j, _ := json.Marshal(UpdateMessage{worldHistory[0], frameStartTime - int64((len(worldHistory)-1)*17)})
				// fmt.Println("sending to client", string(j))
				client.WriteJSON(UpdateMessage{worldHistory[0], frameStartTime - int64((len(worldHistory)-1)*17)})
			}
		}

		tick++
	}
}

func getTime() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
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

var lastTime = int64(0)

func socketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
		return
	}
	defer conn.Close()

	clientID := xid.New().String()
	conn.WriteJSON(initMessage{
		MessageType: "id",
		ID:          clientID,
		Time:        frameStartTime,
	})
	clients[conn] = clientID

	playerInputs <- PlayerInput{Time: frameStartTime, Command: 8, PlayerID: clientID}
	for {
		var input PlayerInput
		err := conn.ReadJSON(&input)

		if err != nil {
			log.Printf("error: %v", err)
			playerInputs <- PlayerInput{Time: frameStartTime, Command: 9, PlayerID: clientID}
			delete(clients, conn)
			break
		}
		lastTime = input.Time

		input.PlayerID = clientID

		playerInputs <- input
	}
}

// [END all]
