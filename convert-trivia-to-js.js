// Script para convertir JSON de preguntas a formato JavaScript
const fs = require('fs');

const preguntas = JSON.parse(fs.readFileSync('./trivia-questions-generated.json', 'utf8'));

// Convertir a formato JavaScript
let js = '// Base de datos de preguntas de trivia de Sporting Cristal\n';
js += '// Preguntas basadas en partidos específicos del histórico (1993-2025)\n';
js += '// Incluye: resultados, día de la semana, goleadores (2000+), torneos\n';
js += 'export const triviaQuestions = [\n';

preguntas.forEach((p, index) => {
  js += '  {\n';
  js += `    id: ${p.id},\n`;
  js += `    decade: "${p.decade}",\n`;
  js += `    question: ${JSON.stringify(p.question)},\n`;
  js += `    answer: ${JSON.stringify(p.answer)},\n`;
  js += `    category: "${p.category}",\n`;
  js += `    difficulty: "${p.difficulty}"\n`;
  js += '  }';
  if (index < preguntas.length - 1) {
    js += ',';
  }
  js += '\n';
});

js += '];\n\n';
js += '// Función para obtener preguntas por década\n';
js += 'export const getQuestionsByDecade = (decade) => {\n';
js += '  if (decade === "93-25" || decade === "00-24") {\n';
js += '    return triviaQuestions;\n';
js += '  }\n';
js += '  return triviaQuestions.filter(q => q.decade === decade || q.decade === "93-25");\n';
js += '};\n\n';
js += '// Función para obtener pregunta aleatoria\n';
js += 'export const getRandomQuestion = (decade = "93-25") => {\n';
js += '  const questions = getQuestionsByDecade(decade);\n';
js += '  const randomIndex = Math.floor(Math.random() * questions.length);\n';
js += '  return questions[randomIndex];\n';
js += '};\n';

fs.writeFileSync('./src/data/triviaQuestions.js', js, 'utf8');
console.log(`✅ Archivo actualizado con ${preguntas.length} preguntas`);

