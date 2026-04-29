const fs = require('fs');

console.log('Rozpoczynam testy jednostkowe na potrzebe CI/CD...');

if (fs.existsSync('./server.js') && fs.existsSync('./Dockerfile')) {
    console.log('✅ TEST ZALICZONY: Wymagane pliki istnieja.');
    process.exit(0); 
} else {
    console.error('❌ TEST NIEZALICZONY: Brak waznych plikow!');
    process.exit(1); 
}