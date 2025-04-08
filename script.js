const multiplierInput = document.getElementById("multiplier");
const stepsDiv = document.getElementById("steps");
const aiResponseDiv = document.getElementById("ai-response");
const resetButton = document.getElementById("resetButton");

const brandEssenceMessages = [
  "Recuerda la lección de la pizarra: no importa cuánto se compliquen las cosas, tu esencia siempre vuelve.",
  "Como el 9, tu 'número' interior te define. Vuelve a él para encontrar tu camino.",
  "La vida te presenta desafíos, pero tu esencia, tu '9', permanece inalterable.",
  "¿Sientes que has perdido el rumbo? Busca en tu interior, tu '9' personal te guiará de vuelta.",
  "Tu esencia es única, como la magia del 9. Siempre puedes reconectar con ella.",
  "always nin9 te recuerda: la esencia nunca desaparece. Vuelve a tu '9' para encontrar tu fuerza.",
  "Deja que la historia del 9 te inspire. Cuando todo se complique, vuelve a la simpleza de tu ser.",
  "Tu '9' es tu autenticidad. En un mundo complejo, recuerda quién eres realmente.",
  "Como nos enseñaron, tu esencia es un patrón perfecto. Síguelo para encontrar tu verdad.",
  "Permítete 'volver a la pizarra' de tu vida. Tu esencia, tu '9', siempre estará ahí para guiarte."
];

// --- Estado y Configuración ---
let calculationInProgress = false;
const stepTypingDuration = 800;
const responseTypingDuration = 1500;
const typingSpeed = 25;
const postTypingDelay = 300;
const backendApiUrl = 'https://alwaysnin9calculator.azurewebsites.net/api/generate-message';
const debounceDelay = 500;
const resetShowDelay = 2000;


function validateInput(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 && num < 1000000;
}

function calculate() {
  if (calculationInProgress) return;

  const multiplier = parseInt(multiplierInput.value, 10);
  stepsDiv.innerHTML = "";
  aiResponseDiv.innerHTML = "";

  if (!validateInput(multiplier)) {
    stepsDiv.innerHTML = `<div>⚠️ Por favor, introduce un número válido (1 - 999999).</div>`;
    resetButton.style.display = "none";
    calculationInProgress = false;
    multiplierInput.disabled = false;
    return;
  }

  calculationInProgress = true;
  multiplierInput.disabled = true;
  resetButton.style.display = "none";

  const product = 9 * multiplier;
  showStep(`9 × ${multiplier} = ${product}`, () => {
    sumDigits(product);
  });
}

function showStep(text, callback) {
  const stepElement = document.createElement("div");
  stepsDiv.appendChild(stepElement);
  typeWriterEffect(stepElement, text, stepTypingDuration, callback);
}

function sumDigits(number) {
  let sum = number.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  showStep(`${number.toString().split('').join(' + ')} = ${sum}`, () => {
    if (sum > 9) {
      sumDigits(sum);
    } else if (sum === 9) {
      generatePersonalizedIAResponse();
    } else {
      console.error("Suma final inesperada:", sum);
      resetCalculator();
    }
  });
}

function typeWriterEffect(element, text, baseDuration, callback) {
  let i = 0;
  element.textContent = "";
  const estimatedInterval = Math.max(typingSpeed, baseDuration / Math.max(1, text.length));

  const intervalId = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(intervalId);
      if (callback) {
        setTimeout(callback, postTypingDelay);
      }
    }
  }, estimatedInterval);
}

function showLoading() {
  aiResponseDiv.innerHTML = "";
  const loadingMessage = document.createElement("div");
  loadingMessage.textContent = "⏳ Recordando tu esencia...";
  aiResponseDiv.appendChild(loadingMessage);
}

async function generatePersonalizedIAResponse() {
    showLoading();

    try {
        const response = await fetch(backendApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status} del backend: ${errorText || response.statusText}`);
        }

        const responseData = await response.json();
        const aiMessage = responseData?.message;

        if (aiMessage) {
             aiResponseDiv.innerHTML = ""; 
             typeWriterEffect(aiResponseDiv, aiMessage.trim(), responseTypingDuration);
        } else {
            console.error("Respuesta del backend OK, pero falta campo 'message':", responseData);
            throw new Error("Formato de respuesta inesperado del backend.");
        }

    } catch (error) {
        console.error('Error al obtener respuesta del backend/IA:', error);
        aiResponseDiv.innerHTML = "";

        const randomIndex = Math.floor(Math.random() * brandEssenceMessages.length);
        const fallbackMessage = brandEssenceMessages[randomIndex];
        typeWriterEffect(aiResponseDiv, ` ${fallbackMessage}`, responseTypingDuration);

    } finally {
         const finalDelay = postTypingDelay + responseTypingDuration + 100;
         setTimeout(() => {
            resetButton.style.display = "block";
            calculationInProgress = false;
            multiplierInput.disabled = false;
        }, finalDelay);
    }
}


function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
  
    timeout = setTimeout(() => func(...args), delay);
  };
}

multiplierInput.addEventListener("input", debounce(calculate, debounceDelay));

resetButton.addEventListener('click', resetCalculator);


function resetCalculator() {
  multiplierInput.value = "";
  multiplierInput.disabled = false;
  stepsDiv.textContent = "";
  aiResponseDiv.textContent = "";
  resetButton.style.display = "none";
  calculationInProgress = false;
  multiplierInput.focus(); 
}
