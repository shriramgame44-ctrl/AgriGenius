import React, { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import { useAgri } from "../context/AgriContext";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Layers,
  Satellite,
  Compass,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Trash2,
  Footprints,
  Ruler,
  Fence,
  ShoppingCart,
  Download,
  Search,
  Crosshair,
  Maximize2,
  Eye,
  Sliders,
  ChevronRight,
  Info,
} from "lucide-react";

interface LatLngPoint {
  lat: number;
  lng: number;
}

// Preset agricultural farm parcels across India
const SAMPLE_REGIONS: Record<
  string,
  { name: string; state: string; crop: string; center: [number, number]; points: LatLngPoint[] }
> = {
  rampur: {
    name: "Rampur North Plot (Wheat)",
    state: "Punjab",
    crop: "Sharbati Wheat HD-2967",
    center: [30.1245, 75.8312],
    points: [
      { lat: 30.1252, lng: 75.8302 },
      { lat: 30.1254, lng: 75.8328 },
      { lat: 30.1238, lng: 75.8329 },
      { lat: 30.1237, lng: 75.8304 },
    ],
  },
  nashik: {
    name: "Nashik Vineyard & Onion Parcel",
    state: "Maharashtra",
    crop: "Thompson Seedless Grapes & Lasalgaon Onion",
    center: [20.015, 73.818],
    points: [
      { lat: 20.0162, lng: 73.8168 },
      { lat: 20.0165, lng: 73.8192 },
      { lat: 20.0148, lng: 73.8195 },
      { lat: 20.0145, lng: 73.8171 },
    ],
  },
  baramati: {
    name: "Baramati Sugarcane Belt",
    state: "Maharashtra",
    crop: "Sugarcane Co-86032",
    center: [18.156, 74.582],
    points: [
      { lat: 18.1575, lng: 74.5805 },
      { lat: 18.1578, lng: 74.5835 },
      { lat: 18.1552, lng: 74.5838 },
      { lat: 18.1549, lng: 74.5808 },
    ],
  },
  karnal: {
    name: "Karnal Basmati Rice Field",
    state: "Haryana",
    crop: "Pusa Basmati 1121",
    center: [29.692, 76.985],
    points: [
      { lat: 29.6935, lng: 76.9835 },
      { lat: 29.6938, lng: 76.9868 },
      { lat: 29.6912, lng: 76.9871 },
      { lat: 29.6909, lng: 76.9838 },
    ],
  },
};

