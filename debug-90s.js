const fs = require('fs');

const content = fs.readFileSync('./90s.html', 'utf8');
const lines = content.split('\n');

let foundRound = false;
let foundMatch = false;

for (let i = 0; i < Math.min(100, lines.length); i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (trimmed.match(/Round\s+\d+\s+\[/)) {
    console.log(`Round encontrado en línea ${i + 1}: ${trimmed}`);
    foundRound = true;
  }
  
  if (trimmed.includes('Sporting Cristal') && trimmed.match(/\d+-\d+/)) {
    console.log(`Partido encontrado en línea ${i + 1}: ${trimmed}`);
    console.log(`  - Tiene tabs: ${line.includes('\t')}`);
    console.log(`  - Partes con tabs: ${line.split(/\t+/).length}`);
    console.log(`  - Partes con espacios: ${line.split(/\s{2,}/).length}`);
    foundMatch = true;
    
    if (foundMatch && foundRound) break;
  }
}


