import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

const LOANS_FILE = path.join(process.cwd(), 'data', 'loans.json')
const GAMES_FILE = path.join(process.cwd(), 'data', 'games.json')

function readLoans() {
  try {
    if (!fs.existsSync(LOANS_FILE)) {
      return []
    }
    const data = fs.readFileSync(LOANS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading loans:', error)
    return []
  }
}

function writeLoans(loans: any[]) {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
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
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2))
  } catch (error) {
    console.error('Error writing games:', error)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const returnDate = new Date().toISOString().split("T")[0]

    const loans = readLoans()
    const games = readGames()

    // Actualizar el préstamo
    const loanIndex = loans.findIndex((loan: any) => loan.id === id)
    if (loanIndex !== -1) {
      loans[loanIndex].returnDate = returnDate
      writeLoans(loans)

      // Actualizar el juego como disponible
      const gameId = loans[loanIndex].gameId
      const gameIndex = games.findIndex((game: any) => game.id === gameId)
      if (gameIndex !== -1) {
        games[gameIndex].available = true
        delete games[gameIndex].borrowedBy
        delete games[gameIndex].borrowedDate
        writeGames(games)
      }
    }

    return NextResponse.json({
      message: "Préstamo actualizado",
      id,
      returnDate,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar el préstamo" }, { status: 500 })
  }
}
