package tetris

import (
	"sort"
)

const (
	CommandMoveActiveLeft  = 1
	CommandMoveActiveRight = 2
	CommandRotateActiveCW  = 3
	CommandRotateActiveCCW = 4
	CommandMoveActiveDown  = 5
	CommandHardDrop        = 6
	CommandHoldActive      = 7
)

type PlayerInput struct {
	Time    int64 `json:"time"`
	Command byte  `json:"command"`
	Index   int   `json:"index"`
}

func NewStateBuffer(frameStartTime int64) *PlayerStateBuffer {
	return &PlayerStateBuffer{
		inputs: [][]PlayerInput{nil},
		states: []PlayerState{
			GetInitialPlayerState(frameStartTime),
		},
		frameStartTime: frameStartTime,
	}
}

type PlayerStateBuffer struct {
	inputs         [][]PlayerInput
	states         []PlayerState
	frameStartTime int64
}

func (b *PlayerStateBuffer) timeIndex(frameTime int64) int {
	return len(b.states) - 1 - int(b.frameStartTime-frameTime)/17
}

func (b *PlayerStateBuffer) timeAt(idx int) int64 {
	return b.frameStartTime - int64(len(b.states)-1-idx)*17
}

func (b *PlayerStateBuffer) GetFirst() PlayerState {
	return b.states[0]
}

func (b *PlayerStateBuffer) Tick() {
	b.inputs = append(b.inputs, nil)
	b.states = append(b.states, PlayerState{})
	b.frameStartTime += 17
	b.buildState(len(b.states) - 1)
	if len(b.states) > 128 {
		b.states = b.states[1:]
		b.inputs = b.inputs[1:]
	}
}

func (b *PlayerStateBuffer) AddInputs(inputs []PlayerInput) {
	if len(inputs) == 0 {
		return
	}

	minIdx := len(b.states) - 1

	seenIdxs := map[int]struct{}{}
	for _, in := range inputs {
		idx := b.timeIndex(in.Time)
		if idx < 0 || idx >= len(b.states) {
			continue
		}
		seenIdxs[idx] = struct{}{}
		b.inputs[idx] = append(b.inputs[idx], in)
		if idx < minIdx {
			minIdx = idx
		}
	}

	for idx := range seenIdxs {
		sort.Slice(b.inputs[idx], func(i, j int) bool {
			return b.inputs[idx][i].Index < b.inputs[idx][j].Index
		})
	}

	for idx := minIdx + 1; idx < len(b.states); idx++ {
		b.buildState(idx)
	}
}

func (b *PlayerStateBuffer) buildState(idx int) {
	state := b.states[idx-1]
	for _, in := range b.inputs[idx-1] {
		switch in.Command {
		case CommandMoveActiveLeft:
			state.AttemptMoveActivePiece(Pos{0, -1})
		case CommandMoveActiveRight:
			state.AttemptMoveActivePiece(Pos{0, 1})
		case CommandRotateActiveCW:
			state.AttemptRotateActivePiece(1)
		case CommandRotateActiveCCW:
			state.AttemptRotateActivePiece(3)
		case CommandMoveActiveDown:
			state.AttemptMoveActivePiece(Pos{1, 0})
		case CommandHardDrop:
			state.HardDrop()
		case CommandHoldActive:
			state.HoldActivePiece()
		}
	}
	state.Tick(b.timeAt(idx))
	b.states[idx] = state
}
