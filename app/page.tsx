"use client"

import { Suspense } from "react"
import HomeClient from "./home-client"

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient />
    </Suspense>
  )
}
