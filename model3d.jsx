/* model3d.jsx — load the user's real Revit IFC via web-ifc, with a parametric fallback */
const { useRef: useR, useEffect: useEf, useState: useSt } = React;

function Model3D({ lang }) {
  const mountRef = useR(null);
  const fileInputRef = useR(null);
  const api = useR(null);
  const [show, setShow] = useSt({ structure: true, walls: true, stair: true, wire: false, rotate: false, axes: true, grid: true });
  const [status, setStatus] = useSt({ phase: "idle", count: 0, source: "none", fileName: "" });
  const t = (k) => window.I18N.t(k, lang);

  useEf(() => {
    const THREE = window.THREE;
    const mount = mountRef.current;
    if (!THREE || !mount) return;
    let disposed = false;

    // ---- scene ---- (Y-UP world: X–Z is the floor, +Y points up)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef1f5);
    const W = mount.clientWidth || 600, H = mount.clientHeight || 440;
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 8000);
    camera.position.set(14, 11, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.borderRadius = "10px";

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 3, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa0a8, 0.9));
    const sun = new THREE.DirectionalLight(0xfff4e6, 0.95);
    sun.position.set(18, 28, 14); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 160 });
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xdce6ff, 0.32);
    fill.position.set(-14, 10, -12); scene.add(fill);

    // ground lies on the X–Z plane (Y = 0) — rotate the CircleGeometry's
    // default XY orientation so its normal points +Y.
    const ground = new THREE.Mesh(new THREE.CircleGeometry(120, 64),
      new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; ground.receiveShadow = true;
    scene.add(ground);
    // GridHelper is already on the X–Z plane.
    const grid = new THREE.GridHelper(120, 120, 0xb6bdc6, 0xccd2da);
    scene.add(grid);

    // ---- XYZ axes helper (X red, Y green, Z blue) with labels ----
    const axesGroup = new THREE.Group();
    axesGroup.name = "axesHelper";
    const axesHelper = new THREE.AxesHelper(10);
    // brighter, isolated colors
    axesHelper.material.depthTest = false;
    axesHelper.material.transparent = true;
    axesHelper.renderOrder = 999;
    const axColors = new Float32Array([
      1, 0.20, 0.20, 1, 0.20, 0.20,   // X red
      0.20, 0.75, 0.20, 0.20, 0.75, 0.20, // Y green
      0.25, 0.45, 1.0, 0.25, 0.45, 1.0,   // Z blue
    ]);
    axesHelper.geometry.setAttribute("color", new THREE.BufferAttribute(axColors, 3));
    axesGroup.add(axesHelper);

    // small sphere at origin
    const origin = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x222831 })
    );
    axesGroup.add(origin);

    // axis tip labels as sprites
    function makeLabel(text, color) {
      const cv = document.createElement("canvas");
      cv.width = 64; cv.height = 64;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = color;
      ctx.font = "bold 44px IBM Plex Mono, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(text, 32, 34);
      const tex = new THREE.CanvasTexture(cv);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
      const sp = new THREE.Sprite(mat);
      sp.renderOrder = 1000;
      sp.scale.set(1.2, 1.2, 1.2);
      return sp;
    }
    const labX = makeLabel("X", "#e23838"); labX.position.set(11, 0, 0);
    const labY = makeLabel("Y", "#1f9d3a"); labY.position.set(0, 11, 0);
    const labZ = makeLabel("Z", "#2a6df4"); labZ.position.set(0, 0, 11);
    axesGroup.add(labX, labY, labZ);
    scene.add(axesGroup);

    const gStruct = new THREE.Group(), gWall = new THREE.Group(), gStair = new THREE.Group();
    scene.add(gStruct, gWall, gStair);
    const meshes = [];
    let home = camera.position.clone(), homeTarget = controls.target.clone();

    const MAT = {
      struct: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.82, metalness: 0.02 }),
      slab:   new THREE.MeshStandardMaterial({ color: 0xb2b9c1, roughness: 0.9 }),
      wall:   new THREE.MeshStandardMaterial({ color: 0xe7ddc9, roughness: 0.96 }),
      stair:  new THREE.MeshStandardMaterial({ color: 0x6f9bc4, roughness: 0.6, metalness: 0.05 }),
    };

    let raf;
    const loop = () => { raf = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); };
    loop();

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    });
    ro.observe(mount);

    function frameCamera() {
      const allBox = new THREE.Box3();
      [gStruct, gWall, gStair].forEach((g) => { if (g.children.length) allBox.expandByObject(g); });
      if (allBox.isEmpty()) return;
      const size = allBox.getSize(new THREE.Vector3());
      const center = allBox.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 10;
      controls.target.copy(center);
      controls.minDistance = maxDim * 0.35;
      controls.maxDistance = maxDim * 7;
      const dist = maxDim * 1.6;
      camera.position.set(center.x + dist * 0.85, center.y + dist * 0.55, center.z + dist * 0.95);
      camera.near = maxDim / 200; camera.far = maxDim * 60; camera.updateProjectionMatrix();
      controls.update();
      home = camera.position.clone(); homeTarget = controls.target.clone();
      const r = maxDim * 0.9;
      Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: maxDim / 50, far: maxDim * 6 });
      sun.shadow.camera.updateProjectionMatrix();
      sun.position.set(center.x + r, center.y + maxDim * 1.8, center.z + r * 0.7);
      const gs = Math.ceil(maxDim * 1.8 / 2) * 2;
      // grid + ground sit on the X–Z floor at the building's lowest Y.
      grid.position.set(center.x, allBox.min.y, center.z);
      grid.scale.setScalar(gs / 120);
      ground.position.set(center.x, allBox.min.y - 0.02, center.z);

      // axes at plan corner (NW), at the foundation level
      const axS = maxDim * 0.35;
      axesGroup.scale.setScalar(axS / 10);
      axesGroup.position.set(
        allBox.min.x - maxDim * 0.05,
        allBox.min.y,
        allBox.min.z - maxDim * 0.05
      );
    }

    api.current = {
      THREE, scene, camera, controls, renderer, gStruct, gWall, gStair, meshes,
      axesGroup, grid,
      reset() { camera.position.copy(home); controls.target.copy(homeTarget); controls.update(); },
    };

    // ================= real IFC loader =================
    async function loadIFC(arrayBuffer, fileName) {
      try {
        if (!disposed) setStatus({ phase: "loading", count: 0, source: "ifc", fileName });
        // clear any previous geometry
        [gStruct, gWall, gStair].forEach((g) => { while (g.children.length) g.remove(g.children[0]); });
        meshes.length = 0;

        const ver = await window.__webifcReady;
        if (!ver || !window.WebIFC) throw new Error("web-ifc unavailable");
        const ifcAPI = new window.WebIFC.IfcAPI();
        ifcAPI.SetWasmPath("https://unpkg.com/web-ifc@" + ver + "/", true);
        await ifcAPI.Init();

        const buf = new Uint8Array(arrayBuffer);
        const modelID = ifcAPI.OpenModel(buf, { COORDINATE_TO_ORIGIN: true });

        // category routing by IFC express type id
        const W = window.WebIFC;
        const wallTypes = new Set([W.IFCWALL, W.IFCWALLSTANDARDCASE, W.IFCCURTAINWALL, W.IFCPLATE, W.IFCWINDOW, W.IFCDOOR, W.IFCCOVERING, W.IFCMEMBER].filter((x) => x != null));
        const stairTypes = new Set([W.IFCSTAIR, W.IFCSTAIRFLIGHT, W.IFCRAMP, W.IFCRAMPFLIGHT, W.IFCRAILING].filter((x) => x != null));

        // No axis remap — bake ONLY the IFC element-level world matrix
        // (flatTransformation). IFC's +Z (height) lands on world Z, so a
        // typical building's height runs along the depth axis on screen,
        // i.e. the building appears lying down. The X–Z plane is the floor.
        const tmp = new THREE.Matrix4();
        let count = 0;
        const buckets = { struct: [], wall: [], stair: [] };

        ifcAPI.StreamAllMeshes(modelID, (mesh) => {
          const placedGeoms = mesh.geometries;
          let eType = null;
          try { eType = ifcAPI.GetLineType(modelID, mesh.expressID); } catch (e) { eType = null; }
          let cat = "struct";
          if (eType != null && wallTypes.has(eType)) cat = "wall";
          else if (eType != null && stairTypes.has(eType)) cat = "stair";
          for (let i = 0; i < placedGeoms.size(); i++) {
            const pg = placedGeoms.get(i);
            const geom = ifcAPI.GetGeometry(modelID, pg.geometryExpressID);
            const verts = ifcAPI.GetVertexArray(geom.GetVertexData(), geom.GetVertexDataSize());
            const idx = ifcAPI.GetIndexArray(geom.GetIndexData(), geom.GetIndexDataSize());
            const bg = new THREE.BufferGeometry();
            const posArr = new Float32Array(verts.length / 2);
            const normArr = new Float32Array(verts.length / 2);
            for (let v = 0; v < verts.length; v += 6) {
              const o = v / 2;
              posArr[o] = verts[v]; posArr[o + 1] = verts[v + 1]; posArr[o + 2] = verts[v + 2];
              normArr[o] = verts[v + 3]; normArr[o + 1] = verts[v + 4]; normArr[o + 2] = verts[v + 5];
            }
            bg.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
            bg.setAttribute("normal", new THREE.BufferAttribute(normArr, 3));
            bg.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1));
            const m = pg.flatTransformation;
            tmp.set(m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]);
            bg.applyMatrix4(tmp);
            bg.computeBoundingBox();
            buckets[cat].push(bg);
            geom.delete();
            count++;
          }
        });

        function addBucket(arr, group, mat) {
          arr.forEach((bg) => {
            const mesh = new THREE.Mesh(bg, mat);
            mesh.castShadow = true; mesh.receiveShadow = true;
            group.add(mesh); meshes.push(mesh);
          });
        }
        addBucket(buckets.struct, gStruct, MAT.struct);
        addBucket(buckets.wall, gWall, MAT.wall);
        addBucket(buckets.stair, gStair, MAT.stair);

        const finalBox = new THREE.Box3();
        [gStruct, gWall, gStair].forEach((g) => g.children.forEach((m) => {
          if (m.geometry.boundingBox) finalBox.union(m.geometry.boundingBox);
        }));
        const fsz = finalBox.getSize(new THREE.Vector3());
        console.info("[Model3D] size X/Y/Z (raw) =",
          fsz.x.toFixed(2), fsz.y.toFixed(2), fsz.z.toFixed(2));

        // ---- Step 1: derive bbox geometry — INDEPENDENT of web-ifc storey
        // queries so a problem with those queries doesn't kill the footprint
        // data needed by the analyzer. ----
        // Auto-detect IFC unit: any dimension > 30 must be cm (largest
        // residential dim in metres is ~30 m). Anything smaller is already
        // in metres (some IFC exports / some web-ifc versions auto-convert).
        const maxDimRaw = Math.max(fsz.x, fsz.y, fsz.z);
        const unitScale = maxDimRaw > 30 ? 0.01 : 1.0;
        const sx = fsz.x * unitScale, sy = fsz.y * unitScale, sz = fsz.z * unitScale;
        // "Lying down" convention: IFC Z is rendered as world Z (depth) and IS
        // the building's vertical axis. Footprint plan = X × Y, height = Z.
        const footprint = sx * sy;       // m² plan area
        const perimeter = 2 * (sx + sy); // m
        const totalHeight = sz;          // m
        window.BIM_STORE = window.BIM_STORE || {};
        window.BIM_STORE.ifcMeta = Object.assign(window.BIM_STORE.ifcMeta || {}, {
          fileName, footprint, perimeter, totalHeight,
          sizeXm: sx, sizeYm: sy, sizeZm: sz,
          unitDetected: unitScale === 0.01 ? "cm" : "m",
        });
        console.info("[Model3D] bbox derived (unit=" + (unitScale === 0.01 ? "cm" : "m") + "):",
          "footprint=" + footprint.toFixed(1) + "m²",
          "perimeter=" + perimeter.toFixed(1) + "m",
          "height=" + totalHeight.toFixed(2) + "m");

        // ---- Step 2: pull project name + storeys from IFC schema. If this
        // fails, the analyzer still works because the bbox is already saved. ----
        try {
          const W = window.WebIFC;

          // building / project name
          let projectName = "";
          try {
            const bIDs = ifcAPI.GetLineIDsWithType(modelID, W.IFCBUILDING);
            if (bIDs.size() > 0) {
              const b = ifcAPI.GetLine(modelID, bIDs.get(0), false);
              projectName = (b.Name && b.Name.value) || (b.LongName && b.LongName.value) || "";
            }
            if (!projectName) {
              const pIDs = ifcAPI.GetLineIDsWithType(modelID, W.IFCPROJECT);
              if (pIDs.size() > 0) {
                const p = ifcAPI.GetLine(modelID, pIDs.get(0), false);
                projectName = (p.Name && p.Name.value) || (p.LongName && p.LongName.value) || "";
              }
            }
          } catch (e) { /* ignore */ }

          // building storeys → habitable floor count
          const storeyIDs = ifcAPI.GetLineIDsWithType(modelID, W.IFCBUILDINGSTOREY);
          const storeys = [];
          for (let i = 0; i < storeyIDs.size(); i++) {
            try {
              const st = ifcAPI.GetLine(modelID, storeyIDs.get(i), false);
              const nm = (st.Name && st.Name.value) || (st.LongName && st.LongName.value) || "";
              const el = (st.Elevation && st.Elevation.value != null) ? st.Elevation.value : 0;
              storeys.push({ name: String(nm), elevation: Number(el) || 0 });
            } catch (e) { /* skip */ }
          }
          storeys.sort((a, b) => a.elevation - b.elevation);
          // Exclude foundation, roof and "top of foundation" pseudo-levels.
          const NON_HABITABLE = /^(tof|top[\s_-]?of[\s_-]?foundation|rfl|roof|atap|fondasi)$/i;
          const habitable = storeys.filter((s) => !NON_HABITABLE.test(s.name));

          Object.assign(window.BIM_STORE.ifcMeta, {
            projectName,
            storeys, habitableCount: habitable.length,
          });
          const baseName = projectName || fileName.replace(/\.ifc$/i, "");
          if (window.BIM_CALC && window.BIM_CALC.updateProject) {
            window.BIM_CALC.updateProject({
              nameId: baseName, nameEn: baseName,
              code: fileName, floors: habitable.length || storeys.length,
            });
          }
          console.info("[Model3D] storeys:", storeys.map((s) => s.name + "@" + s.elevation).join(", "),
            "habitable:", habitable.length);
        } catch (e) {
          console.warn("storey extraction failed", e);
        }

        ifcAPI.CloseModel(modelID);

        if (count === 0) throw new Error("no geometry parsed");
        frameCamera();
        if (!disposed) setStatus({ phase: "ifc", count, source: "ifc", fileName });
      } catch (e) {
        console.warn("IFC load failed:", e);
        [gStruct, gWall, gStair].forEach((g) => { while (g.children.length) g.remove(g.children[0]); g.rotation.set(0, 0, 0); });
        meshes.length = 0;
        if (!disposed) setStatus({ phase: "error", count: 0, source: "none", fileName: "", error: String(e.message || e) });
      }
    }

    // expose loadIFC so the file input can call it
    api.current.loadFromBuffer = loadIFC;

    // Auto-restore: if the user previously loaded an IFC and just navigated
    // away & back, the buffer is still in BIM_STORE — replay the load.
    if (window.BIM_STORE && window.BIM_STORE.ifcBuffer) {
      const cached = window.BIM_STORE.ifcBuffer;
      loadIFC(cached.buffer.slice(0), cached.fileName).catch((e) => console.warn("auto-restore IFC failed", e));
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  // ---- apply toggles ----
  useEf(() => {
    const a = api.current; if (!a) return;
    a.gStruct.visible = show.structure; a.gWall.visible = show.walls; a.gStair.visible = show.stair;
    a.meshes.forEach((m) => { if (m.material && "wireframe" in m.material) m.material.wireframe = show.wire; });
    a.controls.autoRotate = show.rotate; a.controls.autoRotateSpeed = 1.0;
    if (a.axesGroup) a.axesGroup.visible = show.axes;
    if (a.grid) a.grid.visible = show.grid;
  }, [show, status]);

  const chip = (key, label, sw) => (
    <button className={"layer-chip" + (show[key] ? " on" : "")} onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}>
      {sw && <span className="chip-sw" style={{ background: sw }} />}{label}
      <span className="chip-state">{show[key] ? "ON" : "OFF"}</span>
    </button>
  );

  const onFileChosen = async (file) => {
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      if (api.current && api.current.loadFromBuffer) {
        // pass a clone — web-ifc consumes its input. Keep the original for the
        // BIM_STORE cache so we can reload after a menu switch.
        await api.current.loadFromBuffer(buf.slice(0), file.name);
        window.BIM_STORE = window.BIM_STORE || {};
        window.BIM_STORE.ifcBuffer = { buffer: buf, fileName: file.name };
        if (window.emitBimStoreChange) window.emitBimStoreChange();
      }
    } catch (e) {
      console.warn("file read failed", e);
      setStatus({ phase: "error", count: 0, source: "none", fileName: "", error: String(e.message || e) });
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) onFileChosen(file);
  };

  const onClearIfc = () => {
    if (!api.current) return;
    // empty the scene groups + reset status, drop the cache
    [api.current.gStruct, api.current.gWall, api.current.gStair].forEach((g) => {
      while (g.children.length) g.remove(g.children[0]);
      g.rotation.set(0, 0, 0);
    });
    if (api.current.meshes) api.current.meshes.length = 0;
    setStatus({ phase: "idle", count: 0, source: "none", fileName: "" });
    window.BIM_STORE = window.BIM_STORE || {};
    window.BIM_STORE.ifcBuffer = null;
    window.BIM_STORE.ifcMeta = null;
    // wipe IFC-derived project fields (CSV fields preserved if any)
    if (window.BIM_CALC && window.BIM_CALC.updateProject) {
      window.BIM_CALC.updateProject({ nameId: "", nameEn: "", code: "", floors: 0 });
    }
    if (window.emitBimStoreChange) window.emitBimStoreChange();
  };

  const badge = status.phase === "loading"
    ? t("ov_loading")
    : status.phase === "ifc"
      ? `IFC · ${status.count} ${t("ov_elements")}`
      : status.phase === "error"
        ? (t("ov_loadFail") + (status.error ? " — " + status.error : ""))
        : t("ov_dropHint");

  const hasModel = status.phase === "ifc";
  const isLoading = status.phase === "loading";

  return (
    <div>
      <div
        className="model-wrap"
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={onDrop}
      >
        <div ref={mountRef} className="model-canvas" />

        {hasModel && (
          <div className="model-badge num" title={status.fileName}>
            IFC · {status.fileName ? status.fileName.replace(/\.ifc$/i, "") : "model"}
          </div>
        )}
        {isLoading && (
          <div className="model-loading"><span className="spinner" /> {t("ov_loading")}</div>
        )}

        {/* Idle/empty/error state: prominent upload affordance */}
        {!hasModel && !isLoading && (
          <div className="model-empty">
            <div className="empty-icon" aria-hidden>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" />
                <path d="m7 8 5-5 5 5" />
                <path d="M5 21h14a2 2 0 0 0 2-2v-4" />
                <path d="M3 15v4a2 2 0 0 0 2 2" />
              </svg>
            </div>
            <div className="empty-title">{t("ov_dropTitle")}</div>
            <div className="empty-sub">{t("ov_dropHint")}</div>
            <button className="empty-btn" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
              {t("ov_chooseFile")}
            </button>
            {status.phase === "error" && (
              <div className="empty-err">⚠ {status.error}</div>
            )}
          </div>
        )}

        <div className="model-hint">{badge}{hasModel ? " · " + t("ov_modelHint") : ""}</div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".ifc,application/octet-stream"
        style={{ display: "none" }}
        onChange={(e) => onFileChosen(e.target.files && e.target.files[0])}
      />

      <div className="layer-bar">
        <span className="card-eyebrow" style={{ marginRight: 4 }}>{t("ov_layers")}</span>
        {chip("structure", t("ov_structure"), "#9aa3ad")}
        {chip("walls", t("ov_walls"), "#e0d3bb")}
        {chip("stair", t("ov_stair"), "#6f9bc4")}
        <span style={{ width: 1, height: 20, background: "var(--line)", margin: "0 2px" }} />
        {chip("axes", t("ov_axes"))}
        {chip("grid", t("ov_grid"))}
        {chip("wire", t("ov_wireframe"))}
        {chip("rotate", t("ov_autoRotate"))}
        <button className="layer-chip" onClick={() => api.current && api.current.reset()} disabled={!hasModel}>↺ {t("ov_resetView")}</button>
        <span style={{ flex: 1 }} />
        <button className="layer-chip" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
          {hasModel ? t("ov_changeFile") : t("ov_chooseFile")}
        </button>
        {hasModel && (
          <button className="layer-chip layer-chip-danger" onClick={onClearIfc} title={t("ov_clearFile")}>
            ✕ {t("ov_clearFile")}
          </button>
        )}
      </div>
    </div>
  );
}

window.Model3D = Model3D;
