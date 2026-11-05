import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { BoardTile } from '../types/game';
import { PROPERTY_COLORS } from './propertyModel';

/** Procedural miniature architecture: real geometry, no image stand-ins. */
export function createArchitecture(tile: BoardTile, level = 0): THREE.Group {
  const group = new THREE.Group();
  const hotel = level === 5;
  const facade = new THREE.MeshStandardMaterial({ color: hotel ? '#a64e3e' : (PROPERTY_COLORS[tile.color || 'brown'] || '#c9b999'), roughness: .72 });
  const stone = new THREE.MeshStandardMaterial({ color: '#eddec1', roughness: .85 });
  const roof = new THREE.MeshStandardMaterial({ color: '#3e6866', metalness: .32, roughness: .5 });
  const brass = new THREE.MeshStandardMaterial({ color: '#bfa36a', metalness: .75, roughness: .28 });
  const glass = new THREE.MeshStandardMaterial({ color: '#273e42', metalness: .45, roughness: .18 });
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) => {
    const object = new THREE.Mesh(geometry, material); object.position.set(x, y, z);
    object.castShadow = object.receiveShadow = true; group.add(object); return object;
  };
  const box = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) => mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z);
  const floors = hotel ? 4 : tile.type === 'railroad' ? 2 : 2 + tile.id % 3;
  const height = floors * .18;
  box(.83, .06, .65, stone, 0, .03, 0);
  box(.67, height, .47, facade, 0, .06 + height / 2, 0);
  // Limestone quoins, cornices and floor bands.
  for (const x of [-.32, .32]) for (const z of [-.22, .22]) box(.055, height, .055, stone, x, .06 + height / 2, z);
  for (let floor = 0; floor <= floors; floor++) box(.72, .027, .52, stone, 0, .07 + floor * .18, 0);
  for (let floor = 0; floor < floors; floor++) {
    for (const x of [-.21, 0, .21]) for (const z of [-.247, .247]) {
      box(.117, .126, .024, stone, x, .16 + floor * .18, z);
      box(.083, .096, .028, glass, x, .16 + floor * .18, z);
      box(.009, .096, .033, brass, x, .16 + floor * .18, z);
    }
    for (const x of [-.344, .344]) box(.025, .11, .15, glass, x, .16 + floor * .18, 0);
  }
  const cap = mesh(new THREE.CylinderGeometry(.19, .46, .23, 4), roof, 0, height + .185, 0); cap.rotation.y = Math.PI / 4;
  box(.09, .18, .09, stone, .23, height + .25, .08);
  box(.11, .025, .11, brass, .23, height + .35, .08);
  box(.14, .17, .035, brass, 0, .145, .265);
  box(.09, .14, .04, glass, 0, .13, .275);
  box(.26, .025, .13, stone, 0, .025, .31);
  // Alternate streets receive a turret; stations have a clock tower.
  if (tile.id % 3 === 0 || tile.type === 'railroad') {
    mesh(new THREE.CylinderGeometry(.12, .14, height + .2, 16), stone, -.25, (height + .2) / 2, 0);
    mesh(new THREE.ConeGeometry(.18, .25, 16), roof, -.25, height + .32, 0);
    mesh(new THREE.SphereGeometry(.027, 8, 8), brass, -.25, height + .46, 0);
    if (tile.type === 'railroad') {
      const clock = mesh(new THREE.CylinderGeometry(.085, .085, .02, 24), brass, -.25, height + .06, .14); clock.rotation.x = Math.PI / 2;
      box(.008, .055, .025, glass, -.25, height + .08, .16);
    }
  }
  if (hotel) { box(.4, .09, .035, brass, 0, height - .02, .275); }
  // Batch facade details by material to keep large boards affordable to render.
  group.updateMatrixWorld(true);
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  for (const child of [...group.children]) {
    if (!(child instanceof THREE.Mesh)) continue;
    const material = child.material as THREE.Material;
    child.geometry.applyMatrix4(child.matrixWorld);
    const geometries = batches.get(material) || []; geometries.push(child.geometry); batches.set(material, geometries);
  }
  group.clear();
  batches.forEach((geometries, material) => {
    const merged = mergeGeometries(geometries);
    geometries.forEach(geometry => geometry.dispose());
    if (merged) { const building = new THREE.Mesh(merged, material); building.castShadow = building.receiveShadow = true; group.add(building); }
  });
  return group;
}
