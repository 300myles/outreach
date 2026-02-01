import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, company, message } = body

    // Google Forms submit endpoint - replace with your actual form ID
    const GOOGLE_FORM_ID = process.env.GOOGLE_FORM_CONTACT_ID
    
    if (!GOOGLE_FORM_ID) {
      return NextResponse.json(
        { error: 'Form not configured' },
        { status: 500 }
      )
    }

    const formData = new FormData()
    formData.append('entry.1234567894', fullName) // Replace with your field IDs
    formData.append('entry.1234567895', email)
    formData.append('entry.1234567896', phone)
    formData.append('entry.1234567897', company || '')
    formData.append('entry.1234567898', message)

    const response = await fetch(
      `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (response.ok || response.status === 200) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
