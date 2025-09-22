import React, { useEffect, useRef } from "react";
import p5 from "p5";

export default function SpirographP5() {
  const containerRef = useRef(null);
  const p5Ref = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p) => {
      // ----------- state -----------
      let R = 160, r = 45, d = 70, dt = 0.02, mode = "hypo";
      let t = 0;
      let pts = []; // {x,y,r,g,b}
      let trailLen = 3000;
      let maxSegPx = 3;

      let headColor = { r: 255, g: 255, b: 255 }; // start white
      let hueArmed = false, initialHue = 0;

      let colAmax = 220;
      let zoom = 1.0, rotSpeed = 0.0, rotAngle = 0.0;

      // UI / drawer
      let ui;
      const gear = { x: 0, y: 0, r: 14, hover: false };

      // ----------- setup / resize -----------
      p.setup = () => {
        const w = containerRef.current.clientWidth || 700;
        const h = containerRef.current.clientHeight || 560;
        p.createCanvas(w, h);
        p.pixelDensity(1);
        p.noFill();
        p.clear();
        ui = new DrawerUI(0, p.height, p.width, 230);
        buildControls();
        positionGear();
      };

      function positionGear() {
        gear.x = p.width - 22;
        gear.y = 22;
      }

      p.windowResized = () => {
        if (!containerRef.current) return;
        p.resizeCanvas(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
        positionGear();
      };

      // ----------- draw -----------
      p.draw = () => {
        if (!ui) return;

        // read UI
        R = ui.get("R").value;
        r = ui.get("r").value;
        d = ui.get("d").value;
        dt = ui.get("dt").value;
        mode = ui.get("mode").on ? "epi" : "hypo";

        trailLen = ui.get("trailLen").value | 0;
        maxSegPx = ui.get("maxSeg").value;
        colAmax = ui.get("colA").value | 0;

        zoom = ui.get("zoom").value;
        rotSpeed = ui.get("rotSpd").value;

        // hue -> head color for *new* segments only
        const hueVal = ui.get("hue").value;
        if (!hueArmed && Math.abs(hueVal - initialHue) > 1e-9) hueArmed = true;
        if (hueArmed) headColor = hueToRGB(hueVal);

        // next target point (model space)
        const k = mode === "hypo" ? R - r : R + r;
        const n = k / r;
        const tx = k * Math.cos(t) + (mode === "hypo" ? d * Math.cos(n * t) : -d * Math.cos(n * t));
        const ty = k * Math.sin(t) + (mode === "hypo" ? -d * Math.sin(n * t) : -d * Math.sin(n * t));

        // densify to avoid gaps at high dt
        if (pts.length === 0) {
          pts.push({ x: tx, y: ty, r: headColor.r, g: headColor.g, b: headColor.b });
        } else {
          const prev = pts[pts.length - 1];
          const distPx = Math.hypot(tx - prev.x, ty - prev.y);
          const steps = Math.max(1, Math.ceil(distPx / Math.max(1e-6, maxSegPx)));
          for (let s = 1; s <= steps; s++) {
            const f = s / steps;
            const ix = p.lerp(prev.x, tx, f);
            const iy = p.lerp(prev.y, ty, f);
            // freeze color at draw-time
            pts.push({ x: ix, y: iy, r: headColor.r, g: headColor.g, b: headColor.b });
          }
        }

        // memory cap
        if (pts.length > 220000) pts.splice(0, pts.length - 220000);

        // render spirograph
        p.clear();
        p.push();
        p.translate(p.width / 2, p.height / 2);
        p.scale(zoom);
        p.rotate(rotAngle);

        const start = Math.max(1, pts.length - trailLen);
        const total = pts.length - start;

        for (let i = start; i < pts.length; i++) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          const frac = (i - start) / Math.max(1, total); // 0 tail → 1 head

          // tapered thickness in screen px (comp for zoom)
          const baseSW = p.lerp(0.5, 4, frac);
          p.strokeWeight(baseSW / zoom);

          // alpha fade
          const a = p.lerp(0, colAmax, frac);
          p.stroke(p0.r, p0.g, p0.b, a);
          p.line(p0.x, p0.y, p1.x, p1.y);
        }

        // head circle (current head color)
        if (pts.length > 0) {
          const head = pts[pts.length - 1];
          p.noStroke();
          p.fill(headColor.r, headColor.g, headColor.b, colAmax);
          const headSize = 10 / zoom;
          p.ellipse(head.x, head.y, headSize, headSize);
        }
        p.pop();

        // advance motion
        t += dt;
        rotAngle += rotSpeed;

        // UI overlays
        ui.update(); ui.draw();
        drawFloatingGear();
      };

      // ----------- helpers -----------
      function hueToRGB(h) { // H in [0,360], S=100, B=100
        p.push();
        p.colorMode(p.HSB, 360, 100, 100);
        const c = p.color(h, 100, 100);
        const rr = p.red(c), gg = p.green(c), bb = p.blue(c);
        p.pop();
        return { r: rr, g: gg, b: bb };
      }

      // ----------- in-canvas UI build -----------
      function buildControls() {
        const pad = 10, colW = (ui.w - pad * 3) / 2;

        // Left column: Geometry & Trail
        let lx = pad, ly = 36;
        ui.add(new SectionHeader("secGeom", lx, ly - 24, "Geometry")); // header
        ui.add(new CompactSlider("R",  lx, ly, colW, 40, 280, R, 1, "R (big)"));  ly += 22;
        ui.add(new CompactSlider("r",  lx, ly, colW,  5, 140, r, 1, "r (small)")); ly += 22;
        ui.add(new CompactSlider("d",  lx, ly, colW,  0, 220, d, 1, "d (offset)")); ly += 22;
        ui.add(new CompactSlider("dt", lx, ly, colW, 0.001, 0.1, dt, 0.001, "dt")); ly += 24;

        ui.add(new Toggle("mode", lx, ly, 16, "Epitrochoid (toggle)")); ly += 30;

        ui.add(new SectionHeader("secTrail", lx, ly - 8, "Trail"));
        ui.add(new CompactSlider("trailLen", lx, ly, colW, 50, 120000, trailLen, 10, "Trail (segs)")); ly += 22;
        ui.add(new CompactSlider("maxSeg",   lx, ly, colW, 1, 20, maxSegPx, 1, "Seg px"));           ly += 22;

        // Right column: Color & View
        let rx = pad * 2 + colW, ry = 36;
        ui.add(new SectionHeader("secColor", rx, ry - 24, "Color & View"));
        ui.add(new HueSlider("hue", rx, ry, colW, 0, 360, initialHue, 1, "Hue (°)")); ry += 24;
        ui.add(new CompactSlider("colA", rx, ry, colW, 0, 255, colAmax, 1, "Head α")); ry += 22;

        ui.add(new CompactSlider("zoom",   rx, ry, colW, 0.2, 5.0, zoom, 0.01, "Zoom")); ry += 22;
        ui.add(new CompactSlider("rotSpd", rx, ry, colW, -0.2, 0.2, rotSpeed, 0.001, "Rot (rad/f)")); ry += 24;

        ui.add(new Button("clear", rx, ry, 76, 22, "Clear", () => { pts = []; t = 0; }));
        ui.add(new Button("resetView", rx + 82, ry, 96, 22, "Reset view", () => { rotAngle = 0; ui.get("zoom").value = 1.0; }));
        ui.add(new Button("save", rx + 182, ry, 76, 22, "Save PNG", () => p.saveCanvas("spirograph", "png")));
      }

      // ----------- floating gear -----------
      function drawFloatingGear() {
        gear.hover = p.dist(p.mouseX, p.mouseY, gear.x, gear.y) <= gear.r + 2;

        p.push();
        p.noStroke();
        p.fill(0, 120);
        p.circle(gear.x + 1, gear.y + 2, gear.r * 2 + 2);
        p.fill(ui?.isOpen() ? 240 : gear.hover ? 220 : 200);
        p.circle(gear.x, gear.y, gear.r * 2);

        p.stroke(40); p.strokeWeight(2); p.noFill();
        const teeth = 6, inner = gear.r - 6, outer = gear.r - 2;
        for (let i = 0; i < teeth; i++) {
          const a = (i * p.TWO_PI) / teeth;
          p.line(gear.x + Math.cos(a) * inner, gear.y + Math.sin(a) * inner,
                 gear.x + Math.cos(a) * outer, gear.y + Math.sin(a) * outer);
        }
        p.circle(gear.x, gear.y, gear.r - 8);
        p.pop();
      }

      // ----------- input routing (defensive) -----------
      p.mousePressed = () => {
        if (!ui) return;
        if (p.dist(p.mouseX, p.mouseY, gear.x, gear.y) <= gear.r) { ui.toggle(); return; }
        ui.mousePressed?.(p.mouseX, p.mouseY);
      };
      p.mouseDragged = () => { if (ui) ui.mouseDragged?.(p.mouseX, p.mouseY); };
      p.mouseReleased = () => { if (ui) ui.mouseReleased?.(p.mouseX, p.mouseY); };
      p.keyPressed = () => {
        if (!ui) return;
        if (p.key === "h" || p.key === "H") ui.toggle();
        if (p.key === "e" || p.key === "E") { const tog = ui.get("mode"); if (tog) tog.on = !tog.on; }
        if (p.key === "c" || p.key === "C") { pts = []; t = 0; }
        if (p.key === "s" || p.key === "S") { p.saveCanvas("spirograph", "png"); }
      };

      // ----------- UI classes (compact + clear) -----------
      class DrawerUI {
        constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; this.controls = new Map(); this.open = false; this.anim = 0.2; }
        add(c) { c.parent = this; this.controls.set(c.id, c); }
        get(id) { return this.controls.get(id); }
        isOpen() { return this.open; }
        toggle() { this.open = !this.open; }
        update() { const target = this.open ? p.height - this.h : p.height; this.y = p.lerp(this.y, target, this.anim); }
        draw() {
          p.push(); p.noStroke(); p.fill(0, 0, 0, 180); p.rect(this.x, this.y, this.w, this.h, 0);
          // title bar
          p.fill(220); p.textFont("system-ui"); p.textSize(12); p.textAlign(p.LEFT, p.TOP);
          p.text("Controls (gear or H)", this.x + 10, this.y + 10);
          // subtle divider
          p.stroke(60); p.line(this.x + 10, this.y + 28, this.x + this.w - 10, this.y + 28);
          for (const c of this.controls.values()) c.draw?.(this.x, this.y);
          p.pop();
        }
        _inside(mx, my) { return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h; }
        mousePressed(mx, my) { if (!this._inside(mx, my)) return; for (const c of this.controls.values()) c.mousePressed?.(mx - this.x, my - this.y); }
        mouseDragged(mx, my) { if (!this._inside(mx, my)) return; for (const c of this.controls.values()) c.mouseDragged?.(mx - this.x, my - this.y); }
        mouseReleased(mx, my) { for (const c of this.controls.values()) c.mouseReleased?.(mx - this.x, my - this.y); }
      }

      class SectionHeader {
        constructor(id, x, y, label) { this.id = id; this.x = x; this.y = y; this.label = label; }
        draw(px, py) {
          p.push(); p.translate(px, py);
          p.fill(180); p.textSize(11); p.textAlign(p.LEFT, p.BASELINE);
          p.text(this.label, this.x, this.y);
          p.stroke(60); p.line(this.x, this.y + 3, this.x + 150, this.y + 3);
          p.pop();
        }
        mousePressed(){} mouseDragged(){} mouseReleased(){}
      }

      // Compact row slider: [Label] [track] [value]
      class CompactSlider {
        constructor(id, x, y, w, min, max, value, step, label = "", unit = "") {
          this.id = id; this.x = x; this.y = y; this.w = w;
          this.min = min; this.max = max; this.value = value; this.step = step;
          this.label = label; this.unit = unit;
          this.h = 16; this.pad = 8; this.drag = false;
          this.knobR = 8;
        }
        _valToX(v) {
          const t = (v - this.min) / (this.max - this.min);
          return this.x + 80 + t * (this.w - 80 - 56); // 80px for label, 56px for value
        }
        _xToVal(px) {
          const t = p.constrain((px - (this.x + 80)) / (this.w - 80 - 56), 0, 1);
          const raw = this.min + t * (this.max - this.min);
          const snapped = this.step > 0 ? Math.round(raw / this.step) * this.step : raw;
          return p.constrain(snapped, this.min, this.max);
        }
        _valueText() {
          const nearOne = Math.abs(this.max - this.min) <= 1.5 || this.step < 1;
          const disp = nearOne ? p.nf(this.value, 1, String(this.step).includes(".") ? 3 : 2) : p.nf(this.value, 1, 0);
          return this.unit ? `${disp}${this.unit}` : disp;
        }
        draw(px, py) {
          p.push(); p.translate(px, py);
          // label (left)
          p.fill(210); p.noStroke(); p.textSize(12); p.textAlign(p.LEFT, p.CENTER);
          p.text(this.label, this.x, this.y + this.h / 2);

          // value (right)
          p.fill(190); p.textAlign(p.RIGHT, p.CENTER);
          p.text(this._valueText(), this.x + this.w, this.y + this.h / 2);

          // track
          const x1 = this.x + 80, x2 = this.x + this.w - 56, cy = this.y + this.h / 2;
          p.stroke(90); p.strokeWeight(2); p.line(x1, cy, x2, cy);

          // progress
          const kx = this._valToX(this.value);
          p.stroke(170); p.line(x1, cy, kx, cy);

          // knob
          p.noStroke(); p.fill(240);
          p.circle(kx, cy, this.knobR);

          p.pop();
        }
        mousePressed(mx, my) {
          const x1 = this.x + 80, x2 = this.x + this.w - 56, cy = this.y + this.h / 2;
          if (my >= this.y && my <= this.y + this.h && mx >= x1 && mx <= x2) {
            this.value = this._xToVal(mx); this.drag = true;
          }
        }
        mouseDragged(mx) { if (this.drag) this.value = this._xToVal(mx); }
        mouseReleased() { this.drag = false; }
      }

      // Hue slider with gradient track (inherits interaction from CompactSlider)
      class HueSlider extends CompactSlider {
        draw(px, py) {
          p.push(); p.translate(px, py);

          // label & value
          p.fill(210); p.noStroke(); p.textSize(12); p.textAlign(p.LEFT, p.CENTER);
          p.text(this.label, this.x, this.y + this.h / 2);
          p.fill(190); p.textAlign(p.RIGHT, p.CENTER);
          p.text(p.nf(this.value, 1, 0), this.x + this.w, this.y + this.h / 2);

          const x1 = this.x + 80, x2 = this.x + this.w - 56, cy = this.y + this.h / 2;

          // gradient track
          const ctx = p.drawingContext;
          const grad = ctx.createLinearGradient(x1, cy, x2, cy);
          // Add hue stops (0..360)
          [0,60,120,180,240,300,360].forEach(h => {
            const { r, g, b } = hueToRGB(h);
            grad.addColorStop(h / 360, `rgb(${r},${g},${b})`);
          });
          ctx.save();
          ctx.strokeStyle = "rgba(90,90,90,1)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, cy);
          ctx.lineTo(x2, cy);
          ctx.stroke(); // base line
          ctx.restore();

          // fill a thicker gradient under the line for visibility
          ctx.save();
          ctx.fillStyle = grad;
          ctx.fillRect(x1, cy - 3, x2 - x1, 6);
          ctx.restore();

          // progress overlay (thin)
          const kx = this._valToX(this.value);
          p.stroke(255); p.strokeWeight(1);
          p.line(x1, cy, kx, cy);

          // knob
          p.noStroke(); p.fill(240);
          p.circle(kx, cy, this.knobR);

          p.pop();
        }
      }

      class Toggle {
        constructor(id, x, y, size, label, initial = false) { this.id = id; this.x = x; this.y = y; this.size = size; this.label = label; this.on = initial; }
        draw(px, py) {
          p.push(); p.translate(px, py);
          p.fill(210); p.noStroke(); p.textSize(12); p.textAlign(p.LEFT, p.CENTER);
          p.text(this.label, this.x + this.size * 2 + 8, this.y + this.size / 2);
          // switch
          p.stroke(120);
          p.fill(this.on ? p.color(120, 200, 120) : p.color(70));
          p.rect(this.x, this.y, this.size * 2, this.size, this.size / 2);
          p.fill(240); p.noStroke();
          p.circle((this.on ? this.x + this.size : this.x) + this.size / 2, this.y + this.size / 2, this.size * 0.8);
          p.pop();
        }
        mousePressed(mx, my) { if (mx >= this.x && mx <= this.x + this.size * 2 && my >= this.y && my <= this.y + this.size) this.on = !this.on; }
        mouseDragged(){} mouseReleased(){}
      }

      class Button {
        constructor(id, x, y, w, h, label, onClick) { this.id = id; this.x = x; this.y = y; this.w = w; this.h = h; this.label = label; this.onClick = onClick; this.down = false; }
        draw(px, py) {
          p.push(); p.translate(px, py);
          p.stroke(120); p.fill(this.down ? 200 : 230); p.rect(this.x, this.y, this.w, this.h, 6);
          p.fill(20); p.noStroke(); p.textSize(12); p.textAlign(p.CENTER, p.CENTER); p.text(this.label, this.x + this.w / 2, this.y + this.h / 2);
          p.pop();
        }
        mousePressed(mx, my) { if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) this.down = true; }
        mouseDragged(){} 
        mouseReleased(mx, my) {
          if (this.down && mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) this.onClick && this.onClick();
          this.down = false;
        }
      }
    };

    // Create p5 instance
    p5Ref.current = new p5(sketch, containerRef.current);

    // Cleanup
    return () => { p5Ref.current?.remove(); p5Ref.current = null; };
  }, []);

  // Give the container a height in your layout or style (e.g., 70vh)
  return <div ref={containerRef} style={{ width: "100%", height: "45vh" }} />;
}
