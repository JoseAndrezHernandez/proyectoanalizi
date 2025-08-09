import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

const LOANS_FILE = path.join(process.cwd(), 'data', 'loans.json')
const GAMES_FILE = path.join(process.cwd(), 'data', 'games.json')

const initialLoans = [
  {
    id: "1",
    gameId: "3",
    gameTitle: "Halo Infinite",
    borrowerName: "Juan Pérez",
    borrowDate: "2024-01-15",
  },
  {
    id: "2",
    gameId: "6",
    gameTitle: "FIFA 24",
    borrowerName: "María García",
    borrowDate: "2024-01-20",
  },
]

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readLoans() {
  try {
    ensureDataDirectory()
    if (!fs.existsSync(LOANS_FILE)) {
      fs.writeFileSync(LOANS_FILE, JSON.stringify(initialLoans, null, 2))
      return initialLoans
    }
    const data = fs.readFileSync(LOANS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading loans:', error)
    return initialLoans
  }
}

function writeLoans(loans: any[]) {
  try {
    ensureDataDirectory()
    fs.writeFileSync(LOANS_FILE, JSON.stringify(loans, null, 2))
  } catch (error) {
    console.error('Error writing loans:', error)
  }
}

function readGames() {
  try {
    if (!fs.existsSync(GAMES_FILE)) {
      return []
    }
    const data = fs.readFileSync(GAMES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading games:', error)
    return []
  }
}

function writeGames(games: any[]) {
  try {
    ensureDataDirectory()
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2))
  } catch (error) {
    console.error('Error writing games:', error)
  }
}

export async function GET() {
  try {
    const loans = readLoans()
    return NextResponse.json(loans)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener los préstamos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId, gameTitle, borrowerName } = body

    const loans = readLoans()
    const games = readGames()

    const newLoan = {
      id: Date.now().toString(),
      gameId,
      gameTitle,
      borrowerName,
      borrowDate: new Date().toISOString().split("T")[0],
    }

    loans.push(newLoan)
    writeLoans(loans)

    // Actualizar el juego como no disponible
    const gameIndex = games.findIndex((game: any) => game.id === gameId)
    if (gameIndex !== -1) {
      games[gameIndex].available = false
      games[gameIndex].borrowedBy = borrowerName
      games[gameIndex].borrowedDate = newLoan.borrowDate
      writeGames(games)
    }

    return NextResponse.json(newLoan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error al crear el préstamo" }, { status: 500 })
  }
}
