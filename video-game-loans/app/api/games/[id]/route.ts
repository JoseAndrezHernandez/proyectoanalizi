import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'games.json')

function readGames() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return []
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading games:', error)
    return []
  }
}

function writeGames(games: any[]) {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(games, null, 2))
  } catch (error) {
    console.error('Error writing games:', error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const games = readGames()
    const filteredGames = games.filter((game: any) => game.id !== id)
    writeGames(filteredGames)
    
    return NextResponse.json({ message: "Juego eliminado", id }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar el juego" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const games = readGames()
    
    const gameIndex = games.findIndex((game: any) => game.id === id)
    if (gameIndex !== -1) {
      games[gameIndex] = { ...games[gameIndex], ...body }
      writeGames(games)
      return NextResponse.json(games[gameIndex], { status: 200 })
    }
    
    return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar el juego" }, { status: 500 })
  }
}
