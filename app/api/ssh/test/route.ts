import { NextRequest, NextResponse } from "next/server"
import { Client } from "ssh2"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { host, port, username, password } = body

    if (!host || !username || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 })
    }

    await new Promise<void>((resolve, reject) => {
      const conn = new Client()
      
      conn.on("ready", () => {
        conn.end()
        resolve()
      })

      conn.on("error", (err) => {
        reject(err)
      })

      conn.connect({
        host,
        port: port || 22,
        username,
        password,
        readyTimeout: 10000
      })
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Connection failed" 
    }, { status: 500 })
  }
}
