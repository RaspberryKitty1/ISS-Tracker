/**
 * leaflet-daynight
 *
 * Two Leaflet layers for showing where it is day and where it is night, right
 * now, on any map:
 *
 *   L.dayNightLayer()            a smooth darkness ramp through civil, nautical
 *                                and astronomical twilight, painted per tile.
 *   L.nightLightsLayer(url)      a city-lights tile layer (NASA Black Marble or
 *                                similar) masked to the night side, so cities
 *                                stop glowing in the middle of the afternoon.
 *
 * Why a GridLayer rather than a polygon: the shading is computed in screen space
 * through Leaflet's own tiling, so panning, zooming, antimeridian wrap and the
 * poles all work for free, only on-screen tiles are ever computed, and the
 * transition between day and night can be a real gradient instead of one hard
 * edge.
 *
 * No dependencies beyond Leaflet. The astronomical core is the MIT-licensed
 * SunCalc algorithm by Vladimir Agafonkin (https://github.com/mourner/suncalc),
 * inlined and reduced to just the subsolar-point calculation these layers need.
 *
 * MIT licensed. https://github.com/LoganD900/leaflet-daynight
 */
(function (factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['leaflet'], factory);
	} else if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory(require('leaflet'));
	} else {
		if (typeof window === 'undefined' || !window.L) {
			throw new Error('leaflet-daynight requires Leaflet to be loaded first');
		}
		factory(window.L);
	}
}(function (L) {
	'use strict';

	var PI = Math.PI,
		sin = Math.sin,
		cos = Math.cos,
		tan = Math.tan,
		asin = Math.asin,
		atan = Math.atan2,
		rad = PI / 180,
		DEG = 180 / PI;

	var dayMs = 86400000,
		J1970 = 2440588,
		J2000 = 2451545,
		obliquity = rad * 23.4397; // obliquity of the ecliptic

	/* ── Subsolar point (SunCalc core, reduced) ────────────────────────────── */

	function toDays(date) {
		return date.valueOf() / dayMs - 0.5 + J1970 - J2000;
	}

	function rightAscension(l, b) {
		return atan(sin(l) * cos(obliquity) - tan(b) * sin(obliquity), cos(l));
	}

	function declination(l, b) {
		return asin(sin(b) * cos(obliquity) + cos(b) * sin(obliquity) * sin(l));
	}

	function solarMeanAnomaly(d) {
		return rad * (357.5291 + 0.98560028 * d);
	}

	function eclipticLongitude(M) {
		var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)); // equation of centre
		var P = rad * 102.9372; // perihelion of the Earth
		return M + C + P + PI;
	}

	/**
	 * The point on Earth where the sun is directly overhead at `date`.
	 * lat is the solar declination; lng comes from Greenwich sidereal time.
	 */
	function subsolarPoint(date) {
		var d = toDays(date),
			M = solarMeanAnomaly(d),
			eclLng = eclipticLongitude(M),
			ra = rightAscension(eclLng, 0) * DEG,
			dec = declination(eclLng, 0) * DEG;

		var lng = ra - (280.16 + 360.9856235 * d);
		lng = ((lng % 360) + 540) % 360 - 180; // normalise to [-180, 180]
		return { lat: dec, lng: lng };
	}

	/* ── Shared solar sampling ─────────────────────────────────────────────── */

	/**
	 * Mixed into both layers. Holds the current subsolar point, turns a lat/lng
	 * into a sun altitude, keeps the terminator drifting on a timer, and builds
	 * the coarse RGBA buffer that both layers upscale onto their tiles.
	 */
	var SolarSampling = {

		/** Recompute the subsolar point for options.time, or for now if unset. */
		_computeSun: function () {
			var ss = subsolarPoint(this.options.time || new Date());
			this._sun = {
				latSin: sin(ss.lat * rad),
				latCos: cos(ss.lat * rad),
				lng: ss.lng
			};
		},

		/** Sun altitude in degrees at a point, from the precomputed subsolar point. */
		_altitude: function (lat, lng) {
			var s = this._sun,
				latR = lat * rad,
				dLng = (lng - s.lng) * rad,
				sinAlt = sin(latR) * s.latSin + cos(latR) * s.latCos * cos(dLng);

			if (sinAlt > 1) { sinAlt = 1; } else if (sinAlt < -1) { sinAlt = -1; }
			return asin(sinAlt) * DEG;
		},

		_startSunTimer: function () {
			this._stopSunTimer();
			// A pinned time does not drift, so it needs no timer.
			if (this.options.time || !this.options.updateInterval) { return; }
			var self = this;
			this._sunTimer = window.setInterval(function () {
				if (document.hidden) { return; }
				self.refresh();
			}, this.options.updateInterval);
		},

		_stopSunTimer: function () {
			if (this._sunTimer) {
				window.clearInterval(this._sunTimer);
				this._sunTimer = null;
			}
		},

		/** Recompute the terminator and repaint immediately. */
		refresh: function () {
			this._computeSun();
			this.redraw();
			return this;
		},

		/**
		 * Show the layer at an arbitrary moment. Pass null (or no argument) to go
		 * back to tracking the real current time.
		 */
		setTime: function (date) {
			this.options.time = date || null;
			this._computeSun();
			this.redraw();
			if (this._map) { this._startSunTimer(); }
			return this;
		},

		/** The subsolar point currently being drawn, as {lat, lng}. */
		getSubsolarPoint: function () {
			if (!this._sun) { this._computeSun(); }
			return subsolarPoint(this.options.time || new Date());
		},

		/**
		 * Sample the sun altitude on a coarse grid across one tile and return a
		 * small canvas of RGBA values. `alphaFor(altitude)` returns 0 to 1.
		 *
		 * Sampling coarsely and letting the browser upscale with bilinear
		 * smoothing is what turns the twilight bands into a smooth gradient
		 * instead of visible blocks. Sample positions span the tile edges exactly,
		 * so neighbouring tiles line up with no seam.
		 */
		_solarBuffer: function (coords, size, rgb, alphaFor) {
			var worldSize = size.x * Math.pow(2, coords.z), // tiles are square
				step = this.options.sampleStep,
				cols = Math.max(2, Math.ceil(size.x / step) + 1),
				rows = Math.max(2, Math.ceil(size.y / step) + 1),
				spanX = size.x / (cols - 1),
				spanY = size.y / (rows - 1),
				originX = coords.x * size.x,
				originY = coords.y * size.y,
				TWO_PI = PI * 2,
				r = rgb[0], g = rgb[1], b = rgb[2];

			var buf = document.createElement('canvas');
			buf.width = cols;
			buf.height = rows;
			var bctx = buf.getContext('2d');
			var image = bctx.createImageData(cols, rows);
			var data = image.data;

			for (var j = 0; j < rows; j++) {
				var gY = originY + j * spanY;
				var n = PI - TWO_PI * gY / worldSize;
				var lat = DEG * Math.atan(Math.sinh(n)); // inverse Web Mercator
				for (var i = 0; i < cols; i++) {
					var gX = originX + i * spanX;
					var lng = gX / worldSize * 360 - 180;
					var alpha = alphaFor.call(this, this._altitude(lat, lng));
					var idx = (j * cols + i) * 4;
					data[idx] = r;
					data[idx + 1] = g;
					data[idx + 2] = b;
					data[idx + 3] = (alpha * 255) | 0;
				}
			}
			bctx.putImageData(image, 0, 0);
			return buf;
		},

		/** Draw a coarse buffer onto a tile context, smoothly upscaled. */
		_paintBuffer: function (ctx, buf, size) {
			ctx.imageSmoothingEnabled = true;
			if ('imageSmoothingQuality' in ctx) { ctx.imageSmoothingQuality = 'high'; }
			ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, size.x, size.y);
		},

		/**
		 * Give the layer its own map pane so it lands above the basemap, below the
		 * markers, ignores the mouse and blends correctly, without the caller
		 * having to set any of that up. Skipped if a pane was passed in.
		 */
		_ensurePane: function (map, name, zIndex) {
			// A pane the caller chose is left completely alone.
			if (this.options.pane && this.options.pane !== name) { return; }
			var pane = map.getPane(name) || map.createPane(name);
			pane.style.zIndex = zIndex;
			pane.style.pointerEvents = 'none';
			if (this.options.blendMode) {
				pane.style.mixBlendMode = this.options.blendMode;
				// Keep the blend inside the map instead of letting it reach the page.
				map.getContainer().style.isolation = 'isolate';
			}
			this.options.pane = name;
		}
	};

	/* ── Day / night + twilight ────────────────────────────────────────────── */

	// Twilight band floors, in degrees of sun altitude.
	var CIVIL = -6, NAUTICAL = -12, ASTRO = -18;

	var DayNightLayer = L.GridLayer.extend({

		options: {
			// Warm dark tone rather than navy. Painted with mix-blend-mode multiply,
			// this darkens the night side while keeping the basemap's own colours,
			// blue water and brown land, instead of a flat wash where everything
			// converges to the same shade.
			color: [34, 28, 22],
			maxOpacity: 0.62,      // darkness at astronomical night
			blendMode: 'multiply',
			sampleStep: 8,         // px between altitude samples inside a tile
			updateInterval: 60000, // ms between terminator updates
			time: null,            // pin to a Date, or null to track the clock
			opacity: 1,
			// Overrides GridLayer's 'tilePane' default so the layer knows it may
			// create a pane of its own. Set a pane name to place it yourself.
			pane: null
		},

		initialize: function (options) {
			L.setOptions(this, options);
			L.GridLayer.prototype.initialize.call(this, this.options);
			this._sun = null;
		},

		onAdd: function (map) {
			this._ensurePane(map, 'daynight', 250);
			this._computeSun();
			L.GridLayer.prototype.onAdd.call(this, map);
			this._startSunTimer();
		},

		onRemove: function (map) {
			this._stopSunTimer();
			L.GridLayer.prototype.onRemove.call(this, map);
		},

		/** Sun altitude to overlay opacity: a smooth ramp through the bands. */
		_opacityFor: function (alt) {
			var mo = this.options.maxOpacity;
			if (alt >= 0) { return 0; }                                        // daylight, untouched
			if (alt >= CIVIL) { return mo * (0 - alt) / 6 * 0.37; }            // 0 to ~0.22 of max
			if (alt >= NAUTICAL) { return mo * (0.37 + (CIVIL - alt) / 6 * 0.33); }
			if (alt >= ASTRO) { return mo * (0.70 + (NAUTICAL - alt) / 6 * 0.30); }
			return mo;                                                          // full night
		},

		createTile: function (coords) {
			var tile = L.DomUtil.create('canvas', 'leaflet-tile');
			var size = this.getTileSize();
			tile.width = size.x;
			tile.height = size.y;

			if (!this._sun) { this._computeSun(); }

			var buf = this._solarBuffer(coords, size, this.options.color, this._opacityFor);
			this._paintBuffer(tile.getContext('2d'), buf, size);
			return tile;
		}
	});

	DayNightLayer.include(SolarSampling);

	/* ── Night-masked city lights ──────────────────────────────────────────── */

	/*
	 * NASA's Black Marble city-lights imagery is a static picture of the whole
	 * planet lit up. It has no idea what time it is anywhere, so on its own it
	 * shows Tokyo blazing at noon.
	 *
	 * The usual fix is mix-blend-mode: screen. Screen against a near-white
	 * basemap washes out to nothing, so over pale tiles the lights only appear
	 * where the day/night overlay has already darkened the ground. That trick
	 * quietly stops working the moment the basemap is satellite imagery, which is
	 * mid-to-dark everywhere and especially over ocean: screen happily brightens
	 * the daylight half too.
	 *
	 * Blend modes cannot rescue it from either order. Put the lights above the
	 * day/night layer and they escape its darkening; put them below and the day
	 * side, where that layer is fully transparent, leaves them untouched. The
	 * mask has to be applied to the lights layer's OWN alpha channel.
	 *
	 * So: draw the imagery tile into a canvas, then cut it back with a coarse
	 * night-factor mask via destination-in, using the same sample-and-upscale
	 * approach as the day/night layer so the edge lands on exactly the same
	 * terminator. Subclassing L.TileLayer rather than L.GridLayer keeps
	 * getTileUrl, subdomains and maxNativeZoom upscaling for free.
	 *
	 * The tile canvas becomes cross-origin tainted by drawImage. That is fine:
	 * tainting only blocks readback (getImageData, toDataURL), and the mask is
	 * built in a separate canvas from locally created ImageData.
	 */

	var NightLightsLayer = L.TileLayer.extend({

		options: {
			lightsOn: -3,     // sun altitude where lights start to appear, just after sunset
			lightsFull: -12,  // altitude where they reach full strength, nautical dark
			blendMode: 'screen',
			sampleStep: 8,
			updateInterval: 60000,
			time: null,
			pane: null // as above: null lets the layer make its own pane
		},

		onAdd: function (map) {
			this._ensurePane(map, 'daynight-lights', 260);
			this._computeSun();
			L.TileLayer.prototype.onAdd.call(this, map);
			this._startSunTimer();
		},

		onRemove: function (map) {
			this._stopSunTimer();
			L.TileLayer.prototype.onRemove.call(this, map);
		},

		/** 0 in daylight to 1 in full dark: how much of the lights tile survives. */
		_nightFactor: function (alt) {
			var on = this.options.lightsOn, full = this.options.lightsFull;
			if (alt >= on) { return 0; }
			if (alt <= full) { return 1; }
			return (on - alt) / (on - full);
		},

		createTile: function (coords, done) {
			var tile = L.DomUtil.create('canvas', 'leaflet-tile');
			var size = this.getTileSize();
			tile.width = size.x;
			tile.height = size.y;

			if (!this._sun) { this._computeSun(); }

			var self = this;
			var img = new Image();
			var co = this.options.crossOrigin;
			if (co || co === '') { img.crossOrigin = (co === true) ? '' : co; }
			img.onload = function () {
				var ctx = tile.getContext('2d');
				ctx.drawImage(img, 0, 0, size.x, size.y);
				ctx.globalCompositeOperation = 'destination-in';
				self._paintBuffer(ctx, self._solarBuffer(coords, size, [255, 255, 255], self._nightFactor), size);
				ctx.globalCompositeOperation = 'source-over';
				done(null, tile);
			};
			// A missing lights tile is cosmetic. Hand back the blank canvas rather
			// than letting Leaflet flag an error and retry.
			img.onerror = function () { done(null, tile); };
			img.src = this.getTileUrl(coords);

			return tile;
		}
	});

	NightLightsLayer.include(SolarSampling);

	/* ── Exports ───────────────────────────────────────────────────────────── */

	L.DayNightLayer = DayNightLayer;
	L.dayNightLayer = function (options) { return new DayNightLayer(options); };

	L.NightLightsLayer = NightLightsLayer;
	L.nightLightsLayer = function (url, options) { return new NightLightsLayer(url, options); };

	L.DayNight = { subsolarPoint: subsolarPoint };

	return L;
}));
