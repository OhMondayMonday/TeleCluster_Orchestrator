import bcrypt from "bcrypt";

async function generarHashes() {
  const passwords = ["changeme", "hash_admin1"];
  for (const plain of passwords) {
    const hash = await bcrypt.hash(plain, 10);
    console.log(`${plain} => ${hash}`);
  }
}

generarHashes();
