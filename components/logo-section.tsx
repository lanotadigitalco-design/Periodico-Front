"use client"

import Link from "next/link"
import Image from "next/image"

export function LogoSection() {
  return (
<Link href="/" className="flex items-center justify-center flex-shrink-0">
      <Image src="/logo.png" alt="La Nota Digital" width={500} height={50} className="h-10 md:h-10 w-auto" priority />
    </Link>
  )

  }