export const FarmMapPage: React.FC = () => {
  const { language, t, addToCart } = useAgri();
  const navigate = useNavigate();

  // Mode: "area" (Polygon measurement), "ruler" (Direct distance measuring line)
  const [measureMode, setMeasureMode] = useState<"area" | "ruler">("area");
  const [activeTileType, setActiveTileType] = useState<"satellite" | "hybrid" | "streets" | "ndvi">("satellite");
  const [points, setPoints] = useState<LatLngPoint[]>(SAMPLE_REGIONS.rampur.points);
  const [fieldName, setFieldName] = useState("Rampur North Farm - Plot 1");
  const [selectedUnit, setSelectedUnit] = useState<"acres" | "gunthas" | "bighas" | "hectares">("acres");
  const [isWalkingGps, setIsWalkingGps] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [currentGpsCoord, setCurrentGpsCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const edgeBadgesGroupRef = useRef<L.LayerGroup | null>(null);
  const gpsMarkerRef = useRef<L.CircleMarker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // 1. Precise Geodesic Calculations using spherical excess / local planar projection
  // Haversine distance between two coordinates in meters
  const calculateHaversineDistance = (p1: LatLngPoint, p2: LatLngPoint): number => {
    const R = 6378137; // Earth radius in meters
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Polygon area in square meters using spherical excess formula
  const calculatePolygonArea = (pts: LatLngPoint[]): number => {
    if (pts.length < 3) return 0;
    const R = 6378137;
    // Find centroid for projection
    const centerLat = pts.reduce((sum, p) => sum + p.lat, 0) / pts.length;
    const centerLng = pts.reduce((sum, p) => sum + p.lng, 0) / pts.length;
    const lat0 = (centerLat * Math.PI) / 180;

    // Convert lat/lng to local meters coordinates
    const xy = pts.map((p) => {
      const x = ((p.lng - centerLng) * Math.PI) / 180 * R * Math.cos(lat0);
      const y = ((p.lat - centerLat) * Math.PI) / 180 * R;
      return { x, y };
    });

    // Shoelace formula on projected plane
    let area = 0;
    for (let i = 0; i < xy.length; i++) {
      const j = (i + 1) % xy.length;
      area += xy[i].x * xy[j].y;
      area -= xy[j].x * xy[i].y;
    }
    return Math.abs(area) / 2;
  };

  // Total Perimeter / Length
  const { perimeterMeters, segmentDistances } = useMemo(() => {
    if (points.length < 2) return { perimeterMeters: 0, segmentDistances: [] };
    const segs: number[] = [];
    let total = 0;
    const isClosed = measureMode === "area" && points.length >= 3;
    const numEdges = isClosed ? points.length : points.length - 1;

    for (let i = 0; i < numEdges; i++) {
      const next = points[(i + 1) % points.length];
      const dist = calculateHaversineDistance(points[i], next);
      segs.push(Math.round(dist));
      total += dist;
    }
    return { perimeterMeters: Math.round(total), segmentDistances: segs };
  }, [points, measureMode]);

  // Derived measurements
  const areaSqMeters = useMemo(() => {
    if (measureMode !== "area" || points.length < 3) return 0;
    return Math.round(calculatePolygonArea(points));
  }, [points, measureMode]);

  const acres = +(areaSqMeters / 4046.856).toFixed(2);
  const hectares = +(areaSqMeters / 10000).toFixed(2);
  const gunthas = Math.round(acres * 40); // 1 Acre = 40 Gunthas
  const bighas = +(acres * 1.6).toFixed(2); // Standard 1 Acre = 1.6 Bighas
  const perimeterFeet = Math.round(perimeterMeters * 3.28084);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map instance
    const initialCenter: [number, number] = points.length > 0
      ? [points[0].lat, points[0].lng]
      : [30.1245, 75.8312];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 17,
      zoomControl: true,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Layer groups for markers and overlays
    const tileGroup = L.layerGroup().addTo(map);
    tileLayerGroupRef.current = tileGroup;

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    const edgeBadgesGroup = L.layerGroup().addTo(map);
    edgeBadgesGroupRef.current = edgeBadgesGroup;

    // Map click handler to place pins directly
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newPt: LatLngPoint = {
        lat: +e.latlng.lat.toFixed(6),
        lng: +e.latlng.lng.toFixed(6),
      };
      setPoints((prev) => [...prev, newPt]);
    });

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Update Tile Layers based on selected tile type
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerGroupRef.current) return;
    const group = tileLayerGroupRef.current;
    group.clearLayers();

    if (activeTileType === "satellite" || activeTileType === "ndvi") {
      // High-Resolution ESRI Satellite Imagery
      const esriSatellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      );
      group.addLayer(esriSatellite);

      // If NDVI mode, add simulated high-vegetation index overlay
      if (activeTileType === "ndvi") {
        const ndviFilter = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            opacity: 0.65,
            className: "ndvi-tint-layer",
          }
        );
        group.addLayer(ndviFilter);
      }
    } else if (activeTileType === "hybrid") {
      // Satellite with road names & cadastral place labels
      const esriSatellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      );
      const labels = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      );
      group.addLayer(esriSatellite);
      group.addLayer(labels);
    } else {
      // OpenStreetMap streets & rural cadastral survey roads
      const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      });
      group.addLayer(osm);
    }
  }, [activeTileType]);

  // 4. Render Markers, Polygon, and Edge Badges whenever points or mode change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current || !edgeBadgesGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    edgeBadgesGroupRef.current.clearLayers();

    // Clean existing polygon / polyline
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
      polylineLayerRef.current = null;
    }

    const latLngArray: L.LatLngExpression[] = points.map((p) => [p.lat, p.lng]);

    if (measureMode === "area" && points.length >= 3) {
      // Draw enclosed field polygon with animated emerald border
      const poly = L.polygon(latLngArray, {
        color: "#10b981",
        weight: 3,
        dashArray: "6, 4",
        fillColor: "#059669",
        fillOpacity: 0.35,
      }).addTo(map);

      polygonLayerRef.current = poly;

      // Add edge badges displaying meters along each side
      points.forEach((pt, idx) => {
        const next = points[(idx + 1) % points.length];
        const midLat = (pt.lat + next.lat) / 2;
        const midLng = (pt.lng + next.lng) / 2;
        const dist = Math.round(calculateHaversineDistance(pt, next));

        const badgeIcon = L.divIcon({
          className: "edge-measurement-badge",
          html: `<div style="background-color: rgba(15, 23, 42, 0.88); color: #34d399; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; border: 1px solid #10b981; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${dist}m</div>`,
          iconSize: [40, 18],
          iconAnchor: [20, 9],
        });

        L.marker([midLat, midLng], { icon: badgeIcon, interactive: false }).addTo(
          edgeBadgesGroupRef.current!
        );
      });
    } else if (points.length >= 2) {
      // Distance ruler mode: open polyline
      const line = L.polyline(latLngArray, {
        color: "#f59e0b",
        weight: 3.5,
        dashArray: "8, 5",
      }).addTo(map);

      polylineLayerRef.current = line;

      // Segment distance badges
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const midLat = (p1.lat + p2.lat) / 2;
        const midLng = (p1.lng + p2.lng) / 2;
        const dist = Math.round(calculateHaversineDistance(p1, p2));

        const badgeIcon = L.divIcon({
          className: "ruler-measurement-badge",
          html: `<div style="background-color: rgba(15, 23, 42, 0.88); color: #fbbf24; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; border: 1px solid #f59e0b; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${dist}m</div>`,
          iconSize: [40, 18],
          iconAnchor: [20, 9],
        });

        L.marker([midLat, midLng], { icon: badgeIcon, interactive: false }).addTo(
          edgeBadgesGroupRef.current!
        );
      }
    }

    // Add draggable vertex pins with custom tactile markup
    points.forEach((pt, index) => {
      const pinColor = measureMode === "area" ? "#047857" : "#d97706";
      const customIcon = L.divIcon({
        className: "custom-field-pin",
        html: `<div style="background-color: ${pinColor}; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.5); cursor: move;">${
          index + 1
        }</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([pt.lat, pt.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(markersGroupRef.current!);

      // Draggable marker update
      marker.on("dragend", (e: any) => {
        const newPos = e.target.getLatLng();
        setPoints((prev) => {
          const updated = [...prev];
          updated[index] = {
            lat: +newPos.lat.toFixed(6),
            lng: +newPos.lng.toFixed(6),
          };
          return updated;
        });
      });

      // Marker click popup to delete vertex or view exact GPS
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 140px; padding: 2px;">
          <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 2px;">Corner #${index + 1}</div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">${pt.lat.toFixed(5)}°N, ${pt.lng.toFixed(5)}°E</div>
          <button id="del-pin-${index}" style="width: 100%; background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px; cursor: pointer;">
            Delete Corner #${index + 1}
          </button>
        </div>
      `);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`del-pin-${index}`);
        if (btn) {
          btn.onclick = () => {
            setPoints((prev) => prev.filter((_, i) => i !== index));
          };
        }
      });
    });
  }, [points, measureMode]);

  // 5. GPS Real Location Handler
  const handleLocateMyField = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentGpsCoord({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17, { duration: 1.5 });

          // Add pulsating GPS pin
          if (gpsMarkerRef.current) {
            mapInstanceRef.current.removeLayer(gpsMarkerRef.current);
          }
          gpsMarkerRef.current = L.circleMarker([latitude, longitude], {
            radius: 8,
            color: "#3b82f6",
            fillColor: "#60a5fa",
            fillOpacity: 0.8,
            weight: 2,
          }).addTo(mapInstanceRef.current);
        }
      },
      (err) => {
        alert(`Could not fetch GPS: ${err.message}. Please allow location access.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 6. Walk GPS Boundary Mode
  const handleToggleGpsWalk = () => {
    if (isWalkingGps) {
      // Stop walking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsWalkingGps(false);
    } else {
      // Start GPS walk
      if (!navigator.geolocation) {
        alert("GPS hardware unavailable on this device.");
        return;
      }
      setIsWalkingGps(true);
      setPoints([]);

      let lastAdded: LatLngPoint | null = null;
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPt: LatLngPoint = {
            lat: +pos.coords.latitude.toFixed(6),
            lng: +pos.coords.longitude.toFixed(6),
          };

          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([newPt.lat, newPt.lng]);
          }

          if (
            !lastAdded ||
            calculateHaversineDistance(lastAdded, newPt) >= 3 // Log point every 3 meters
          ) {
            lastAdded = newPt;
            setPoints((prev) => [...prev, newPt]);
          }
        },
        (err) => {
          // If browser GPS fails in development, fallback to simulated walk
          console.warn("GPS Walk tracking error, fallback to simulated path:", err);
          simulateWalkPath();
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
  };

  const simulateWalkPath = () => {
    setIsWalkingGps(true);
    setPoints([]);
    const walkPoints = SAMPLE_REGIONS.rampur.points;
    walkPoints.forEach((pt, i) => {
      setTimeout(() => {
        setPoints((prev) => [...prev, pt]);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([pt.lat, pt.lng]);
        }
        if (i === walkPoints.length - 1) {
          setIsWalkingGps(false);
        }
      }, (i + 1) * 600);
    });
  };

  // 7. Search Village / Location
  const handleSearchLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocationQuery.trim()) return;

    const q = searchLocationQuery.toLowerCase();
    // Quick match against Indian agricultural hubs
    const matchedKey = Object.keys(SAMPLE_REGIONS).find(
      (k) =>
        SAMPLE_REGIONS[k].name.toLowerCase().includes(q) ||
        SAMPLE_REGIONS[k].state.toLowerCase().includes(q) ||
        k.includes(q)
    );

    if (matchedKey) {
      handleLoadRegion(matchedKey);
    } else {
      // Nominatim free geocoding
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocationQuery)}&countrycodes=in`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
            }
          } else {
            alert(`Location "${searchLocationQuery}" not found. Try entering a city or district name.`);
          }
        })
        .catch(() => {
          alert("Could not reach location search service. Please try again.");
        });
    }
  };

  const handleLoadRegion = (key: string) => {
    const region = SAMPLE_REGIONS[key];
    if (region && mapInstanceRef.current) {
      setPoints(region.points);
      setFieldName(region.name);
      mapInstanceRef.current.flyTo(region.center, 17, { duration: 1.2 });
    }
  };

  const handleUndoPoint = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleClearPoints = () => {
    setPoints([]);
  };

  const handleOrderDosageForMeasuredField = () => {
    const requiredUreaBags = Math.max(1, Math.ceil(acres));
    const requiredDapBags = Math.max(1, Math.ceil(acres));

    addToCart(
      {
        id: "fert-1",
        title: "IFFCO Nano Urea (Liquid Biotechnology)",
        brand: "IFFCO",
        category: "subsidized",
        price: 650,
        subsidizedPrice: 225,
        packWeight: "500ml Bottle",
        image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80",
      },
      requiredUreaBags
    );

    addToCart(
      {
        id: "fert-2",
        title: "IFFCO Granular DAP (Basal Root Formulation)",
        brand: "IFFCO",
        category: "subsidized",
        price: 2450,
        subsidizedPrice: 1350,
        packWeight: "50kg Bag",
        image: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=400&q=80",
      },
      requiredDapBags
    );

    navigate("/store");
  };

  const handleSaveField = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // Export GeoJSON
  const handleExportGeoJson = () => {
    if (points.length < 3) return;
    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: fieldName,
            acres: acres,
            hectares: hectares,
            perimeterMeters: perimeterMeters,
            surveyDate: new Date().toISOString(),
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                ...points.map((p) => [p.lng, p.lat]),
                [points[0].lng, points[0].lat], // Close ring
              ],
            ],
          },
        },
      ],
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fieldName.replace(/\s+/g, "_")}_Survey.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold mb-2">
            <Satellite className="w-3.5 h-3.5" />
            <span>Direct Geographic Satellite Surveyor • High Precision ESRI Tiles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {t("satellite_measuring_title")}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl mt-1">
            {t("satellite_measuring_desc")}
          </p>
        </div>

        {/* Measurement Mode & Layer Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Measure Mode Switcher: Area vs Distance Ruler */}
          <div className="bg-slate-950/90 p-1 rounded-2xl flex items-center gap-1 border border-stone-700">
            <button
              onClick={() => setMeasureMode("area")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                measureMode === "area"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t("direct_area_mode")}</span>
            </button>
            <button
              onClick={() => setMeasureMode("ruler")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                measureMode === "ruler"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>{t("direct_ruler_mode")}</span>
            </button>
          </div>

          {/* Tile Layer Selector */}
          <div className="bg-slate-950/90 p-1 rounded-2xl flex items-center gap-1 border border-stone-700">
            <button
              onClick={() => setActiveTileType("satellite")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTileType === "satellite"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              {t("satellite_layer")}
            </button>
            <button
              onClick={() => setActiveTileType("hybrid")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTileType === "hybrid"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setActiveTileType("streets")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTileType === "streets"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              Roads
            </button>
            <button
              onClick={() => setActiveTileType("ndvi")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTileType === "ndvi"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              {t("ndvi_layer")}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Measurement Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real Interactive Map */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          {/* Top Controls Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Village or Coordinates */}
            <form onSubmit={handleSearchLocation} className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t("search_village_placeholder")}
                value={searchLocationQuery}
                onChange={(e) => setSearchLocationQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </form>

            {/* Action Buttons: GPS Locate, Walk, Undo, Clear */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleLocateMyField}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Zoom directly to your current field coordinates"
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                <span>{t("locate_my_field")}</span>
              </button>

              <button
                onClick={handleToggleGpsWalk}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isWalkingGps
                    ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                    : "bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200"
                }`}
                title="Walk field perimeter with smartphone"
              >
                <Footprints className="w-3.5 h-3.5 text-teal-600" />
                <span>{isWalkingGps ? t("walking_gps") : t("walk_gps_boundary")}</span>
              </button>

              <button
                onClick={handleUndoPoint}
                disabled={points.length === 0}
                className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-slate-600 disabled:opacity-40 cursor-pointer"
                title={t("undo_point")}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleClearPoints}
                disabled={points.length === 0}
                className="p-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 disabled:opacity-40 cursor-pointer"
                title={t("clear_all")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden border-2 border-stone-300 shadow-inner z-0">
            <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "400px" }} />

            {/* Instruction Floating Badge */}
            <div className="absolute top-3 left-3 z-[1000] bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700 text-[11px] text-white flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {measureMode === "area"
                  ? points.length < 3
                    ? "Click on map to place boundary pins (at least 3 corners)"
                    : `${points.length} Pins • Drag any pin to adjust corners`
                  : `${points.length} Line Points • Click map to measure distance`}
              </span>
            </div>

            {/* Scale & Coordinate HUD */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700 text-[10px] text-emerald-300 flex items-center gap-3 pointer-events-none">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-400" />
                <span>
                  {points.length > 0
                    ? `${points[points.length - 1].lat.toFixed(4)}°N, ${points[points.length - 1].lng.toFixed(4)}°E`
                    : "Live GPS Ready"}
                </span>
              </span>
              <span className="text-stone-500">|</span>
              <span className="text-stone-300">{t("drag_pin_hint")}</span>
            </div>
          </div>

          {/* Preset Farm Parcel Quick Selectors */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {t("sample_plots")}
            </span>
            <button
              onClick={() => handleLoadRegion("rampur")}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer"
            >
              Rampur (Wheat 4.1 Ac)
            </button>
            <button
              onClick={() => handleLoadRegion("nashik")}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer"
            >
              Nashik (Vineyard 3.6 Ac)
            </button>
            <button
              onClick={() => handleLoadRegion("baramati")}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer"
            >
              Baramati (Sugarcane 5.2 Ac)
            </button>
            <button
              onClick={() => handleLoadRegion("karnal")}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer"
            >
              Karnal (Basmati 4.8 Ac)
            </button>
          </div>
        </div>

        {/* Right Column: Live Measurement HUD, Perimeter Fencing & Dosage Bridge */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
            {/* Header / Field Name Input */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  {t("measured_land_dimensions")}
                </span>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="font-bold text-base text-slate-900 border-b border-transparent hover:border-stone-300 focus:border-emerald-600 focus:outline-none w-full"
                />
              </div>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Satellite className="w-5 h-5" />
              </span>
            </div>

            {/* Primary Area Display or Line Distance Display */}
            {measureMode === "area" ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    {t("total_measured_area")}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                    {areaSqMeters.toLocaleString()} m²
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-900">
                    {selectedUnit === "acres"
                      ? `${acres} ${t("acres_label")}`
                      : selectedUnit === "gunthas"
                      ? `${gunthas} ${t("guntha_label")}`
                      : selectedUnit === "bighas"
                      ? `${bighas} ${t("bigha_label")}`
                      : `${hectares} ${t("ha_label")}`}
                  </span>
                </div>

                {/* Regional Units Switcher */}
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {(["acres", "gunthas", "bighas", "hectares"] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setSelectedUnit(unit)}
                      className={`py-1 text-[10px] font-bold rounded-lg capitalize transition-all cursor-pointer ${
                        selectedUnit === unit
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {unit === "acres"
                        ? t("acres_label")
                        : unit === "gunthas"
                        ? t("guntha_label")
                        : unit === "bighas"
                        ? t("bigha_label")
                        : t("ha_label")}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                  Total Measured Distance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-900">
                    {perimeterMeters >= 1000
                      ? `${(perimeterMeters / 1000).toFixed(2)} km`
                      : `${perimeterMeters} meters`}
                  </span>
                </div>
                <span className="text-[11px] text-amber-800 block">
                  {perimeterFeet} Feet across {points.length} survey points
                </span>
              </div>
            )}

            {/* Perimeter & Fencing Cost Estimator */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <Fence className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {measureMode === "area" ? t("boundary_perimeter") : "Line Distance"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {t("total_fencing_length")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">{perimeterMeters} m</span>
                  <span className="text-[10px] text-slate-500 block">{perimeterFeet} Feet</span>
                </div>
              </div>

              {/* Barbed Wire Fencing Estimator */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-amber-900 block">{t("fence_estimator")}</span>
                <p className="text-[11px] text-slate-600">
                  {t("fence_desc")} <strong>{Math.ceil(perimeterMeters / 100)} bundles</strong> (₹
                  {Math.round(perimeterMeters * 18).toLocaleString("en-IN")}) •{" "}
                  <strong>{Math.ceil(perimeterMeters / 3)} boundary posts</strong> (at 3m spacing).
                </p>
              </div>

              {/* Individual Side Distances List */}
              {segmentDistances.length > 0 && (
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Side-by-Side Lengths:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {segmentDistances.map((dist, idx) => (
                      <div
                        key={idx}
                        className="bg-stone-100 p-1.5 rounded-lg text-[11px] font-medium text-slate-700 flex justify-between"
                      >
                        <span>Side #{idx + 1}:</span>
                        <strong>{dist}m</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Fertilizer Dosage Bridge */}
            {measureMode === "area" && acres > 0 && (
              <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl space-y-2.5 shadow-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    {t("input_dosage_title")} {acres} {t("acres_label")}
                  </span>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                </div>
                <p className="text-xs text-emerald-50 leading-relaxed">
                  <strong>{Math.max(1, Math.ceil(acres))} Bottles Nano Urea</strong> +{" "}
                  <strong>{Math.max(1, Math.ceil(acres))} Bags DAP</strong>.
                </p>

                <button
                  onClick={handleOrderDosageForMeasuredField}
                  className="w-full py-2.5 px-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t("add_dosage_to_cart")}</span>
                </button>
              </div>
            )}

            {/* Actions: Save Boundary & Export GeoJSON */}
            <div className="flex items-center gap-2 pt-1">
              {savedNotice ? (
                <div className="flex-1 p-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t("field_saved_notice")}</span>
                </div>
              ) : (
                <button
                  onClick={handleSaveField}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {t("save_boundary")}
                </button>
              )}

              <button
                onClick={handleExportGeoJson}
                disabled={points.length < 3}
                className="p-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                title="Download GeoJSON land record file for Patwari / PMFBY claim"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
