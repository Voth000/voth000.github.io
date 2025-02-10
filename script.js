import {
    simulationVertexShader,
    simulationFragmentShader,
    renderVertexShader,
    renderFragmentShader,
} from "./shaders.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('glcanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    const scene = new THREE.Scene();
    const simScene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas, // ✅ Use the existing canvas
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",

    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2, false);

    const mouse = new THREE.Vector2();
    let frame = 0;

    const width = window.innerWidth * window.devicePixelRatio;
    const height = window.innerHeight * window.devicePixelRatio;
    const options = {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false,
    };

    let rtA = new THREE.WebGLRenderTarget(width, height, options);
    let rtB = new THREE.WebGLRenderTarget(width, height, options);

    const simMaterial = new THREE.ShaderMaterial({
        uniforms: {
            textureA: { value: null },
            mouse: { value: mouse },
            resolution: { value: new THREE.Vector2(width, height) },
            time: { value: 0 },
            frame: { value: 0 },
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
        transparent: true, // Enable transparency
        depthWrite: false,   // ✅ Avoids z-buffer issues

    });
    
    
    

    const plane = new THREE.PlaneGeometry(2, 2);
    const simQuad = new THREE.Mesh(plane, simMaterial);
    const renderQuad = new THREE.Mesh(plane, renderMaterial);

    simScene.add(simQuad);
    scene.add(renderQuad);

    
    window.addEventListener("resize", () => {
        const dpr = Math.min(window.devicePixelRatio, 2);
        const newWidth = Math.round(window.innerWidth * dpr);
        const newHeight = Math.round(window.innerHeight * dpr);
    
        // Keep the rendering at half resolution for performance
        renderer.setSize(newWidth / 2, newHeight / 2, false); 
        rtA.setSize(newWidth / 2, newHeight / 2);
        rtB.setSize(newWidth / 2, newHeight / 2);
    
        // Update shader resolution
        simMaterial.uniforms.resolution.value.set(newWidth / 2, newHeight / 2);
        
        // Restart the simulation from the beginning
        frame = 0;
    });
    
    
    renderer.domElement.addEventListener("mousemove", (e) => {
        updateMousePosition(e.clientX, e.clientY);
    });
    
    renderer.domElement.addEventListener("mouseleave", () => {
        mouse.set(0, 0);
    });
    
    // 🟢 Touch events for mobile support
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
        mouse.set(0, 0);
    });
    
    // 🟢 Function to update the mouse position for both mouse & touch
    function updateMousePosition(clientX, clientY) {
        const rect = renderer.domElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio, 2);
    
        let mouseX = (clientX - rect.left) / rect.width;
        let mouseY = 1.0 - (clientY - rect.top) / rect.height; // Flip Y axis
    
        mouse.x = mouseX * (window.innerWidth * dpr);
        mouse.y = mouseY * (window.innerHeight * dpr);
    }
    

    
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
    
        const temp = rtA;
        rtA = rtB;
        rtB = temp;
    
        requestAnimationFrame(animate);
    };
    animate();
    
    
});
