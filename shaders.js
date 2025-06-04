export const simulationVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const simulationFragmentShader = `
precision mediump float;
uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;
varying vec2 vUv;

const float delta = 1.2;
const float dampingFactor = 0.005;
const float viscosity = 0.002;
const float decay = 0.999;

void main() {
    vec2 uv = vUv;

    if (frame == 0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec4 data = texture2D(textureA, uv);
    float pressure = data.x;
    float pVel = data.y;

    // Precompute texel size once
    vec2 texelSize = (resolution.x > 500.0 ? 3.5 : 1.5) / resolution;
    
    // Optimized neighbor sampling with boundary checks
    vec2 rightUV = uv + vec2(texelSize.x, 0.0);
    vec2 leftUV = uv - vec2(texelSize.x, 0.0);
    vec2 upUV = uv + vec2(0.0, texelSize.y);
    vec2 downUV = uv - vec2(0.0, texelSize.y);
    
    // Clamp UVs to prevent boundary artifacts
    rightUV = clamp(rightUV, vec2(0.0), vec2(1.0));
    leftUV = clamp(leftUV, vec2(0.0), vec2(1.0));
    upUV = clamp(upUV, vec2(0.0), vec2(1.0));
    downUV = clamp(downUV, vec2(0.0), vec2(1.0));
    
    vec4 neighbors = vec4(
        texture2D(textureA, rightUV).x,
        texture2D(textureA, leftUV).x,
        texture2D(textureA, upUV).x,
        texture2D(textureA, downUV).x
    );

    // Simplified wave equation - combine horizontal and vertical updates
    float laplacian = (neighbors.x + neighbors.y + neighbors.z + neighbors.w - 4.0 * pressure) * 0.25;
    pVel += delta * laplacian;
    
    pressure += delta * pVel;
    pVel -= dampingFactor * delta * pressure;
    pVel *= 1.0 - viscosity * delta;
    pressure *= decay;

    // Initial ripple effect (optimized)
    if (frame < 2) {
        vec2 deltaUV = uv - vec2(0.5);
        float initDistSquared = dot(deltaUV, deltaUV);
        if (initDistSquared <= 0.25) {
            pressure += 2.5 * (1.0 - initDistSquared * 2.0);
        }
    }

    // Mouse ripple effect (optimized)
    if (mouse.x > 0.0) {
        vec2 mouseUV = mouse / resolution;
        vec2 mouseDelta = uv - mouseUV;
        float distSquared = dot(mouseDelta, mouseDelta);
        
        if (distSquared <= 0.0004) { // 0.02^2 = 0.0004
            float dist = sqrt(distSquared);
            float softness = smoothstep(0.02, 0.005, dist);
            pressure += 1.2 * softness;
        }
    }

    // Compute gradients for normal calculation
    float gradX = (neighbors.x - neighbors.y) * 0.5;
    float gradY = (neighbors.z - neighbors.w) * 0.5;

    gl_FragColor = vec4(pressure, pVel, gradX, gradY);
}
`;

export const renderVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const renderFragmentShader = `
precision mediump float;
uniform sampler2D textureA;
uniform float time;
varying vec2 vUv;

const vec3 customGreen = vec3(0.7, 1.0, 0.3);
const vec3 customBlue = vec3(1.0, 0.5, 0.6);
const float normalStrength = 0.2;

void main() {
    vec4 data = texture2D(textureA, vUv);
    
    // Precompute normal and time-based offsets
    vec3 normal = normalize(vec3(-data.z, normalStrength, -data.w));
    vec2 timeOffset = 0.02 * sin(time * 3.0) * vec2(0.007, 0.003);
    vec2 normalOffset = normal.xz;
    
    // Optimized offset calculations
    vec2 offsetG = 0.024 * normalOffset - timeOffset;
    vec2 offsetB = 0.022 * normalOffset + timeOffset;
    
    // Single texture sample for each offset
    vec2 sampleG = texture2D(textureA, vUv + offsetG).gb;
    vec2 sampleB = texture2D(textureA, vUv + offsetB).gb;
    
    // Combine colors
    vec3 rippleColor = sampleG.x * customGreen + sampleB.y * customBlue;
    float alpha = max(sampleG.x, sampleB.y) * 0.9;

    gl_FragColor = vec4(rippleColor, alpha);
}
`;