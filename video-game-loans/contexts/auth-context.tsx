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
    // Comentar esta parte para que siempre inicie en login
    // const savedUser = localStorage.getItem("gameLoans_user")
    // if (savedUser) {
    //   setUser(JSON.parse(savedUser))
    // }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Cargar usuarios guardados
      const savedUsers = JSON.parse(localStorage.getItem("gameLoans_users") || "[]")
      const savedPasswords = JSON.parse(localStorage.getItem("gameLoans_passwords") || "{}")

      // Combinar usuarios demo con usuarios guardados
      const allUsers = [...DEMO_USERS, ...savedUsers]

      // Buscar usuario
      const foundUser = allUsers.find((u) => u.email === email)

      // Verificar contraseña (demo users usan "123456", usuarios guardados usan su contraseña)
      const isValidPassword =
        foundUser && ((DEMO_USERS.includes(foundUser) && password === "123456") || savedPasswords[email] === password)

      if (foundUser && isValidPassword) {
        setUser(foundUser)
        localStorage.setItem("gameLoans_user", JSON.stringify(foundUser))
        return true
      }

      return false
    } catch (error) {
      console.error("Error logging in:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Verificar si el usuario ya existe
      const existingUsers = JSON.parse(localStorage.getItem("gameLoans_users") || "[]")
      const userExists = existingUsers.find((u: User) => u.email === email)

      if (userExists) {
        return false // Usuario ya existe
      }

      // Crear nuevo usuario
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: "user", // Los nuevos usuarios son tipo "user" por defecto
      }

      // Guardar contraseña (en un proyecto real usarías hash)
      const passwords = JSON.parse(localStorage.getItem("gameLoans_passwords") || "{}")
      passwords[email] = password

      // Guardar usuario y contraseña
      existingUsers.push(newUser)
      localStorage.setItem("gameLoans_users", JSON.stringify(existingUsers))
      localStorage.setItem("gameLoans_passwords", JSON.stringify(passwords))

      return true
    } catch (error) {
      console.error("Error registering user:", error)
      return false
    }
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
