export interface TipoSuscripcion {
  id: string;
  nombre: string;
  precio: number;
  meses: number;
}

export const TIPOS_SUSCRIPCION: TipoSuscripcion[] = [
  {
    id: 'mensual',
    nombre: 'Mensual',
    precio: 50.00,
    meses: 1
  },
  {
    id: 'trimestral',
    nombre: 'Trimestral',
    precio: 125.00,
    meses: 3
  },
  {
    id: 'semestral',
    nombre: 'Semestral',
    precio: 255.00,
    meses: 6
  },
  {
    id: 'anual',
    nombre: 'Anual',
    precio: 510.00,
    meses: 12
  }
]; 