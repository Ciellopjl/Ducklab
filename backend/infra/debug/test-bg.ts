import fs from 'fs'

async function test() {
  const pixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  console.log('Testing remove.bg...')
  try {
    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': '4x2PBh4NNum7WgSChtAJoKgd',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: pixel,
        size: 'auto',
      }),
    })

    if (!res.ok) {
        console.error('Error status:', res.status)
        const err = await res.text()
        console.error('Error body:', err)
        return
    }

    const data = await res.json()
    console.log('Success! Result b64 starts with:', data.data?.result_b64?.substring(0, 30))
  } catch(e) {
      console.error(e)
  }
}
test()
