import React, { useEffect, useMemo, useRef } from "react";

/**
 * StandByWorldMap
 * - Canvas-only (no external assets)
 * - 60x25 dot grid land mask
 * - Dots are white (day) / gray (night)
 * - Terminator is drawn as a single-valued φ(λ) curve (no chord artifacts)
 * - NYC marked as red dot
 * - Updates aligned to the minute, then every minute
 */
export default function StandbyWorldMap({
  style,
  className,
  // Optional overrides:
  mapAspect = 0.424,
  dotRadiusFactor = 0.006, // relative to map width
  terminatorWidth = 3,
  updateMs = 60000, // after minute alignment
  latMin = -60,
  latMax = 80,
  lonMin = -180,
  lonMax = 180,
  dayColor = "#ffffff",
  nightColor = "#666666",
  nycColor = "#ff3333",
}) {
  const canvasRef = useRef(null);

  // Grid dimensions (from your requirement)
  const ROWS = 25;
  const COLS = 60;

  // Paste your corrected ROW_STRINGS here (must be ROWS strings, each length COLS)
  const ROW_STRINGS = useMemo(
    () => [
  "000000001111111101111111110000000000001110001111100011100000",
  "001111111111111111001111110000011110011011111111111111111111",
  "111111111111111001101111011000011111111111111111111111111111",
  "001111111111110011100110000000111111111111111111111111111110",
  "011000011111111011110000000110111111111111111111111110011000",
  "000000001111111111111000000011111111111111111111111111010000",
  "000000000111111111110000000111111100111111111111111100000000",
  "000000000111111110000000000110011111111111111111111010000000",
  "000000000111111100000000000011100001111111111111110110000000",
  "000000000011100100000000000111111111111111111111110000000000",
  "000000000001101111000000001111111111111011111111100000000000",
  "000000000000111000000000001111111111111001110111000000000000",
  "000000000000001111100000001111111111110001100111011000000000",
  "000000000000000011111000000111111111110000100110111000000000",
  "000000000000000111111100000000111111100000000111110010000000",
  "000000000000000111111111000000111111000000000001110011100000",
  "000000000000000111111111000000011111010000000000000101100000",
  "000000000000000011111110000000011111110000000000001111000000",
  "000000000000000001111110000000011110100000000000111111100000",
  "000000000000000001111100000000011110000000000000111111100000",
  "000000000000000001111000000000001100000000000000111111100010",
  "000000000000000001110000000000000000000000000000000011000010",
  "000000000000000011100000000000000000000000000000000000000110",
  "000000000000000011000000000000000000000000000000000000000100",
  "000000000000000001000000000000000000000000000000000000000000"
],
    []
  );

  const RAD = Math.PI / 180;

  function getMapRect(w, h) {
    // Fit map to available canvas size while preserving aspect ratio
    let mapW = w * 0.9;
    let mapH = mapW * mapAspect;

    const maxH = h * 0.8;
    if (mapH > maxH) {
      mapH = maxH;
      mapW = mapH / mapAspect;
    }

    const x = (w - mapW) / 2;
    const y = (h - mapH) / 2;
    return { x, y, w: mapW, h: mapH };
  }

  function projectLatLon(lat, lon, rect) {
    const nx = (lon - lonMin) / (lonMax - lonMin);
    const ny = (latMax - lat) / (latMax - latMin);
    return { x: rect.x + nx * rect.w, y: rect.y + ny * rect.h };
  }

  function nxNyToLatLon(nx, ny) {
    const lon = lonMin + nx * (lonMax - lonMin);
    const lat = latMax - ny * (latMax - latMin);
    return { lat, lon };
  }

  function getSubsolarPoint(date) {
    // Approximate solar position (good for visuals)
    const ms = date.getTime();
    const d = ms / 86400000 - 10957.5; // days since 2000-01-01 12:00 UTC

    let g = 357.528 + 0.9856003 * d;
    let q = 280.460 + 0.9856474 * d;
    g = ((g % 360) + 360) % 360;
    q = ((q % 360) + 360) % 360;

    const L =
      (q +
        1.915 * Math.sin(g * RAD) +
        0.02 * Math.sin(2 * g * RAD)) %
      360;
    const e = 23.439 - 0.0000004 * d;

    const sinDec = Math.sin(e * RAD) * Math.sin(L * RAD);
    const subLat = Math.asin(sinDec) / RAD;

    let GMST = 280.46061837 + 360.98564736629 * d;
    GMST = ((GMST % 360) + 360) % 360;

    let subLon = L - GMST;
    subLon = ((subLon + 540) % 360) - 180;

    return { lat: subLat, lon: subLon };
  }

  function isDaylight(latDeg, lonDeg, subLatDeg, subLonDeg) {
    const lat = latDeg * RAD;
    const lon = lonDeg * RAD;
    const slat = subLatDeg * RAD;
    const slon = subLonDeg * RAD;

    const cosPsi =
      Math.sin(lat) * Math.sin(slat) +
      Math.cos(lat) * Math.cos(slat) * Math.cos(lon - slon);

    return cosPsi > 0;
  }

  function drawTerminatorFunctional(ctx2d, rect, subLatDeg, subLonDeg) {
    const delta = subLatDeg * RAD;
    const lambdaS = subLonDeg * RAD;

    const nSteps = 400;
    const lonMinR = lonMin * RAD;
    const lonMaxR = lonMax * RAD;

    ctx2d.save();
    ctx2d.beginPath();

    for (let i = 0; i < nSteps; i++) {
      const t = i / (nSteps - 1);
      const lambda = lonMinR + t * (lonMaxR - lonMinR);

      let phi;
      if (Math.abs(Math.sin(delta)) < 1e-5) {
        phi = 0;
      } else {
        phi = Math.atan(
          (-Math.cos(delta) * Math.cos(lambda - lambdaS)) / Math.sin(delta)
        );
      }

      const latDeg = phi / RAD;
      const lonDeg = lambda / RAD;
      const p = projectLatLon(latDeg, lonDeg, rect);

      if (i === 0) ctx2d.moveTo(p.x, p.y);
      else ctx2d.lineTo(p.x, p.y);
    }

    const grad = ctx2d.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    grad.addColorStop(0.0, "rgba(255,255,255,0.00)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.25)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.80)");
    grad.addColorStop(0.7, "rgba(255,255,255,0.25)");
    grad.addColorStop(1.0, "rgba(255,255,255,0.00)");

    ctx2d.strokeStyle = grad;
    ctx2d.lineWidth = terminatorWidth;
    ctx2d.stroke();
    ctx2d.restore();
  }

  function drawFrame() {
    const el = canvasRef.current;
    if (!el) return;

    const ctx2d = el.getContext("2d");
    if (!ctx2d) return;

    // Handle HiDPI screens cleanly
    const dpr = window.devicePixelRatio || 1;
    const cssW = el.clientWidth || el.width;
    const cssH = el.clientHeight || el.height;

    el.width = Math.max(1, Math.floor(cssW * dpr));
    el.height = Math.max(1, Math.floor(cssH * dpr));
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear
    ctx2d.clearRect(0, 0, cssW, cssH);

    const rect = getMapRect(cssW, cssH);
    const radius = rect.w * dotRadiusFactor;

    const now = new Date();
    const { lat: subLat, lon: subLon } = getSubsolarPoint(now);

    // Terminator (behind dots)
    drawTerminatorFunctional(ctx2d, rect, subLat, subLon);

    // Dots
    for (let r = 0; r < ROWS; r++) {
      const rowStr = ROW_STRINGS[r];
      for (let c = 0; c < COLS; c++) {
        if (rowStr[c] !== "1") continue;

        const nx = c / (COLS - 1);
        const ny = r / (ROWS - 1);
        const { lat, lon } = nxNyToLatLon(nx, ny);

        const day = isDaylight(lat, lon, subLat, subLon);
        const p = projectLatLon(lat, lon, rect);

        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx2d.fillStyle = day ? dayColor : nightColor;
        ctx2d.fill();
      }
    }

    // NYC marker
    const nyc = projectLatLon(40.7128, -74.006, rect);
    ctx2d.beginPath();
    ctx2d.arc(nyc.x, nyc.y, radius * 1.4, 0, Math.PI * 2);
    ctx2d.fillStyle = nycColor;
    ctx2d.fill();
  }

  useEffect(() => {
    let intervalId = null;
    let timeoutId = null;

    const onResize = () => drawFrame();
    window.addEventListener("resize", onResize);

    // First draw immediately
    drawFrame();

    // Align updates to the next minute boundary, then every minute
    const scheduleMinuteUpdates = () => {
      const now = new Date();
      const msToNextMinute =
        (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

      timeoutId = window.setTimeout(() => {
        drawFrame();
        intervalId = window.setInterval(drawFrame, updateMs);
      }, msToNextMinute);
    };

    scheduleMinuteUpdates();

    return () => {
      window.removeEventListener("resize", onResize);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapAspect, dotRadiusFactor, terminatorWidth, updateMs, latMin, latMax, lonMin, lonMax]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
      }}
    />
  );
}
