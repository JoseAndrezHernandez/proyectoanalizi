import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'loan-requests.json')

const initialLoanRequests = [
  {
    id: "1",
    gameId: "1",
    gameTitle: "The Legend of Zelda: Breath of the Wild",
    userId: "2",
    userName: "Juan Pérez",
    requestDate: "2024-01-10",
    status: "approved",
  },
  {
    id: "2",
    gameId: "5",
    gameTitle: "Cyberpunk 2077",
    userId: "3",
    userName: "María García",
    requestDate: "2024-01-18",
    status: "pending",
  },
]

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readRequests() {
  try {
    ensureDataDirectory()
    if (!fs.existsSync(REQUESTS_FILE)) {
      fs.writeFileSync(REQUESTS_FILE, JSON.stringify(initialLoanRequests, null, 2))
      return initialLoanRequests
    }
    const data = fs.readFileSync(REQUESTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading requests:', error)
    return initialLoanRequests
  }
}

function writeRequests(requests: any[]) {
  try {
    ensureDataDirectory()
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2))
  } catch (error) {
    console.error('Error writing requests:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let requests = readRequests()

    if (userId) {
      requests = requests.filter((req: any) => req.userId === userId)
    }

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener las solicitudes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId, gameTitle, userId, userName } = body

    const requests = readRequests()
    const newRequest = {
      id: Date.now().toString(),
      gameId,
      gameTitle,
      userId,
      userName,
      requestDate: new Date().toISOString().split("T")[0],
      status: "pending",
    }

    requests.push(newRequest)
    writeRequests(requests)

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error al crear la solicitud" }, { status: 500 })
  }
}
