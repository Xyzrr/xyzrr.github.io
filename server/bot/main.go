package main

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/Xyzrr/interactive-ml/tetris"
	"github.com/gorilla/websocket"
)

const cmdLag = 250 * time.Millisecond
const cmdRate = 100 * time.Millisecond
const joinRate = 100 * time.Millisecond
const maxClients = 10

func main() {
	clientCount := 1
	go runClient(cmdRate)

	for range time.Tick(joinRate) {
		if clientCount < maxClients {
			go runClient(cmdRate)
			clientCount++
		}
		fmt.Println(clientCount)
	}
}

type PlayerInput struct {
	Time    int64 `json:"time"`
	Command byte  `json:"command"`
	Index   int   `json:"index"`
}

type initMessage struct {
	MessageType string `json:"messageType"`
	ID          string `json:"id"`
	Time        int64  `json:"time"`
}

type UpdateMessage struct {
	NewState WorldState `json:"newState"`
	Time     int64      `json:"time"`
}

type WorldState struct {
	PlayerStates map[string]*tetris.PlayerState `json:"playerStates"`
}

func runClient(commandRate time.Duration) {
	c, _, err := websocket.DefaultDialer.Dial(`ws://:8080/socket`, nil)
	if err != nil {
		panic(err)
	}
	defer c.Close()

	var idMsg initMessage

	if err := c.ReadJSON(&idMsg); err != nil {
		panic(err)
	}

	updates := make(chan UpdateMessage)
	go func() {
		for {
			var umsg UpdateMessage
			if err := c.ReadJSON(&umsg); err != nil {
				panic(err)
			}
			updates <- umsg
		}
	}()

	cmdTick := time.NewTicker(commandRate)
	defer cmdTick.Stop()

	cmdIndex := 0

	for {
		select {
		case umsg := <-updates:
			// do something?
			_ = umsg
		case <-cmdTick.C:
			itime := time.Now().Add(-cmdLag).UnixNano() / int64(time.Millisecond)
			itime -= (itime - idMsg.Time) % 17
			if err := c.WriteJSON(&PlayerInput{
				Time:    itime,
				Command: byte(rand.Intn(7) + 1),
				Index:   cmdIndex,
			}); err != nil {
				panic(err)
			}
			cmdIndex++
		}
	}
}
