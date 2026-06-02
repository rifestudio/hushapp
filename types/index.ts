export interface Partner {
  id: string;
  name: string;
  personality: string;
  interestLevel: number;
  interestLabel: 'Stranger' | 'Familiar' | 'Friend' | 'Deeply Related';
  portraitUrl: string;
  lastInteraction: Date;
}

export interface User {
  name: string;
  avatarUrl: string;
  plan: 'free' | 'premium';
  enthusiasmBalance: number;
}
