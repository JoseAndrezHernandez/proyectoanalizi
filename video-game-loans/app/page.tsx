"use client"

import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { Header } from "@/components/header"
import { UserDashboard } from "@/components/user-dashboard"
import { AuthProvider } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Plus, GamepadIcon, Calendar, Monitor, User, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Clock } from "lucide-react"

interface VideoGame {
  id: string
  title: string
  category: string
  year: number
  console: string
  available: boolean
  borrowedBy?: string
  borrowedDate?: string
}

interface Loan {
  id: string
  gameId: string
  gameTitle: string
  borrowerName: string
  borrowDate: string
  returnDate?: string
}

interface LoanRequest {
  id: string
  gameId: string
  gameTitle: string
  userId: string
  userName: string
  requestDate: string
  status: "pending" | "approved" | "rejected"
}

function AdminDashboard() {
  const [games, setGames] = useState<VideoGame[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([])
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)
  const [isLoanGameOpen, setIsLoanGameOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<VideoGame | null>(null)
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterConsole, setFilterConsole] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const [newGame, setNewGame] = useState({
    title: "",
    category: "",
    year: new Date().getFullYear(),
    console: "",
  })

  const [borrowerName, setBorrowerName] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const gamesResponse = await fetch("/api/games")
      const loansResponse = await fetch("/api/loans")
      const requestsResponse = await fetch("/api/loan-requests")

      if (gamesResponse.ok && loansResponse.ok && requestsResponse.ok) {
        const gamesData = await gamesResponse.json()
        const loansData = await loansResponse.json()
        const requestsData = await requestsResponse.json()
        setGames(gamesData)
        setLoans(loansData)
        setLoanRequests(requestsData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const addGame = async () => {
    if (!newGame.title || !newGame.category || !newGame.console) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGame),
      })

      if (response.ok) {
        const game = await response.json()
        setGames([...games, game])
        setNewGame({ title: "", category: "", year: new Date().getFullYear(), console: "" })
        setIsAddGameOpen(false)
        toast({
          title: "Éxito",
          description: "Juego agregado correctamente",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al agregar el juego",
        variant: "destructive",
      })
    }
  }

  const deleteGame = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setGames(games.filter((game) => game.id !== gameId))
        toast({
          title: "Éxito",
          description: "Juego eliminado correctamente",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el juego",
        variant: "destructive",
      })
    }
  }

  const loanGame = async () => {
    if (!selectedGame || !borrowerName) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame.id,
          gameTitle: selectedGame.title,
          borrowerName,
        }),
      })

      if (response.ok) {
        const loan = await response.json()
        setLoans([...loans, loan])
        setGames(
          games.map((game) =>
            game.id === selectedGame.id
              ? {
                  ...game,
                  available: false,
                  borrowedBy: borrowerName,
                  borrowedDate: new Date().toISOString().split("T")[0],
                }
              : game,
          ),
        )
        setBorrowerName("")
        setSelectedGame(null)
        setIsLoanGameOpen(false)
        toast({
          title: "Éxito",
          description: "Juego prestado correctamente",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al prestar el juego",
        variant: "destructive",
      })
    }
  }

  const returnGame = async (loanId: string, gameId: string) => {
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: "PUT",
      })

      if (response.ok) {
        setLoans(
          loans.map((loan) =>
            loan.id === loanId ? { ...loan, returnDate: new Date().toISOString().split("T")[0] } : loan,
          ),
        )
        setGames(
          games.map((game) =>
            game.id === gameId ? { ...game, available: true, borrowedBy: undefined, borrowedDate: undefined } : game,
          ),
        )
        toast({
          title: "Éxito",
          description: "Juego devuelto correctamente",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al devolver el juego",
        variant: "destructive",
      })
    }
  }

  const handleLoanRequest = async (requestId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/loan-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const updatedRequest = await response.json()
        setLoanRequests(
          loanRequests.map((req) => (req.id === requestId ? { ...req, status: updatedRequest.status } : req)),
        )

        if (action === "approve") {
          // Actualizar el juego como prestado
          const request = loanRequests.find((req) => req.id === requestId)
          if (request) {
            setGames(
              games.map((game) =>
                game.id === request.gameId
                  ? {
                      ...game,
                      available: false,
                      borrowedBy: request.userName,
                      borrowedDate: new Date().toISOString().split("T")[0],
                    }
                  : game,
              ),
            )

            // Crear el préstamo
            const newLoan = {
              id: Date.now().toString(),
              gameId: request.gameId,
              gameTitle: request.gameTitle,
              borrowerName: request.userName,
              borrowDate: new Date().toISOString().split("T")[0],
            }
            setLoans([...loans, newLoan])
          }
        }

        toast({
          title: "Éxito",
          description: `Solicitud ${action === "approve" ? "aprobada" : "rechazada"} correctamente`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la solicitud",
        variant: "destructive",
      })
    }
  }

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || game.category === filterCategory
    const matchesConsole = filterConsole === "all" || game.console === filterConsole
    return matchesSearch && matchesCategory && matchesConsole
  })

  const categories = [...new Set(games.map((game) => game.category))]
  const consoles = [...new Set(games.map((game) => game.console))]
  const activeLoans = loans.filter((loan) => !loan.returnDate)
  const pendingRequests = loanRequests.filter((req) => req.status === "pending")

  return (
    <div className="space-y-6">
      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="games">Videojuegos</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Solicitudes
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="loans">Préstamos</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Buscar juegos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterConsole} onValueChange={setFilterConsole}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Filtrar por consola" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las consolas</SelectItem>
                  {consoles.map((console) => (
                    <SelectItem key={console} value={console}>
                      {console}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddGameOpen} onOpenChange={setIsAddGameOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Juego
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Juego</DialogTitle>
                  <DialogDescription>Completa la información del videojuego</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newGame.title}
                      onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                      placeholder="Nombre del juego"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      value={newGame.category}
                      onChange={(e) => setNewGame({ ...newGame, category: e.target.value })}
                      placeholder="Ej: Acción, RPG, Deportes"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">Año</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newGame.year}
                      onChange={(e) => setNewGame({ ...newGame, year: Number.parseInt(e.target.value) })}
                      min="1970"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="console">Consola</Label>
                    <Input
                      id="console"
                      value={newGame.console}
                      onChange={(e) => setNewGame({ ...newGame, console: e.target.value })}
                      placeholder="Ej: PlayStation 5, Xbox Series X"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addGame}>Agregar Juego</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Card key={game.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGame(game.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{game.category}</Badge>
                      <Badge variant={game.available ? "default" : "destructive"}>
                        {game.available ? "Disponible" : "Prestado"}
                      </Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {game.year}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Monitor className="h-4 w-4" />
                    {game.console}
                  </div>
                  {!game.available && game.borrowedBy && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Prestado a: {game.borrowedBy}
                    </div>
                  )}
                  {game.available && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedGame(game)
                        setIsLoanGameOpen(true)
                      }}
                    >
                      Prestar Juego
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid gap-4">
            <h2 className="text-2xl font-semibold">Solicitudes de Préstamo ({pendingRequests.length} pendientes)</h2>
            {loanRequests.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No hay solicitudes de préstamo</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {loanRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{request.gameTitle}</h3>
                        <p className="text-sm text-muted-foreground">Solicitado por: {request.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          Fecha: {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleLoanRequest(request.id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleLoanRequest(request.id, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        ) : (
                          <Badge variant={request.status === "approved" ? "default" : "destructive"}>
                            {request.status === "approved" ? "Aprobada" : "Rechazada"}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <div className="grid gap-4">
            <h2 className="text-2xl font-semibold">Préstamos Activos ({activeLoans.length})</h2>
            {activeLoans.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No hay préstamos activos</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeLoans.map((loan) => (
                  <Card key={loan.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{loan.gameTitle}</h3>
                        <p className="text-sm text-muted-foreground">Prestado a: {loan.borrowerName}</p>
                        <p className="text-sm text-muted-foreground">
                          Fecha de préstamo: {new Date(loan.borrowDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button onClick={() => returnGame(loan.id, loan.gameId)} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Devolver
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <h2 className="text-2xl font-semibold">Historial de Préstamos</h2>
            {loans.filter((loan) => loan.returnDate).length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No hay préstamos en el historial</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {loans
                  .filter((loan) => loan.returnDate)
                  .map((loan) => (
                    <Card key={loan.id}>
                      <CardContent className="p-6">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{loan.gameTitle}</h3>
                          <p className="text-sm text-muted-foreground">Prestado a: {loan.borrowerName}</p>
                          <p className="text-sm text-muted-foreground">
                            Préstamo: {new Date(loan.borrowDate).toLocaleDateString()} - Devolución:{" "}
                            {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : "Pendiente"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Juegos</CardTitle>
                <GamepadIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{games.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Juegos Disponibles</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{games.filter((g) => g.available).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
                <User className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeLoans.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequests.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isLoanGameOpen} onOpenChange={setIsLoanGameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prestar Juego</DialogTitle>
            <DialogDescription>{selectedGame && `Prestar "${selectedGame.title}" a un usuario`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="borrower">Nombre del usuario</Label>
              <Input
                id="borrower"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={loanGame}>Confirmar Préstamo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">{user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}</main>
    </div>
  )
}

export default function VideoGameLoans() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
