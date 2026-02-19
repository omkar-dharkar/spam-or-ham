// Background canvas particles
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const pts = [];
const N = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 14000));

for(let i=0;i<N;i++){
  pts.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    vx: (Math.random()-0.5)*0.35,
    vy: (Math.random()-0.5)*0.35,
    r: Math.random()*1.6 + 0.4
  });
}

function tick(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  for(const p of pts){
    p.x += p.vx; p.y += p.vy;

    if(p.x < 0) p.x = canvas.width;
    if(p.x > canvas.width) p.x = 0;
    if(p.y < 0) p.y = canvas.height;
    if(p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = "rgba(235,242,255,0.35)";
    ctx.fill();
  }

  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      const a = pts[i], b = pts[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if(d < 125){
        ctx.strokeStyle = `rgba(55,245,255,${(1 - d/125)*0.12})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(tick);
}
tick();

// Scan UI
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const loaderBar = document.getElementById("loaderBar");

const scanForm = document.getElementById("scanForm");
const clearBtn = document.getElementById("clearBtn");
const scanline = document.getElementById("scanline");
const hudMode = document.getElementById("hudMode");
const statusText = document.getElementById("statusText");

const barFill = document.getElementById("barFill");
const meterPct = document.getElementById("meterPct");
const meterText = document.getElementById("meterText");

function setMeter(pct, text){
  const clamped = Math.max(0, Math.min(100, pct));
  barFill.style.width = clamped + "%";
  meterPct.textContent = Math.round(clamped);
  meterText.textContent = text;
}

function animateScanline(){
  if(!scanline) return;
  scanline.style.opacity = "1";
  scanline.animate(
    [{ transform: "translateY(-10px)" }, { transform: "translateY(220px)" }],
    { duration: 900, iterations: 6, easing: "linear" }
  ).onfinish = () => { scanline.style.opacity = "0"; };
}

function showOverlay(){
  overlay.classList.add("show");
  statusText.textContent = "SCANNING…";
  hudMode.textContent = "ACTIVE";
  animateScanline();

  const steps = [
    "Initializing signatures…",
    "Extracting token fingerprints…",
    "Cross-checking phishing cues…",
    "Validating spam patterns…",
    "Finalizing threat profile…"
  ];

  let pct = 0;
  let i = 0;

  const timer = setInterval(() => {
    pct += Math.random()*14 + 6;
    if(pct >= 100) pct = 100;

    loaderBar.style.width = pct + "%";

    if(pct > (i+1)*20 && i < steps.length-1){
      i++;
      overlayText.textContent = steps[i];
    }

    if(pct >= 100){
      clearInterval(timer);
    }
  }, 140);
}

function hideOverlay(){
  overlay.classList.remove("show");
  statusText.textContent = "SYSTEM ONLINE";
  hudMode.textContent = "PASSIVE";
}

if(clearBtn){
  clearBtn.addEventListener("click", () => {
    document.getElementById("mail").value = "";
    setMeter(0, "Awaiting scan…");
  });
}

if(scanForm){
  scanForm.addEventListener("submit", (e) => {
    const txt = (document.getElementById("mail").value || "").trim();
    if(!txt){
      e.preventDefault();
      setMeter(10, "No payload provided. Paste content first.");
      return;
    }
    showOverlay();
  });
}

// After server response
(function initFromServer(){
  const S = window.__SCAN__ || { hasResult:false };
  if(!S.hasResult){
    setMeter(0, "Awaiting scan…");
    return;
  }

  let base = 70;
  if(typeof S.confidence === "number"){
    base = Math.round(S.confidence * 100);
  }

  if(S.label === 0){
    setMeter(Math.min(100, Math.max(70, base)), "Threat level elevated. Quarantine recommended.");
  }else{
    setMeter(Math.max(15, Math.min(55, 100 - base)), "Signal looks clean. No strong threat patterns.");
  }

  hideOverlay();
})();
