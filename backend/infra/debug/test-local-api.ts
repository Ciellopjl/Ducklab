import fs from 'fs'

async function test() {
  console.log('Testing local API...')
  try {
    // Create a dummy image or use an existing one
    // We will just send a very small base64 valid png
    const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    
    const res = await fetch('http://localhost:3000/api/admin/remove-bg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageBase64: base64 })
    })

    if (!res.ok) {
        console.error('Local API Error:', res.status)
        const text = await res.text()
        console.error('Body:', text)
        return
    }

    const data = await res.json()
    console.log('Success! Result:', data.result?.substring(0, 50))
  } catch(e) {
      console.error(e)
  }
}
test()
