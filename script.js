const preloadResetImage = new Image();
preloadResetImage.src = 'https://raw.githubusercontent.com/ExT-Yeredey/AlwaysNin9CreativeStudio/main/Reset.webp';
const multiplierInput = document.getElementById("multiplier");
const stepsDiv = document.getElementById("steps");
const aiResponseDiv = document.getElementById("ai-response");
const resetButton = document.getElementById("resetButton");

function showResetButton() {
    resetButton.style.display = "block";

    requestAnimationFrame(() => {
        anime({
            targets: '#resetButton',
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 300,
            easing: 'easeOutSine'
        });
    });
}
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

let calculationInProgress = false;
const stepTypingDuration = 800;
const responseTypingDuration = 1500;
const typingSpeed = 25;
const postTypingDelay = 300;
const backendApiUrl = 'https://alwaysnin9calculator.azurewebsites.net/api/generate-message';
const debounceDelay = 2000;
const resetShowDelay = 2000;

window.addEventListener('load', () => {
    anime({
        targets: '.calculator-popup',
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: [-20, 0],
        duration: 600,
        easing: 'easeOutQuad'
    });
});

function validateInput(value) {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0 && num < 1000000;
}

function calculate() {
    if (calculationInProgress) return;
    const multiplierValue = multiplierInput.value;
    const multiplier = parseInt(multiplierValue, 10);
    stepsDiv.innerHTML = "";
    aiResponseDiv.innerHTML = "";

    if (multiplierValue === "0") {
        calculationInProgress = true;
        multiplierInput.disabled = true;
        resetButton.style.display = "none";

        const zeroMessage = "Has puesto un cero.\nMuy original… Enhorabuena rebelde\nPero.. el 9 ya lo había previsto.";
        const messageContainer = document.createElement('div');
        messageContainer.style.whiteSpace = 'pre-wrap';
        aiResponseDiv.appendChild(messageContainer);

        typeWriterEffect(messageContainer, zeroMessage, responseTypingDuration, () => {
            showResetButton();
            calculationInProgress = false;
        });
        return;
    }

    if (multiplierValue === "" || !validateInput(multiplierValue) || multiplier <= 0) {
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
    stepElement.style.opacity = 0;
    stepElement.style.transform = 'translateY(10px)';
    typeWriterEffect(stepElement, text, stepTypingDuration, () => {
        anime({
            targets: stepElement,
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 400,
            easing: 'easeOutSine',
            complete: callback
        });
    });
}

function sumDigits(number) {
    let sum = number.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    showStep(`${number.toString().split('').join(' + ')} = ${sum}`, () => {
        if (sum > 9) {
            sumDigits(sum);
        } else if (sum === 9) {
            popup.classList.add("pulse-glow");
            setTimeout(() => popup.classList.remove("pulse-glow"), 1000);
            showLoading();
            setTimeout(() => {
                generatePersonalizedIAResponse();
            }, 2500);
        } else {
            console.error("Suma final inesperada (no es 9):", sum);
            resetCalculator();
        }
    });
}

function typeWriterEffect(element, text, baseDuration, callback) {
    let i = 0;
    element.textContent = "";
    const textLength = Math.max(1, text.length);
    const estimatedInterval = Math.max(typingSpeed, baseDuration / textLength);

    function type() {
        if (i < text.length) {
            if (text.charAt(i) === '\n') {
                element.appendChild(document.createElement('br'));
            } else {
                element.appendChild(document.createTextNode(text.charAt(i)));
            }
            i++;
            setTimeout(type, estimatedInterval);
        } else {
            if (callback) {
                callback();
            }
        }
    }
    if (text.length > 0) {
        type();
    } else if (callback) {
        callback();
    }
}

function showLoading() {
    aiResponseDiv.innerHTML = "";
    const loadingMessage = document.createElement("div");
    aiResponseDiv.appendChild(loadingMessage);
    const loadingText = "Recordando tu esencia";
    let i = 0;

    function typeText() {
        if (i < loadingText.length) {
            loadingMessage.textContent += loadingText.charAt(i);
            i++;
            setTimeout(typeText, 40);
        } else {
            let dots = '';
            const dotInterval = setInterval(() => {
                dots += '.';
                if (dots.length > 3) dots = '';
                loadingMessage.textContent = loadingText + dots;
            }, 500);

            setTimeout(() => {
                clearInterval(dotInterval);
                if (loadingMessage && loadingMessage.parentElement === aiResponseDiv) {
                    aiResponseDiv.removeChild(loadingMessage);
                }
            }, 4000);
        }
    }

    typeText();
}

async function generatePersonalizedIAResponse() {
    try {
        const response = await fetch(backendApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
            typeWriterEffect(aiResponseDiv, aiMessage.trim(), responseTypingDuration + 1000, () => {
                calculationInProgress = false;
                multiplierInput.disabled = false;
                showResetButton();
            });
        } else {
            throw new Error("Formato de respuesta inesperado del backend.");
        }
    } catch (error) {
        console.error('Error al obtener respuesta del backend/IA:', error);
        aiResponseDiv.innerHTML = "";
        const fallbackMessage = brandEssenceMessages[Math.floor(Math.random() * brandEssenceMessages.length)];
        // Show typewriter effect for longer (duration increased for readability)
        typeWriterEffect(aiResponseDiv, ` ${fallbackMessage}`, responseTypingDuration + 1000, () => {
            calculationInProgress = false;
            multiplierInput.disabled = false;
            showResetButton();
        });
    }
}

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

multiplierInput.addEventListener("input", debounce(calculate, debounceDelay));
resetButton.addEventListener('click', resetCalculator);

function resetCalculator() {
    anime({
        targets: '#resetButton',
        opacity: [1, 0],
        scale: [1, 0.8],
        duration: 200,
        easing: 'easeInSine',
        complete: () => {
            resetButton.style.display = 'none';
            multiplierInput.value = "";
            multiplierInput.disabled = false;
            stepsDiv.textContent = "";
            aiResponseDiv.textContent = "";
            calculationInProgress = false;
            multiplierInput.focus();
            anime({
                targets: '.calculator-popup',
                duration: 500,
                easing: 'easeOutElastic(1, .8)',
                scale: [0.8, 1],
                opacity: [0.8, 1]
            });
        }
    });
}

// *** EFECTO 3D DE INTERACCIÓN SUAVE ***
const popup = document.querySelector('.calculator-popup');

if (window.matchMedia("(hover: hover)").matches) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        anime({
            targets: popup,
            rotateY: x * 10,
            rotateX: -y * 10,
            duration: 300,
            easing: 'easeOutQuad'
        });
    });

    document.addEventListener('mouseleave', () => {
        anime({
            targets: popup,
            rotateX: 0,
            rotateY: 0,
            duration: 500,
            easing: 'easeOutElastic(1, .6)'
        });
    });
}

popup.addEventListener('touchstart', () => {
    anime({
        targets: popup,
        rotateX: 1,
        rotateY: -1,
        scale: 0.98,
        duration: 200,
        easing: 'easeOutSine'
    });
});

popup.addEventListener('touchend', () => {
    anime({
        targets: popup,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 300,
        easing: 'easeOutElastic(1, .6)'
    });
});
