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

    function getTexelSize() {
        return window.innerWidth < 500 ? 1.0 : 5.0;
    }

    const simMaterial = new THREE.ShaderMaterial({
        uniforms: {
            textureA: { value: null },
            mouse: { value: new THREE.Vector2(-10, -10) },
            resolution: { value: new THREE.Vector2(width / 2, height / 2) },
            time: { value: 0 },
            frame: { value: 0 },
            texelSize: { value: new THREE.Vector2(getTexelSize() / width, getTexelSize() / height) }, // ✅ Dynamic texelSize
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

    // ✅ Allow scrolling if the user is not touching the canvas
    renderer.domElement.addEventListener("touchstart", (e) => {
        if (e.target === renderer.domElement) {
            e.preventDefault();
            if (e.touches.length > 0) {
                updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
            }
        }
    }, { passive: false });

    renderer.domElement.addEventListener("touchmove", (e) => {
        if (e.target === renderer.domElement) {
            e.preventDefault();
            if (e.touches.length > 0) {
                updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
            }
        }
    }, { passive: false });

    renderer.domElement.addEventListener("touchend", () => {
        simMaterial.uniforms.mouse.value.set(-10, -10);
    });

    // ✅ Define updateTexelSize properly
    function updateTexelSize() {
        const texel = getTexelSize();
        simMaterial.uniforms.texelSize.value.set(texel / width, texel / height);
    }

    // ✅ Handle Window Resize
    window.addEventListener("resize", () => {
        const dpr = Math.min(window.devicePixelRatio, 2);
        width = window.innerWidth * dpr;
        height = window.innerHeight * dpr;

        renderer.setSize(width / 2, height / 2, false);
        rtA.setSize(width / 2, height / 2);
        rtB.setSize(width / 2, height / 2);

        simMaterial.uniforms.resolution.value.set(width / 2, height / 2);
        updateTexelSize();

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

    updateTexelSize(); // ✅ Initialize texelSize correctly
    animate();
});
