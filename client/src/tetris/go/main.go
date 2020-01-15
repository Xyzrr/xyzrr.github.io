// +build js
package main

import (
	"encoding/json"
	"fmt"
	"syscall/js"
)

type PlayerInput struct {
	Time    int64 `json:"time"`
	Command byte  `json:"command"`
}

var c chan bool

// init is called even before main is called. This ensures that as soon as our WebAssembly module is ready in the browser, it runs and prints "Hello, webAssembly!" to the console. It then proceeds to create a new channel. The aim of this channel is to keep our Go app running until we tell it to abort.
func init() {
	fmt.Println("Hello, WebAssembly!")
	c = make(chan bool)
}

func main() {
	js.Global().Set("updateGame", js.FuncOf(updateGame))
	<-c
}

func updateGame(jsV js.Value, params []js.Value) interface{} {
	var state PlayerState
	json.Unmarshal([]byte(params[0].String()), &state)
	var inputs []PlayerInput
	json.Unmarshal([]byte(params[1].String()), &inputs)

	for _, inp := range inputs {
		switch inp.Command {
		case 1:
			state.AttemptMoveActivePiece(Pos{0, -1})
		case 2:
			state.AttemptMoveActivePiece(Pos{0, 1})
		case 3:
			state.AttemptRotateActivePiece(1)
		case 4:
			state.AttemptRotateActivePiece(3)
		case 5:
			state.AttemptMoveActivePiece(Pos{1, 0})
		case 6:
			state.HardDrop()
		case 7:
			state.HoldActivePiece()
		}
	}
	// since ticks are computed after all user input in the frame
	// has been processed, their intervals aren't as precise,
	// but meh
	state.Tick()

	response, _ := json.Marshal(state)
	return js.ValueOf(string(response))
}
