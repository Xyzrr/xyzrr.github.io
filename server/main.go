package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Xyzrr/interactive-ml/tetris"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"
	"github.com/rs/xid"
)

type PlayerInput struct {
	Time     int64  `json:"time"`
	Command  byte   `json:"command"`
	PlayerID string `json:"playerID"`
	Index    int    `json:"index"`
}

type WorldState struct {
	PlayerStates map[string]*tetris.PlayerState `json:"playerStates"`
}

var frameStartTime int64
var clients = make(map[*websocket.Conn]string)
var playerInputs = make(chan PlayerInput, 16384)
var worldBuffers = map[string]*tetris.PlayerStateBuffer{}

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

func runGames() {
	fmt.Println("Starting to run games")

	frameStartTime = getTime()
	tick := 0
	ticker := time.NewTicker(17 * time.Millisecond)

	for {
		<-ticker.C
		frameStartTime += 17

		// process inputs
		joins := map[string]int64{}
		leaves := map[string]struct{}{}
		inputs := map[string][]PlayerInput{}
		for len(playerInputs) > 0 {
			inp := <-playerInputs

			if inp.Command == 8 {
				joins[inp.PlayerID] = inp.Time
			} else if inp.Command == 9 {
				leaves[inp.PlayerID] = struct{}{}
			} else {
				inputs[inp.PlayerID] = append(inputs[inp.PlayerID], inp)
			}
		}

		for k, t := range joins {
			worldBuffers[k] = tetris.NewStateBuffer(t)
			for t < frameStartTime {
				worldBuffers[k].Tick()
				t += 17
			}
		}

		for k, inps := range inputs {
			ins := make([]tetris.PlayerInput, len(inps))
			for i, inp := range inps {
				ins[i] = tetris.PlayerInput{
					Time:    inp.Time,
					Command: inp.Command,
					Index:   inp.Index,
				}
			}
			worldBuffers[k].AddInputs(ins)
		}

		for k := range leaves {
			delete(worldBuffers, k)
		}

		for _, b := range worldBuffers {
			b.Tick()
		}

		// update clients
		if tick%10 == 0 {
			for client := range clients {
				// j, _ := json.Marshal(UpdateMessage{worldHistory[0], frameStartTime - int64((len(worldHistory)-1)*17)})
				// fmt.Println("sending to client", string(j))
				worldState := WorldState{
					PlayerStates: map[string]*tetris.PlayerState{},
				}
				var time int64
				for k, b := range worldBuffers {
					state := b.GetFirst()
					worldState.PlayerStates[k] = &state
					time = state.Time
				}
				client.WriteJSON(UpdateMessage{worldState, time})
			}
		}

		tick++
	}
}

func getTime() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
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

	joinTime := frameStartTime

	clientID := xid.New().String()
	conn.WriteJSON(initMessage{
		MessageType: "id",
		ID:          clientID,
		Time:        joinTime,
	})
	clients[conn] = clientID

	playerInputs <- PlayerInput{Time: joinTime, Command: 8, PlayerID: clientID}
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
