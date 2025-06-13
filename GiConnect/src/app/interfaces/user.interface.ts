export interface User {
  _id: string;
  foto: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  dni: string;
  telefono: string;
  email: string;
  role: 'atleta' | 'instructor' | 'maestro' | 'admin';
  numIBJJF?: string;
  fechaInicio?: Date;
  cinturon?: string;
  grado?: number;
  fechaDesde?: Date;
  clasesAsistidas?: number;
  clasesImpartidas?: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
} 