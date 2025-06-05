export interface Suscripcion {
  _id: string;
  tipo: string;
  fechaInicio: Date;
  fechaFin: Date;
  precio: number;
  atleta: string;
  pagado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NuevaSuscripcion {
  tipo: string;
  fechaInicio: Date;
  fechaFin: Date;
  precio: number;
  atleta: string;
  pagado: boolean;
}

export interface TipoSuscripcion {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  meses: number;
  caracteristicas: string[];
} 