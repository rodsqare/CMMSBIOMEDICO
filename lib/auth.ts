export interface User {
  id: string
  email: string
  name: string
  role: string
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const isAuthenticated = localStorage.getItem("isAuthenticated")
  const email = localStorage.getItem("userEmail")
  const userId = localStorage.getItem("userId")
  const userName = localStorage.getItem("userName")
  const userRole = localStorage.getItem("userRole")

  if (isAuthenticated === "true" && email && userId) {
    return {
      id: userId,
      email: email,
      name: userName || "Usuario",
      role: userRole || "admin",
    }
  }

  return null
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("isAuthenticated") === "true"
}

export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("isAuthenticated")
  localStorage.removeItem("userEmail")
  localStorage.removeItem("userId")
  localStorage.removeItem("userName")
  localStorage.removeItem("userRole")
}
