import React from 'react';
import { AVAILABLE_TOKENS } from '../data/monopolyBoard';

const labels = ['Zylinder', 'Auto', 'Schiff', 'Hund', 'Stiefel', 'Katze', 'Flugzeug', 'Dinosaurier', 'Einhorn', 'Rakete', 'Drache', 'Anker', 'Gitarre', 'Löwe', 'Pinguin', 'Kleeblatt', 'Stern', 'Pokal', 'Schildkröte', 'Fuchs'];
export function tokenLabel(token: string) {
  return labels[AVAILABLE_TOKENS.indexOf(token as typeof AVAILABLE_TOKENS[number])] || 'Spielfigur';
}
export function tokenImage(token: string) {
  const index = AVAILABLE_TOKENS.indexOf(token as typeof AVAILABLE_TOKENS[number]);
  return `/assets/tokens/token-${Math.max(0, index)}.svg`;
}
export function TokenArt({ token, className = '' }: { token?: string; className?: string }) {
  return <img className={`arena-token-art ${className}`} src={tokenImage(token || '')} alt={tokenLabel(token || '')} draggable={false} width={36} height={36} />;
}
