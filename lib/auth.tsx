"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export const setToken = (token: string | null, user?: any) => {
    if (!token) {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    } else {
        const expires = new Date()
        expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
        document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}`
        if (user) document.cookie = `user=${JSON.stringify(user)}; path=/; expires=${expires.toUTCString()}`
    }
}

export const getToken = () => {
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'token') {
            return value || null
        }
    }
    return null
}

export const getUser = () => {
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'user') {
            try {
                return JSON.parse(decodeURIComponent(value))
            } catch {
                return null
            }
        }
    }
    return null
}

export const logout = () => {
    setToken(null)
    if (typeof window !== "undefined") window.location.href = "/login"
}

export const refreshUser = (updatedUser: any) => {
    const token = getToken()
    if (token && updatedUser) {
        const expires = new Date()
        expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
        document.cookie = `user=${JSON.stringify(updatedUser)}; path=/; expires=${expires.toUTCString()}`
    }
}

export function useAuth() {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    const refreshUser = (updatedUser: any) => {
        setUser(updatedUser)
        const token = getToken()
        if (token && updatedUser) {
            const expires = new Date()
            expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
            document.cookie = `user=${JSON.stringify(updatedUser)}; path=/; expires=${expires.toUTCString()}`
        }
    }

    useEffect(() => {
        const token = getToken()
        const storedUser = getUser()
        if (!token || !storedUser) {
            setLoading(false)
            setUser(null)
            return
        }

        setUser(storedUser)
        setLoading(false)
    }, [])

    const ensureAuth = () => {
        const token = getToken()
        if (!token) {
            router.push("/login")
        }
    }

    return { loading, user, ensureAuth, refreshUser }
}
