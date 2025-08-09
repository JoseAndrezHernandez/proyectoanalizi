import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'loan-requests.json')
const LOANS_FILE = path.join(process.cwd(), 'data', 'loans.json')
const GAMES_FILE = path.join(process.cwd(), 'data', 'games.json')

function readRequests() {
  try {
    if (!fs.existsSync(REQUESTS_FILE)) {
      return []
    }
    const data = fs.readFileSync(REQUESTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading requests:', error)
    return []
  }
}

function writeRequests(requests: any[]) {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2))
  } catch (error) {
    console.error('Error writing requests:', error)
  }
}

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
    const body = await request.json()
    const { action } = body

    const requests = readRequests()
    const loans = readLoans()
    const games = readGames()

    const requestIndex = requests.findIndex((req: any) => req.id === id)
    if (requestIndex === -1) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    const status = action === "approve" ? "approved" : "rejected"
    requests[requestIndex].status = status
    writeRequests(requests)

    // Si se aprueba, crear el préstamo y actualizar el juego
    if (action === "approve") {
      const request = requests[requestIndex]
      
      // Crear préstamo
      const newLoan = {
        id: Date.now().toString(),
        gameId: request.gameId,
        gameTitle: request.gameTitle,
        borrowerName: request.userName,
        borrowDate: new Date().toISOString().split("T")[0],
      }
      loans.push(newLoan)
      writeLoans(loans)

      // Actualizar juego
      const gameIndex = games.findIndex((game: any) => game.id === request.gameId)
      if (gameIndex !== -1) {
        games[gameIndex].available = false
        games[gameIndex].borrowedBy = request.userName
        games[gameIndex].borrowedDate = newLoan.borrowDate
        writeGames(games)
      }
    }

    return NextResponse.json({
      message: "Solicitud actualizada",
      id,
      status,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar la solicitud" }, { status: 500 })
  }
}
