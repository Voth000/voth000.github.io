export const simulationVertexShader = `
varying vec2 vUv;
void main() {
vUv = uv;
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;


export const simulationFragmentShader = `
uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform vec2 texelSize;
uniform float time;
uniform int frame;
varying vec2 vUv;

const float delta = 1.2;

void main() {
vec2 uv = vUv;
if (frame == 0) {
gl_FragColor = vec4(0.0);
return;
}

vec4 data = texture2D(textureA, uv);
float pressure = data.x;
float pVel = data.y;


    float texelSizeFactor = resolution.x > 500.0 ? 4.0 : 2.5; 
    vec2 texelSize = texelSizeFactor / resolution; 
    float p_right = texture2D(textureA, uv + vec2(texelSize.x, 0.0)).x;
    float p_left  = texture2D(textureA, uv + vec2(-texelSize.x, 0.0)).x;
    float p_up    = texture2D(textureA, uv + vec2(0.0, texelSize.y)).x;
    float p_down  = texture2D(textureA, uv + vec2(0.0, -texelSize.y)).x;

    if (uv.x <= texelSize.x) p_left = p_right;
    if (uv.x >= 1.0 - texelSize.x) p_right = p_left;
	if (uv.y <= texelSize.y) p_down = p_up;
    if (uv.y >= 1.0 - texelSize.y) p_up = p_down;

    pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
   
    pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;
    
  
    pressure += delta * pVel;
    
    
    pVel -= 0.005 * delta * pressure;
    
    
    pVel *= 1.0 - 0.002 * delta;
    
   
    pressure *= 0.999;
    

    vec2 mouseUV = mouse / resolution;
   // Stronger initial ripple effect at the center when the page loads
vec2 initialCenter = vec2(0.5, 0.5);
vec2 deltaUV = uv - initialCenter; 
float initDistSquared = dot(deltaUV, deltaUV);  // Faster than distance()

if(frame < 2) {  // Reduce frame count for better performance
    if(initDistSquared <= 0.25) {  // Increase ripple size
        float softness = 1.0 - initDistSquared * 2.0;  // Faster fade-out effect
        pressure += 2.5 * max(softness, 0.0);  // Stronger effect
    }
}



// Regular mouse ripple effect
if(mouse.x > 0.0) {
    float dist = distance(uv, mouseUV);
    if(dist <= 0.02) {
        float softness = smoothstep(0.02, 0.005, dist);
        pressure += 1.2 * softness;
    }
}

    
   gl_FragColor = vec4(pressure, pVel, (p_right - p_left) / 2.0, (p_up - p_down) / 2.0);
   

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
uniform sampler2D textureA;
varying vec2 vUv;
uniform float time;

// Define the custom ripple colors
const vec3 customGreen = vec3(0.6, 1, 0.2);  // Adjust green shade
const vec3 customBlue  = vec3(0.7, 1, 0.2);   // Adjust blue shade


void main() {
    vec4 data = texture2D(textureA, vUv);
    vec3 normal = normalize(vec3(-data.z, 0.2, -data.w));

    float timeOffset = 0.02 * sin(time * 3.0);

    // Adjust ripple offsets
    vec2 offsetG = 0.024 * normal.xz - timeOffset * vec2(0.007, 0.003);
    vec2 offsetB = 0.022 * normal.xz + timeOffset * vec2(-0.003, 0.007);

    // Sample colors from texture with slight shifts
    vec4 colG = texture2D(textureA, vUv + offsetG);
    vec4 colB = texture2D(textureA, vUv + offsetB);

    // Compute ripple intensity
    float rippleStrengthG = colG.g;
    float rippleStrengthB = colB.b;

    // Apply custom colors
    vec3 rippleColor = (rippleStrengthG * customGreen) + (rippleStrengthB * customBlue);

    // Set transparency: more transparent in calm areas
    float alpha = max(rippleStrengthG, rippleStrengthB) * 0.9;

    gl_FragColor = vec4(rippleColor, alpha);
}






`;