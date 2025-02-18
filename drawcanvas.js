


const asteroidCanvas = document.getElementById("drawcanvas");
const context = asteroidCanvas.getContext("2d");

let mouseX = asteroidCanvas.width / 2, mouseY = 0;

function resizeCanvas() {
  asteroidCanvas.width = window.innerWidth ;  // Full screen width
  asteroidCanvas.height = window.innerHeight ;  // Full screen height
  draw();
}
resizeCanvas();



function drawLimaçonShape(context, x, y, size, angle) {
  context.beginPath();
  for (let i = 0; i < 80; i++) {
    let theta = i / 80 * 2 * Math.PI;
    let r = size * Math.sin(2 * theta);
    let pointX = x + r * Math.cos(theta);
    let pointY = y + r * Math.sin(theta);
    let rotatedPoint = rotatePoint(pointX, pointY, x, y, angle);
    pointX = rotatedPoint.x;
    pointY = rotatedPoint.y;
    i === 0 ? context.moveTo(pointX, pointY) : context.lineTo(pointX, pointY);
  }
  context.closePath();
  context.fill();
  context.stroke();
}

function drawAsteroid(context, x, y, size) {
  context.beginPath();
  for (let i = 0; i < 60; i++) {
    let t = i / 60 * 2 * Math.PI;
    let pointX = x + size * Math.pow(Math.cos(t), 3);
    let pointY = y + size * Math.pow(Math.sin(t), 3);
    i === 0 ? context.moveTo(pointX, pointY) : context.lineTo(pointX, pointY);
  }
  context.closePath();
  context.fill();
  context.stroke();
}

function rotatePoint(x, y, centerX, centerY, angle) {
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  let translatedX = x - centerX;
  let translatedY = y - centerY;
  let rotatedX = translatedX * cosAngle - translatedY * sinAngle;
  let rotatedY = translatedX * sinAngle + translatedY * cosAngle;
  rotatedX += centerX;
  rotatedY += centerY;
  return { x: rotatedX, y: rotatedY };
}

