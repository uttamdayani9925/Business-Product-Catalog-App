export interface Product {
  id: string;
  name: string;
  category: 'Cotton' | 'Polyester';
  image: string;
  isNew?: boolean;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface Stat {
  label: string;
  value: string;
  icon: string;
}