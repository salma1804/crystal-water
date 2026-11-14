// Usage : node gen-mfa-secret.js
import crypto from 'crypto';
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const bytes = crypto.randomBytes(20);
let bits = '';
for (const b of bytes) bits += b.toString(2).padStart(8, '0');
let out = '';
for (let i = 0; i < bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
console.log('\nMFA_SECRET=' + out);
console.log('\nDans Google Authenticator : + > Saisir une clé de configuration');
console.log('Nom : Crystal Water admin | Clé : ' + out + ' | Type : basé sur l\'heure\n');