import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'games.json')

// Datos iniciales
const initialGames = [
  {
    id: "1",
    title: "The Legend of Zelda: Breath of the Wild",
    category: "Aventura",
    year: 2017,
    console: "Nintendo Switch",
    available: true,
  },
  { id: "2", title: "God of War", category: "Acción", year: 2018, console: "PlayStation 4", available: true },
  {
    id: "3",
    title: "Halo Infinite",
    category: "Shooter",
    year: 2021,
    console: "Xbox Series X",
    available: false,
    borrowedBy: "Juan Pérez",
    borrowedDate: "2024-01-15",
  },
  {
    id: "4",
    title: "Super Mario Odyssey",
    category: "Plataformas",
    year: 2017,
    console: "Nintendo Switch",
    available: true,
  },
  { id: "5", title: "Cyberpunk 2077", category: "RPG", year: 2020, console: "PC", available: true },
  {
    id: "6",
    title: "FIFA 24",
    category: "Deportes",
    year: 2023,
    console: "PlayStation 5",
    available: false,
    borrowedBy: "María García",
    borrowedDate: "2024-01-20",
  },
  { id: "7", title: "Minecraft", category: "Sandbox", year: 2011, console: "PC", available: true },
  {
    id: "8",
    title: "Call of Duty: Modern Warfare III",
    category: "Shooter",
    year: 2023,
    console: "Xbox Series X",
    available: true,
  },
]

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readGames() {
  try {
    ensureDataDirectory()
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialGames, null, 2))
      return initialGames
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading games:', error)
    return initialGames
  }
}

function writeGames(games: any[]) {
  try {
    ensureDataDirectory()
    fs.writeFileSync(DATA_FILE, JSON.stringify(games, null, 2))
  } catch (error) {
    console.error('Error writing games:', error)
  }
}

export async function GET() {
  try {
    const games = readGames()
    return NextResponse.json(games)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener los juegos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, category, year, console } = body

    const games = readGames()
    const newGame = {
      id: Date.now().toString(),
      title,
      category,
      year: parseInt(year),
      console,
      available: true,
    }

    games.push(newGame)
    writeGames(games)

    return NextResponse.json(newGame, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error al crear el juego" }, { status: 500 })
  }
}
