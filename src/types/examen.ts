export interface Examen {
  id: string;
  nombre: string;
  alias: string[];
  precio_usd: number;
  acepta_cashea: boolean;
  condiciones: string;
  tiempo_entrega: string;
  incluye: string[];
  activo: boolean;
}

export interface InfoGeneral {
  clave: string;
  concepto: string;
  detalle: string;
}