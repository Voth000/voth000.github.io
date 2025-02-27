gsap.registerPlugin(ScrollTrigger);
const boDiv = document.querySelector('#bo');
const container2 = document.querySelector('#glcanvas');
const next = document.querySelector('#next');
const gridContainer = document.getElementById('boall');
const gridItems = document.querySelectorAll('.boagrid');


document.addEventListener('mousemove', (event) => {
  const centDiv = document.querySelector('#rec .cent');
  const { clientX } = event;
  const { clientY } = event;
  const { innerWidth, innerHeight } = window;

  // Calculate the percentage of the mouse position relative to the window
  const xPercent = (clientX / innerWidth) * 100;
  const yPercent = (clientY / innerHeight) * 100;

  // Set the background position to the inverse of the mouse position
  const xOffset =  xPercent - 5; // Move in opposite direction
  const yOffset =  yPercent - 5;

  centDiv.style.backgroundPosition = `${xOffset}% ${yOffset}%`;
});


function applyH1GlitchEffect() {
  const h1Elements = document.querySelectorAll('h1');
  
  h1Elements.forEach(h1 => {
      // Create SVG wrapper
      const svgWrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgWrapper.setAttribute('class', 'h1-glitch-svg');
      svgWrapper.setAttribute('width', '100%');
      svgWrapper.setAttribute('height', '100%');
      svgWrapper.style.position = 'absolute';
      svgWrapper.style.top = '0';
      svgWrapper.style.left = '0';
      svgWrapper.style.pointerEvents = 'none';

      // Create defs for filter
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      const filterId = `h1-turb-${Math.random().toString(36).substr(2, 9)}`;
      filter.setAttribute('id', filterId);

      // Turbulence with animation
      const feTurbulence = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
      feTurbulence.setAttribute('type', 'fractalNoise');
      feTurbulence.setAttribute('baseFrequency', '0.01 0.01');
      feTurbulence.setAttribute('numOctaves', '2');
      feTurbulence.setAttribute('result', 'turbulence');
      
      // Animate base frequency
      const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
      animate.setAttribute('attributeName', 'baseFrequency');
      animate.setAttribute('attributeType', 'XML');
      animate.setAttribute('values', '0.01 0.01; 0.05 0.03; 0.01 0.01');
      animate.setAttribute('dur', '120s');
      animate.setAttribute('repeatCount', 'indefinite');

      // Displacement Map
      const feDisplacementMap = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
      feDisplacementMap.setAttribute('xChannelSelector', 'R');
      feDisplacementMap.setAttribute('yChannelSelector', 'G');
      feDisplacementMap.setAttribute('in', 'SourceGraphic');
      feDisplacementMap.setAttribute('in2', 'turbulence');
      feDisplacementMap.setAttribute('scale', '15');

      // Assemble the filter
      feTurbulence.appendChild(animate);
      filter.appendChild(feTurbulence);
      filter.appendChild(feDisplacementMap);
      defs.appendChild(filter);
      svgWrapper.appendChild(defs);

      // Wrap h1 in a relative positioned container
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      //wrapper.style.pointerEvents = 'none';
      h1.parentNode.insertBefore(wrapper, h1);
      wrapper.appendChild(h1);
      wrapper.appendChild(svgWrapper);

      // Apply filter
      h1.style.filter = `url(#${filterId})`;

      // GSAP Reveal Animation
      gsap.set(h1, { 
          opacity: 0, 
          scale: 0.3
      });

      // Reveal animation
      const revealTimeline = gsap.timeline();
      revealTimeline.to(h1, {
          opacity: 1,
          scale: 1,
          duration: 3,
          delay: 0,
          ease: "power4.out"
      });


     

    
    






      // Optional glitch effect
      const glitchTimeline = gsap.timeline({ 
          repeat: -1, 
          yoyo: true 
      });

      glitchTimeline.to(h1, {
          duration: 0.1,
          repeat: 5
      });
  });
}

// Call the function when the page loads
window.addEventListener('load', applyH1GlitchEffect);







document.addEventListener("DOMContentLoaded", function() {
  var videos = document.querySelectorAll('video'); // Select all video elements
  var flElement = document.querySelector('.fl');

  if (videos.length > 0 && flElement) {
    videos.forEach(function(video) {
      video.addEventListener('mousemove', function(e) {
        flElement.style.display = 'block';
        flElement.style.left = e.pageX + 10 + 'px'; // 10px offset for better visibility
        flElement.style.top = e.pageY + 10 + 'px'; // 10px offset for better visibility
      });

      video.addEventListener('mouseleave', function() {
        flElement.style.display = 'none';
      });
    });
  } else {
    console.error('No video elements or the .fl element are not found in the DOM.');
  }
});





////


const typewriter = document.querySelector(".bio");


function toggleAnimation() {
  if (typewriter.classList.contains("animation")) {
    typewriter.classList.remove("animation");
    setTimeout(startAnimation, 500);
  } else {
    startAnimation();
  }
}

function startAnimation() {
  typewriter.classList.add("animation");
}


(function() {
  const blurProperty = gsap.utils.checkPrefix("filter"),
        blurExp = /blur\((.+)?px\)/,
        getBlurMatch = target => (gsap.getProperty(target, blurProperty) || "").match(blurExp) || [];

  gsap.registerPlugin({
    name: "blur",
    get(target) {
      return +(getBlurMatch(target)[1]) || 0;
    },
    init(target, endValue) {
      let data = this,
          filter = gsap.getProperty(target, blurProperty),
          endBlur = "blur(" + endValue + "px)",
          match = getBlurMatch(target)[0],
          index;
      if (filter === "none") {
        filter = "";
      }
      if (match) {
        index = filter.indexOf(match);
        endValue = filter.substr(0, index) + endBlur + filter.substr(index + match.length);
      } else {
        endValue = filter + endBlur;
        filter += filter ? " blur(0px)" : "blur(0px)";
      }
      data.target = target; 
      data.interp = gsap.utils.interpolate(filter, endValue); 
    },
    render(progress, data) {
      data.target.style[blurProperty] = data.interp(progress);
    }
  });
})();

