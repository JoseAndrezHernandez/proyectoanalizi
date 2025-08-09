"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "admin" | "user"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuarios predefinidos para demo
const DEMO_USERS: User[] = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@gameloans.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Juan Pérez",
    email: "juan@email.com",
    role: "user",
  },
  {
    id: "3",
    name: "María García",
    email: "maria@email.com",
    role: "user",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const savedUser = localStorage.getItem("gameLoans_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulación de autenticación
    const foundUser = DEMO_USERS.find((u) => u.email === email)

    if (foundUser && password === "123456") {
      setUser(foundUser)
      localStorage.setItem("gameLoans_user", JSON.stringify(foundUser))
      return true
    }

    return false
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulación de registro
    const newUser: User = {
      id: String(DEMO_USERS.length + 1),
      name,
      email,
      role: "user",
    }

    DEMO_USERS.push(newUser)
    setUser(newUser)
    localStorage.setItem("gameLoans_user", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("gameLoans_user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
