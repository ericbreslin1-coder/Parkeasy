import bcrypt from 'bcrypt';

async function generateHash() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log('Hash for admin123:', hash);
  process.exit(0);
}

generateHash();