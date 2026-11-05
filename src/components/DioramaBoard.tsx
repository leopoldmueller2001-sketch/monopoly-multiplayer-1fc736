import { tokenImage } from './TokenArt';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Camera, LocateFixed, ScanLine, RotateCcw } from 'lucide-react';
import { getBoardTiles } from '../data/boardVariants';
import type { BoardTile, GameState } from '../types/game';
import { createArchitecture } from '../utils/architecture';
import { createBoardTileMesh } from '../utils/propertyModel';

export function DioramaBoard({ gameState, onTileClick }: { gameState: GameState; onTileClick: (tile: BoardTile) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const live = useRef(gameState); live.current = gameState;
  const click = useRef(onTileClick); click.current = onTileClick;
  const controlsRef = useRef<(mode: string) => void>(() => {});
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState('perspective');
  const [hovered, setHovered] = useState<BoardTile | null>(null);
  const dynamicRef = useRef<() => void>(() => {});
  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { setFailed(true); return; }
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#172822');
    const tiles = getBoardTiles(live.current.boardSize); const side = tiles.length / 4; const step = 1.4; const half = side * step / 2;
    const position = (id: number) => {
      const edge = Math.floor(id / side), n = id % side;
      return edge === 0 ? [half - n * step, half, 0] : edge === 1 ? [-half, half - n * step, Math.PI / 2] : edge === 2 ? [-half + n * step, -half, Math.PI] : [half, -half + n * step, -Math.PI / 2];
    };
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 500);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .47; controls.minDistance = 4; controls.maxDistance = half * 8;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight('#fff2d5', '#4b685c', 2.6));
    const sun = new THREE.DirectionalLight('#ffe4ba', 3.6); sun.position.set(-half, half * 2, half); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -half * 1.5, right: half * 1.5, top: half * 1.5, bottom: -half * 1.5, far: half * 7 }); sun.shadow.bias = -.0003; scene.add(sun);
    const fill = new THREE.DirectionalLight('#c8e4e1', 1.5); fill.position.set(half, half, -half); scene.add(fill);
    const materials = {
      wood: new THREE.MeshStandardMaterial({ color: '#684329', roughness: .48 }),
      brass: new THREE.MeshStandardMaterial({ color: '#c5a768', metalness: .8, roughness: .3 }),
      felt: new THREE.MeshStandardMaterial({ color: '#31594a', roughness: .95 }),
    };
    const block = (w: number, h: number, d: number, y: number, material: THREE.Material) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material); m.position.y = y; m.receiveShadow = true; scene.add(m); return m; };
    block(half * 2 + 2.5, .65, half * 2 + 2.5, -.45, materials.wood);
    block(half * 2 + 2.55, .07, half * 2 + 2.55, -.1, materials.brass);
    block(half * 2 + 2.3, .1, half * 2 + 2.3, -.04, materials.felt);
    const pickables: THREE.Object3D[] = [];
    tiles.forEach(tile => {
      const [x,z,rotation] = position(tile.id); const lot = new THREE.Group(); lot.position.set(x,.04,z); lot.rotation.y = rotation;
      const slab = createBoardTileMesh(tile); slab.scale.set(1.03 / (tile.id % 10 === 0 ? 1.85 : 1.25), 1, 1); lot.add(slab); pickables.push(slab);
      scene.add(lot);
    });
    // A typeset inlay sits below the skyline; labels remain readable in top view.
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#e1cc9e'; ctx.textAlign = 'center';
    ctx.font = '24px Georgia'; ctx.fillText('T H E   B O A R D R O O M   E D I T I O N',512,160);
    ctx.fillStyle = '#a44133'; ctx.fillRect(110,200,804,110); ctx.strokeStyle = '#e1cc9e'; ctx.lineWidth = 4; ctx.strokeRect(116,206,792,98);
    ctx.fillStyle = '#fff4df'; ctx.font = 'bold 82px Georgia'; ctx.fillText('MONOPOLY',512,282);
    ctx.fillStyle = '#e1cc9e'; ctx.font = '23px Georgia'; ctx.fillText(`${tiles.length} FELDER  /  REALTIME ARENA`,512,365);
    const labelTexture = new THREE.CanvasTexture(canvas); labelTexture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(half * 1.4,half * .7),new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite:false })); label.rotation.x = -Math.PI/2; label.position.y = .04; scene.add(label);
    const dynamic = new THREE.Group(); scene.add(dynamic);
    const dispose = (root: THREE.Object3D) => { const mats = new Set<THREE.Material>(); root.traverse(o => { if (o instanceof THREE.Mesh || o instanceof THREE.Sprite) { if (o instanceof THREE.Mesh) o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m)); } }); mats.forEach(m => { if (m instanceof THREE.SpriteMaterial) m.map?.dispose(); m.dispose(); }); };
    const tokens = new Map<string, THREE.Group>();
    dynamicRef.current = () => {
      dispose(dynamic); dynamic.clear();
      tiles.forEach(tile => {
        if (!['street','railroad','utility'].includes(tile.type)) return;
        const property = live.current.properties[tile.id]; const [x,z,r] = position(tile.id);
        const lot = new THREE.Group(); lot.position.set(x,.12,z); lot.rotation.y = r;
        const building = createArchitecture(tile, property?.houses || 0); building.scale.setScalar(.82); building.position.z = -.42; lot.add(building);
        if (property?.ownerId) {
          const owner = live.current.players.find(p => p.id === property.ownerId);
          const badge = new THREE.Mesh(new THREE.BoxGeometry(.95,.035,.11), new THREE.MeshStandardMaterial({color: property.mortgaged ? '#7c7a70' : owner?.color || '#d4bc82'})); badge.position.set(0,.05,.72); lot.add(badge);
        }
        // Actual upgrades are explicit markers, separate from decorative architecture.
        for (let i=0; i < (property?.houses || 0); i++) { const pip = new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1), new THREE.MeshStandardMaterial({color: property?.houses === 5 ? '#bc493b' : '#4e9c65'})); pip.position.set((i-2)*.15,.12,.35); lot.add(pip); }
        dynamic.add(lot);
      });
      live.current.players.forEach(p => {
        if (p.bankrupt) return;
        let token = tokens.get(p.id);
        if (!token) {
          token = new THREE.Group();
          const base = new THREE.Mesh(new THREE.CylinderGeometry(.19,.24,.1,24), new THREE.MeshStandardMaterial({color:p.color, metalness:.6,roughness:.3})); token.add(base);
          const texture = new THREE.TextureLoader().load(tokenImage(p.token)); texture.colorSpace = THREE.SRGBColorSpace;
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:texture, depthTest:true }));sprite.scale.set(.58,.58,1);sprite.position.y=.36;token.add(sprite);scene.add(token);tokens.set(p.id,token);
          const [x,z] = position(p.position);token.position.set(x,.22,z+.42);
        }
      });
    }; dynamicRef.current();
    const resize = () => { const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize);observer.observe(host);resize();
    controlsRef.current = action => {
      if(action === 'focus') { const p=live.current.players[live.current.activePlayerIndex];if(!p)return;const [x,z]=position(p.position);controls.target.set(x,0,z);camera.position.set(x+3,5,z+5); }
      else { controls.target.set(0,0,0);const fit=Math.max(1,.95/camera.aspect);camera.position.set(action === 'top' ? 0 : half*1.55*fit,half*(action === 'top'?3.1:2.3)*fit,action === 'top' ? .01 : half*2.1*fit); } controls.update();
    }; controlsRef.current('perspective');
    const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(); let downX=0,downY=0;
    const pick=(e:PointerEvent) => { const rect=host.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(pickables)[0]?.object.userData.tileData as BoardTile | undefined; };
    const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY;};
    const up=(e:PointerEvent)=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)<5){const tile=pick(e);if(tile)click.current(tile);}};
    const move=(e:PointerEvent)=>setHovered(pick(e)||null);
    host.addEventListener('pointerdown',down);host.addEventListener('pointerup',up);host.addEventListener('pointermove',move);
    const lost=(event:Event)=>{event.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
    let frame=0;let previous=performance.now();
    const animate=(now:number)=>{frame=requestAnimationFrame(animate);const delta=Math.min(.1,(now-previous)/1000);previous=now;
      tokens.forEach((token,id)=>{const p=live.current.players.find(p=>p.id===id);token.visible=!!p&&!p.bankrupt;if(!p)return;const peers=live.current.players.filter(other=>!other.bankrupt&&other.position===p.position);const index=peers.findIndex(other=>other.id===id);const [x,z]=position(p.position);token.position.lerp(new THREE.Vector3(x+(index%4-1.5)*.23,.22+Math.floor(index/8)*.12,z+.3+Math.floor(index%8/4)*.23),1-Math.exp(-delta*8));});
      controls.update();if(!document.hidden)renderer.render(scene,camera);
    };frame=requestAnimationFrame(animate);
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();host.removeEventListener('pointerdown',down);host.removeEventListener('pointerup',up);host.removeEventListener('pointermove',move);controls.dispose();dynamicRef.current=()=>{};controlsRef.current=()=>{};dispose(scene);labelTexture.dispose();sun.shadow.dispose();renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.dispose();renderer.domElement.remove();};
  }, [gameState.boardSize]);
  const appearanceKey = JSON.stringify([gameState.properties, gameState.players.map(p => [p.id, p.color, p.token, p.bankrupt])]);
  useEffect(()=>dynamicRef.current(),[appearanceKey]);
  const activePosition = gameState.players[gameState.activePlayerIndex]?.position;
  useEffect(()=>{ if (mode === 'focus') controlsRef.current('focus'); },[mode, activePosition, gameState.activePlayerIndex]);
  return <section className="arena-diorama" aria-label="Spielbares 3D-Miniaturstadtbrett">
    <div ref={hostRef} className="arena-diorama-canvas" />
    <div className="board-toolbar" role="group" aria-label="Miniaturstadt-Kamera">{([['perspective',Camera,'Stadtansicht'],['top',ScanLine,'Draufsicht'],['focus',LocateFixed,'Am Zug']] as const).map(([id,Icon,title])=><button key={id} aria-pressed={mode===id} onClick={()=>{setMode(id);controlsRef.current(id);}}><Icon size={14}/><span>{title}</span></button>)}<button aria-label="Kamera zurücksetzen" onClick={()=>{setMode('perspective');controlsRef.current('perspective');}}><RotateCcw size={14}/></button></div>
    {hovered&&<div className="board-inspector"><small>GRUNDSTÜCK ANSEHEN</small><strong>{hovered.name}</strong><span>{hovered.price ? `$${hovered.price}` : hovered.description}</span></div>}
    <div className="board-caption">Miniaturstadt · {gameState.boardSize || 40} Felder <span> / Gebäude: Kulisse · Ausbau: grüne/rote Marker</span></div>
    {failed&&<div className="arena-diorama-error" role="status">3D ist auf diesem Gerät nicht verfügbar. Wähle oben die 2D-Ansicht.</div>}
  </section>;
}
