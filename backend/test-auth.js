import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api';

async function runTests() {
  const testEmail = `test_${Date.now()}@example.com`;
  const password = 'password123';

  console.log('--- STARTING AUTH API TESTS ---');

  try {
    // 1. Test Signup
    console.log(`\n[1] Mendaftar dengan email: ${testEmail}`);
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password, phone: '08123456789' }),
    });
    const signupData = await signupRes.json();
    console.log('Signup Status:', signupRes.status);
    console.log('Signup Response:', signupData);
    if (signupRes.status !== 201) throw new Error('Signup failed');

    // 2. Coba Login sebelum verifikasi (harus gagal)
    console.log(`\n[2] Coba login sebelum verifikasi OTP...`);
    const loginFailRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password }),
    });
    const loginFailData = await loginFailRes.json();
    console.log('Login Status (Unverified):', loginFailRes.status);
    console.log('Login Response:', loginFailData);
    if (loginFailRes.status !== 403) throw new Error('Seharusnya dilarang login (403)');

    // 3. Ambil OTP dari Database
    console.log(`\n[3] Mengambil OTP dari Database...`);
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!user || !user.verificationToken) throw new Error('User atau OTP tidak ditemukan di DB');
    const otp = user.verificationToken;
    console.log(`OTP ditemukan: ${otp}`);

    // 4. Verifikasi Email
    console.log(`\n[4] Memverifikasi Email dengan OTP...`);
    const verifyRes = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp }),
    });
    const verifyData = await verifyRes.json();
    console.log('Verify Status:', verifyRes.status);
    console.log('Verify Response:', verifyData);
    if (verifyRes.status !== 200) throw new Error('Verifikasi gagal');

    // 5. Coba Login setelah verifikasi (harus berhasil)
    console.log(`\n[5] Coba login setelah verifikasi...`);
    const loginSuccessRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password }),
    });
    const loginSuccessData = await loginSuccessRes.json();
    console.log('Login Status (Verified):', loginSuccessRes.status);
    console.log('Login Response:', loginSuccessData);
    if (loginSuccessRes.status !== 200 || !loginSuccessData.token) {
      throw new Error('Login gagal padahal sudah diverifikasi');
    }

    console.log('\n✅ SEMUA TEST AUTHENTICATION BERHASIL LULUS!');

  } catch (error) {
    console.error('\n❌ TEST GAGAL:', error.message);
  } finally {
    // Bersihkan user testing
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test_' } } });
    await prisma.$disconnect();
  }
}

runTests();
