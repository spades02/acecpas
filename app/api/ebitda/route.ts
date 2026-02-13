import { NextResponse } from "next/server"

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const res = await fetch(`${PYTHON_API_URL}/api/ebitda/bridge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const errorText = await res.text()
            return NextResponse.json(
                { error: `Backend Error (${res.status}): ${errorText}` },
                { status: res.status }
            )
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json(
            { error: `Connection Failed: ${error.message}` },
            { status: 500 }
        )
    }
}
