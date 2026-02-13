import { NextResponse } from "next/server"

// Default to standard FastAPI port
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        console.log(`Forwarding consolidation request to ${PYTHON_API_URL}/api/consolidation/pl`)

        const res = await fetch(`${PYTHON_API_URL}/api/consolidation/pl`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error("Python Backend Error:", errorText)
            return NextResponse.json(
                { error: `Backend Error (${res.status}): ${errorText}` },
                { status: res.status }
            )
        }

        const data = await res.json()
        return NextResponse.json(data)

    } catch (error: any) {
        console.error("Consolidation Proxy Error:", error)
        return NextResponse.json(
            { error: `Connection Failed: ${error.message}. Is the Python backend running on ${PYTHON_API_URL}?` },
            { status: 500 }
        )
    }
}
