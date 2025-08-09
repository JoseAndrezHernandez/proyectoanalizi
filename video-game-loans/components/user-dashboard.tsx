"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/dialog"
import { Calendar, Monitor, Search, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

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

interface LoanRequest {
  id: string
  gameId: string
  gameTitle: string
  requestDate: string
  status: "pending" | "approved" | "rejected"
}

export function UserDashboard() {
  const [games, setGames] = useState<VideoGame[]>([])
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([])
  const [selectedGame, setSelectedGame] = useState<VideoGame | null>(null)
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterConsole, setFilterConsole] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadGames()
    loadLoanRequests()
  }, [])

  const loadGames = async () => {
    try {
      const response = await fetch("/api/games")
      if (response.ok) {
        const data = await response.json()
        setGames(data)
      }
    } catch (error) {
      console.error("Error loading games:", error)
    }
  }

  const loadLoanRequests = async () => {
    try {
      const response = await fetch(`/api/loan-requests?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setLoanRequests(data)
      }
    } catch (error) {
      console.error("Error loading loan requests:", error)
    }
  }

  const requestLoan = async () => {
    if (!selectedGame || !user) return

    try {
      const response = await fetch("/api/loan-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame.id,
          gameTitle: selectedGame.title,
          userId: user.id,
          userName: user.name,
        }),
      })

      if (response.ok) {
        const newRequest = await response.json()
        setLoanRequests([...loanRequests, newRequest])
        setIsRequestOpen(false)
        setSelectedGame(null)
        toast({
          title: "Solicitud enviada",
          description: "Tu solicitud de préstamo ha sido enviada al administrador",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar la solicitud",
        variant: "destructive",
      })
    }
  }

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || game.category === filterCategory
    const matchesConsole = filterConsole === "all" || game.console === filterConsole
    const isAvailable = game.available
    return matchesSearch && matchesCategory && matchesConsole && isAvailable
  })

  const categories = [...new Set(games.map((game) => game.category))]
  const consoles = [...new Set(games.map((game) => game.console))]

  const myActiveLoans = games.filter((game) => !game.available && game.borrowedBy === user?.name)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Juegos Disponibles</TabsTrigger>
          <TabsTrigger value="requests">Mis Solicitudes</TabsTrigger>
          <TabsTrigger value="loans">Mis Préstamos</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar juegos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Card key={game.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{game.category}</Badge>
                      <Badge variant="default">Disponible</Badge>
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
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedGame(game)
                      setIsRequestOpen(true)
                    }}
                  >
                    Solicitar Préstamo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid gap-4">
            <h2 className="text-2xl font-semibold">Mis Solicitudes de Préstamo</h2>
            {loanRequests.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No tienes solicitudes de préstamo</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {loanRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{request.gameTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          Solicitado: {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {request.status === "pending"
                          ? "Pendiente"
                          : request.status === "approved"
                            ? "Aprobada"
                            : "Rechazada"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <div className="grid gap-4">
            <h2 className="text-2xl font-semibold">Mis Préstamos Activos</h2>
            {myActiveLoans.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No tienes préstamos activos</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myActiveLoans.map((game) => (
                  <Card key={game.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{game.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Prestado desde:{" "}
                            {game.borrowedDate ? new Date(game.borrowedDate).toLocaleDateString() : "N/A"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Monitor className="h-4 w-4" />
                              {game.console}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {game.year}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-orange-500">En préstamo</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Préstamo</DialogTitle>
            <DialogDescription>
              {selectedGame && `¿Deseas solicitar el préstamo de "${selectedGame.title}"?`}
            </DialogDescription>
          </DialogHeader>
          {selectedGame && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <h4 className="font-semibold">Detalles del juego:</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <strong>Título:</strong> {selectedGame.title}
                  </p>
                  <p>
                    <strong>Categoría:</strong> {selectedGame.category}
                  </p>
                  <p>
                    <strong>Año:</strong> {selectedGame.year}
                  </p>
                  <p>
                    <strong>Consola:</strong> {selectedGame.console}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={requestLoan}>Confirmar Solicitud</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
