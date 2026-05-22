// Testa o login admin diretamente
async function testLogin() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'DUCK-92B3-668D-0FD7-842F', recaptchaToken: '' }),
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
    if (res.ok) {
      console.log('✅ LOGIN FUNCIONOU!');
    } else {
      console.log('❌ LOGIN FALHOU');
    }
  } catch (err) {
    console.error('Erro:', err.message);
  }
}
testLogin();
