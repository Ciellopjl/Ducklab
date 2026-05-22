async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'test', recaptchaToken: '' }),
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
test();
