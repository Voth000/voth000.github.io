import {
    simulationVertexShader,
    simulationFragmentShader,
    renderVertexShader,
    renderFragmentShader,
} from "./shaders.js";

document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById('glcanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
    });

    const scene = new THREE.Scene();
    const simScene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const dpr = Math.min(window.devicePixelRatio, 2);
    let width = window.innerWidth * dpr;
    let height = window.innerHeight * dpr;

    renderer.setPixelRatio(dpr);
    renderer.setSize(width / 2, height / 2, false);

    const options = {
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false,
    };

    let rtA = new THREE.WebGLRenderTarget(width / 2, height / 2, options);
    let rtB = new THREE.WebGLRenderTarget(width / 2, height / 2, options);

   

    const simMaterial = new THREE.ShaderMaterial({
        uniforms: {
            textureA: { value: null },
            mouse: { value: new THREE.Vector2(-10, -10) },
            resolution: { value: new THREE.Vector2(width / 2, height / 2) },
            time: { value: 0 },
            frame: { value: 0 },
            texelSize: { value: new THREE.Vector2(1.0 / width, 1.0 / height) }, // Initialize

        },
        vertexShader: simulationVertexShader,
        fragmentShader: simulationFragmentShader,
    });

    const renderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            textureA: { value: null },
            time: { value: 0 },
        },
        vertexShader: renderVertexShader,
        fragmentShader: renderFragmentShader,
        transparent: true,
        depthWrite: false,
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    const simQuad = new THREE.Mesh(plane, simMaterial);
    const renderQuad = new THREE.Mesh(plane, renderMaterial);

    simScene.add(simQuad);
    scene.add(renderQuad);

    let frame = 0;

    // **✅ Correct Mouse & Touch Position Mapping**
    function updateMousePosition(clientX, clientY) {
        const rect = renderer.domElement.getBoundingClientRect();

        let x = (clientX - rect.left) / rect.width;
        let y = 1.0 - (clientY - rect.top) / rect.height; // Flip Y

        // Scale to match simulation resolution (which is /2 of actual resolution)
        x *= width / 2;
        y *= height / 2;

        simMaterial.uniforms.mouse.value.set(x, y);
    }

    // ✅ Mouse Events
    renderer.domElement.addEventListener("mousemove", (e) => {
        updateMousePosition(e.clientX, e.clientY);
    });

    renderer.domElement.addEventListener("mouseleave", () => {
        simMaterial.uniforms.mouse.value.set(-10, -10);
    });

    // ✅ Touch Support for Mobile
    renderer.domElement.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    renderer.domElement.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    });
    

    renderer.domElement.addEventListener("touchend", () => {
 
        simMaterial.uniforms.mouse.value.set(-10, -10);
    });

    // ✅ Handle Window Resize
    window.addEventListener("resize", () => {
        width = window.innerWidth * dpr;
        height = window.innerHeight * dpr;

        renderer.setSize(width / 2, height / 2, false);
        rtA.setSize(width / 2, height / 2);
        rtB.setSize(width / 2, height / 2);

        simMaterial.uniforms.resolution.value.set(width / 2, height / 2);
        frame = 0;
    });

    // ✅ Animation Loop
    const animate = () => {
        simMaterial.uniforms.frame.value = frame++;
        simMaterial.uniforms.time.value = performance.now() / 1000;
        simMaterial.uniforms.textureA.value = rtA.texture;

        renderer.setRenderTarget(rtB);
        renderer.render(simScene, camera);

        renderMaterial.uniforms.textureA.value = rtB.texture;
        renderMaterial.uniforms.time.value = performance.now() / 1000;

        renderer.setRenderTarget(null);
        renderer.render(scene, camera);

        [rtA, rtB] = [rtB, rtA];

        requestAnimationFrame(animate);
    };

    animate();
});


const textContainer = document.getElementById("scroll-down");

// Only apply animations if on a large screen
if (window.innerWidth >= 1000) {
    applyTextEffects();
}

function applyTextEffects() {
    const text = textContainer.textContent;
    textContainer.innerHTML = ""; // Clear existing text

    text.split("").forEach(letter => {
        let span = document.createElement("span");
        span.textContent = letter;
        span.style.display = "inline-block"; 
        span.style.webkitTextFillColor = "rgba(0, 0, 0, 0.03)"; 
        span.style.webkitTextStroke = "1px rgba(122, 122, 122, 0.01)"; 
        span.style.transition = "all 0.1s ease-out"; 
        span.style.textShadow = "none"; 
        textContainer.appendChild(span);
    });

    const spans = document.querySelectorAll("#scroll-down span");

    function handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const middleScreenX = screenWidth / 2;
        const middleScreenY = screenHeight / 2;

        spans.forEach((span, index) => {
            const letterRect = span.getBoundingClientRect();
            const letterCenterX = letterRect.left + letterRect.width / 2;
            const letterCenterY = letterRect.top + letterRect.height / 2;

            const distanceFromMouseX = Math.abs(letterCenterX - mouseX);
            const distanceFromMouseY = Math.abs(letterCenterY - mouseY);

            const strokeThickness = Math.floor(((middleScreenX - distanceFromMouseX) / middleScreenX) * 8) + 1;
            const finalStroke = Math.min(9, Math.max(1, strokeThickness));
            span.style.webkitTextStrokeWidth = `${finalStroke}px`;

            const weight = Math.floor(((middleScreenY - distanceFromMouseY) / middleScreenY) * 400) + 100;
            let offset = (index / spans.length) * 300;
            span.style.fontVariationSettings = `'wght' ${Math.min(400, Math.max(100, weight + offset))}`;

            const scaleSize = 1 + (finalStroke / 30);
            span.style.transform = `scale(${scaleSize})`;

            const spacing = finalStroke * 1;
            span.style.marginRight = `${spacing}px`;

            const shadowIntensity = Math.max(0, (middleScreenX - distanceFromMouseX) / middleScreenX);
            span.style.textShadow = shadowIntensity > 0.1
                ? `rgba(123, 123, 123, ${shadowIntensity}) -1px -1px ${6 * shadowIntensity}px,
                   rgba(110, 110, 110, ${shadowIntensity}) -1px -1px ${12 * shadowIntensity}px,
                   rgba(122, 122, 122, ${shadowIntensity}) -1px -1px ${30 * shadowIntensity}px`
                : "none";
        });
    }

    document.addEventListener("mousemove", handleMouseMove);
}

// Function to handle scroll action when user clicks
function handleScrollDown() {
    const nextDiv = document.querySelector('#bo');
    if (nextDiv) {
        nextDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add event listener for click
document.getElementById("tap-here").addEventListener("click", handleScrollDown);
document.getElementById("scroll-down").addEventListener("click", handleScrollDown);