function getBoundingBoxForShape(x, y, size, isLimaçon) {
    // Get the bounding box of the shape based on its position and size
    let minX, maxX, minY, maxY;
    
    if (isLimaçon) {
      // For Limaçon, calculate a bounding box based on the shape's radius and rotation
      minX = x - size;
      maxX = x + size;
      minY = y - size;
      maxY = y + size;
    } else {
      // For Asteroid, also use size-based bounds
      minX = x - size;
      maxX = x + size;
      minY = y - size;
      maxY = y + size;
    }
    
    return { minX, maxX, minY, maxY };
  }
  
  function isBoundingBoxOverlap(bbox1, bbox2) {
    return !(bbox1.maxX < bbox2.minX || bbox1.minX > bbox2.maxX || bbox1.maxY < bbox2.minY || bbox1.minY > bbox2.maxY);
  }
  function draw() {
    context.clearRect(0, 0, asteroidCanvas.width, asteroidCanvas.height);
    context.fillStyle = "rgba(255, 255, 255, 0)";
    context.fillRect(0, 0, asteroidCanvas.width, asteroidCanvas.height);
    context.shadowColor = "rgba(128, 255, 0, 1)";
    context.shadowBlur = 6;
    context.shadowOffsetX = 5;
    context.shadowOffsetY = 5;

    

    const asteroids = [
      { x: asteroidCanvas.width / 4, y: asteroidCanvas.height / 1.4, size: 120 },
      { x: asteroidCanvas.width / 4, y: asteroidCanvas.height / 1.65, size: 300 },
      { x: asteroidCanvas.width / 4, y: asteroidCanvas.height / 2.45, size: 420 },
      { x: asteroidCanvas.width / 4, y: asteroidCanvas.height / 1.5, size: 220 },
      { x: asteroidCanvas.width / 4, y: asteroidCanvas.height / 1.95, size: 380 }
    ];
  
    asteroids.forEach(asteroid => {
      let adjustedSize = Math.max(0, Math.min(900, (mouseY / asteroidCanvas.height) * asteroid.size));
      let asteroidX = mouseX;
  
      let color = "rgba(255, 255, 255, 0.0)"; // Default color
  
      // Get bounding boxes for the left and mirrored shapes
      let bbox1, bbox2;
      let isLimaçon1 = Math.abs(mouseX - asteroid.x) >= asteroidCanvas.width / 4;
      let isLimaçon2 = Math.abs(mouseX - asteroid.x) >= asteroidCanvas.width / 4;
      
      // Get the bounding box of the first shape (Limaçon or Asteroid)
      bbox1 = getBoundingBoxForShape(asteroidX, asteroid.y, adjustedSize, isLimaçon1);
  
      // Get the bounding box of the second shape (mirrored Limaçon or Asteroid)
      let mirroredX = asteroidCanvas.width - asteroidX;
      bbox2 = getBoundingBoxForShape(mirroredX, asteroid.y, adjustedSize, isLimaçon2);
  
      // Check if bounding boxes overlap
      let isOverlap = isBoundingBoxOverlap(bbox1, bbox2);
      
      context.fillStyle = color; // Transparent dark effect

      context.strokeStyle = "rgba(128, 255, 0, 0.8)";
      if (isLimaçon1) {
        let angle = (mouseX / asteroidCanvas.width) * 2 * Math.PI;
        drawLimaçonShape(context, asteroidX, asteroid.y, adjustedSize, angle);
      } else {
        drawAsteroid(context, asteroidX, asteroid.y, adjustedSize);
      }
      context.fillStyle = color;
      context.strokeStyle = "rgba(128, 255, 0, 0.8)";
      if (isLimaçon2) {
        let angle = (mouseX / asteroidCanvas.width) * 2 * Math.PI;
        drawLimaçonShape(context, mirroredX, asteroid.y, adjustedSize, -angle);
      } else {
        drawAsteroid(context, mirroredX, asteroid.y, adjustedSize);
      }
  
      // Apply an effect if there's an overlap (highlight region manually)
      if (isOverlap) {
        // Draw a semi-transparent highlight along the shape's path
        context.fillStyle = "rgba(0, 0, 0, 0.05)"; // Transparent dark effect
        context.strokeStyle ="rgba(255, 255, 255, 0.1)"; // White stroke for emphasis
        
        // Draw the shape for overlap (original shape path)
        if (isLimaçon1) {
          let angle = (mouseX / asteroidCanvas.width) * 2 * Math.PI;
          drawLimaçonShapeHighlight(context, asteroidX, asteroid.y, adjustedSize, angle);
        } else {
          drawAsteroidHighlight(context, asteroidX, asteroid.y, adjustedSize);
        }
  
        // Draw the mirrored shape for overlap
        if (isLimaçon2) {
          let angle = (mouseX / asteroidCanvas.width) * 2 * Math.PI;
          drawLimaçonShapeHighlight(context, mirroredX, asteroid.y, adjustedSize, -angle);
        } else {
          drawAsteroidHighlight(context, mirroredX, asteroid.y, adjustedSize);
        }
  
        // Manually apply a shadow effect using custom shadow properties
        context.shadowColor =  "rgba(0, 0, 0, 0.5)";
        context.shadowBlur = 10;
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
  
        // Draw the highlighted overlapping shapes with shadow
        context.fillStyle = "rgba(255, 255, 255, 0.1)"; // Slightly darkened fill for overlap
        if (isLimaçon1) {
          let angle = (mouseX / asteroidCanvas.width) * 2 * Math.PI;
          drawLimaçonShapeHighlight(context, asteroidX, asteroid.y, adjustedSize, angle);
        } else {
          drawAsteroidHighlight(context, asteroidX, asteroid.y, adjustedSize);
        }
  
        // Reset the shadow after drawing
        context.shadowColor = 'transparent';
      }
    });
  }
  
  // Highlight function for Limaçon shape
  function drawLimaçonShapeHighlight(context, x, y, size, angle) {
    context.beginPath();
    for (let i = 0; i < 80; i++) {
      let theta = i / 80 * 2 * Math.PI;
      let r = size * Math.sin(2 * theta);
      let pointX = x + r * Math.cos(theta);
      let pointY = y + r * Math.sin(theta);
      let rotatedPoint = rotatePoint(pointX, pointY, x, y, angle);
      pointX = rotatedPoint.x;
      pointY = rotatedPoint.y;
      i === 0 ? context.moveTo(pointX, pointY) : context.lineTo(pointX, pointY);
    }
    context.closePath();
    context.fill();
    context.stroke();
  }
  
  // Highlight function for Asteroid shape
  function drawAsteroidHighlight(context, x, y, size) {
    context.beginPath();
    for (let i = 0; i < 60; i++) {
      let t = i / 60 * 2 * Math.PI;
      let pointX = x + size * Math.pow(Math.cos(t), 3);
      let pointY = y + size * Math.pow(Math.sin(t), 3);
      i === 0 ? context.moveTo(pointX, pointY) : context.lineTo(pointX, pointY);
    }
    context.closePath();
    context.fill();
    context.stroke();
  }
  
  

document.addEventListener("mousemove", (event) => {
  const rect = asteroidCanvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
  draw();
});

document.addEventListener("touchmove", (event) => {
  const rect = asteroidCanvas.getBoundingClientRect();
  if (event.touches.length > 0) {
    mouseX = event.touches[0].clientX - rect.left;
    mouseY = event.touches[0].clientY - rect.top;
    draw();
  }
});

window.addEventListener("resize", resizeCanvas);

draw();