const container1 = document.querySelector('#rec .cent');
const video = document.querySelectorAll('.mot');

gsap.set(container1, { 
          opacity: 0, 
          scale: 1.2,
          blur: 20,
      });

gsap.set(video, { 
          opacity: 0, 
          scale: 1,
          blur: 40,
      });

      // Reveal animation
const revealTimeline = gsap.timeline();

revealTimeline.to(video,{
          opacity: 1,
          scale: 1,
          duration: 3,
          blur: 0,
          ease: "power2.out"
      });

revealTimeline.to(container1,{
        opacity: 1,
        scale: 1,
        duration: 2,
        blur: 0,
        ease: "power2.out"
    });




      
      next.addEventListener('mouseover', () => {
         container1.style.filter = "brightness(1.8) grayscale(0.8) blur(18px)";
         //container1.style.filter = "brightness(1) blur(18px)";
          container1.style.transition = "filter 0.6s ease";
         // container2.style.filter = "brightness(1.8) blur(18px)";
         container2.style.filter = "brightness(1.2) blur(13px)";
          container2.style.transition = "filter 0.6s ease";
       
          
      });
      
      next.addEventListener('mouseleave', () => {
         //container1.style.filter = "brightness(1.8) grayscale(0.8) opacity(0.6) drop-shadow(4px 4px 6px rgba(255, 255, 255, 0.745))";
          container1.style.filter = "brightness(1.8) grayscale(0.8) opacity(0.6) drop-shadow(4px 4px 6px rgba(255, 255, 255, 0.745))";
          container2.style.filter = "opacity(1) brightness(1.1)";

      });





// Add hover listeners to dynamically resize grid
gridItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    applyHoverEffect(item);
  });

  item.addEventListener('mouseleave', () => {
    resetGrid();
  });
});

function applyHoverEffect(hoveredItem) {
  switch (hoveredItem.classList[1]) {
    case 'a':
      gridContainer.style.gridTemplateRows = '1fr 1fr 4fr';
      gridContainer.style.gridTemplateColumns = '1fr 0.5fr 2fr';
      break;
    case 'b':
      gridContainer.style.gridTemplateRows = '2fr 1fr 1fr';
      gridContainer.style.gridTemplateColumns = '0.5fr 0.5fr 1fr';
      break;
    case 'c':
      gridContainer.style.gridTemplateRows = '1fr 0.5fr 1fr';
      gridContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
      break;
      case 'd':
        gridContainer.style.gridTemplateRows = '2fr 1fr 1fr';
        gridContainer.style.gridTemplateColumns = '1fr 0.5fr 1fr';
        break;
    case 'e':
      gridContainer.style.gridTemplateRows = '0.5fr 2fr 1fr';
      gridContainer.style.gridTemplateColumns = '0.1fr 0.5fr 1fr';
      break;
    case 'g':
      gridContainer.style.gridTemplateRows = '1fr 1fr 2fr';
      gridContainer.style.gridTemplateColumns = '1fr 0.25fr 1fr';
      break;
    case 'f':
        gridContainer.style.gridTemplateRows = '1fr 0.5fr 1fr';
        gridContainer.style.gridTemplateColumns = '1fr 0.5fr 1fr';
        break;
    default:
      resetGrid();
      break;
  }
}

function resetGrid() {
  gridContainer.style.transition = 'all 0.3s ease';
  gridContainer.style.gridTemplateRows = '1fr 0.5fr 1fr';
  gridContainer.style.gridTemplateColumns = '1fr 0.5fr 1fr';
}


document.addEventListener("DOMContentLoaded", () => {
  const hoverImage = document.getElementById("hover-image");

  // Add hover listeners to all new-item elements
  document.querySelectorAll("#new").forEach(item => {
      item.addEventListener("mouseenter", (event) => {
        const imageSrc = item.getAttribute("data-img");
        if (imageSrc) { // Check if imageSrc exists
          hoverImage.src = imageSrc; // Set the image source
          hoverImage.style.display = "block"; // Show the image
      } else {
          console.error("No data-img attribute found for this item:", item);
      }
      });

      item.addEventListener("mouseleave", () => {
          hoverImage.style.display = "none"; // Hide the image
      });

      item.addEventListener("mousemove", (event) => {
          // Position the image near the cursor
          hoverImage.style.left = `${event.pageX + 10}px`;
          hoverImage.style.top = `${event.pageY - 10}px`;
      });
  });
});


function handleGridVisibility() {
  if (window.innerWidth <= 1024) {
    // Always show grid items for small screens
    gridItems.forEach((item) => {
      item.classList.add("visible");
    });
  } else {
    // Ensure grid starts hidden for large screens
    gridItems.forEach((item) => {
      item.classList.remove("visible");
    });
  }
}

// Attach hover event only for large screens
boDiv.addEventListener("mouseenter", () => {
  if (window.innerWidth > 1024) {
    revealGrid();
  }
});

// Run on page load
handleGridVisibility();

// Recheck when window is resized
window.addEventListener("resize", handleGridVisibility);


function revealGrid() {
  gridItems.forEach((item, index) => {
    if (window.innerWidth <= 1024) {
      // Instantly make items visible on small screens
      item.classList.add("visible");
    } else {
      // Staggered reveal animation on larger screens
      setTimeout(() => {
        item.classList.add("visible");
      }, index * 450);
    }
  });
}





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

