package main

import (
	"fmt"
	"syscall/js"
)

var c chan bool

// init is called even before main is called. This ensures that as soon as our WebAssembly module is ready in the browser, it runs and prints "Hello, webAssembly!" to the console. It then proceeds to create a new channel. The aim of this channel is to keep our Go app running until we tell it to abort.
func init() {
	fmt.Println("Hello, WebAssembly!")
	c = make(chan bool)
}

func main() {
	js.Global().Set("printMessage", js.FuncOf(printMessage))
	<-c
}

func printMessage(jsV js.Value, inputs []js.Value) interface{} {
	callback := inputs[len(inputs)-1:][0]
	message := inputs[0].String()

	callback.Invoke(js.Null(), "Did you say "+message)
	return nil
}
