package main

type Tetromino byte

const (
	S Tetromino = iota + 1
	Z
	J
	L
	T
	O
	I
)

var jlstzOffsets = [][]Pos{
	{
		{0, 0},
		{0, 0},
		{0, 0},
		{0, 0},
		{0, 0},
	},
	{
		{0, 0},
		{0, 1},
		{1, 1},
		{-2, 0},
		{-2, 1},
	},
	{
		{0, 0},
		{0, 0},
		{0, 0},
		{0, 0},
		{0, 0},
	},
	{
		{0, 0},
		{0, -1},
		{1, -1},
		{-2, 0},
		{-2, -1},
	},
}

var oOffsets = [][]Pos{
	{{0, 0}},
	{{1, 0}},
	{{1, -1}},
	{{0, -1}},
}

var iOffsets = [][]Pos{
	{
		{0, 0},
		{0, -1},
		{0, 2},
		{0, -1},
		{0, 2},
	},
	{
		{0, -1},
		{0, 0},
		{0, 0},
		{-1, 0},
		{2, 0},
	},
	{
		{-1, -1},
		{-1, 1},
		{-1, -2},
		{0, 1},
		{0, -2},
	},
	{
		{-1, 0},
		{-1, 0},
		{-1, 0},
		{1, 0},
		{-2, 0},
	},
}

var offsets = [][][]Pos{jlstzOffsets, jlstzOffsets, jlstzOffsets, jlstzOffsets, jlstzOffsets, oOffsets, iOffsets}

var minos = [][][]Pos{
	{{
		{1, 2},
		{1, 3},
		{2, 1},
		{2, 2},
	}},
	{{
		{1, 1},
		{1, 2},
		{2, 2},
		{2, 3},
	}},
	{{
		{1, 1},
		{2, 1},
		{2, 2},
		{2, 3},
	}},
	{{
		{1, 3},
		{2, 1},
		{2, 2},
		{2, 3},
	}},
	{{
		{1, 2},
		{2, 1},
		{2, 2},
		{2, 3},
	}},
	{{
		{1, 2},
		{1, 3},
		{2, 2},
		{2, 3},
	}},
	{{
		{2, 1},
		{2, 2},
		{2, 3},
		{2, 4},
	}},
}

func GetOffsets(t Tetromino, orientation byte) []Pos {
	return offsets[t-1][orientation]
}

func GetMinos(t Tetromino, orientation byte) []Pos {
	return minos[t-1][orientation]
}

func rotateMinos(minos []Pos) []Pos {
	result := []Pos{}
	for _, mino := range minos {
		result = append(result, Pos{mino.Col, 4 - mino.Row})
	}
	return result
}

func init() {
	for pieceType := range minos {
		for i := 0; i < 3; i++ {
			minos[pieceType] = append(minos[pieceType], rotateMinos(minos[pieceType][i]))
		}
	}
}
