-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categorias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL UNIQUE,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.costos_envio (
  id bigint NOT NULL DEFAULT nextval('costos_envio_id_seq'::regclass),
  departamento_origen_id integer NOT NULL,
  departamento_destino_id integer NOT NULL,
  peso_min_kg numeric NOT NULL DEFAULT 0.0,
  peso_max_kg numeric NOT NULL DEFAULT 1.0,
  costo_base numeric NOT NULL,
  costo_por_kg_adicional numeric NOT NULL DEFAULT 0.0,
  tiempo_entrega_dias integer NOT NULL DEFAULT 3 CHECK (tiempo_entrega_dias > 0),
  tipo_servicio character varying NOT NULL DEFAULT 'terrestre'::character varying CHECK (tipo_servicio::text = ANY (ARRAY['terrestre'::character varying::text, 'aereo'::character varying::text, 'express'::character varying::text])),
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT costos_envio_pkey PRIMARY KEY (id),
  CONSTRAINT costos_envio_departamento_destino_id_fkey FOREIGN KEY (departamento_destino_id) REFERENCES public.departamentos(id),
  CONSTRAINT costos_envio_departamento_origen_id_fkey FOREIGN KEY (departamento_origen_id) REFERENCES public.departamentos(id)
);
CREATE TABLE public.departamentos (
  id integer NOT NULL DEFAULT nextval('departamentos_id_seq'::regclass),
  nombre text NOT NULL UNIQUE,
  centroid jsonb,
  CONSTRAINT departamentos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.movimientos_stock (
  id bigint NOT NULL DEFAULT nextval('movimientos_stock_id_seq'::regclass),
  id_producto bigint NOT NULL,
  tipo_movimiento character varying NOT NULL CHECK (tipo_movimiento::text = ANY (ARRAY['entrada'::character varying::text, 'salida'::character varying::text, 'ajuste'::character varying::text])),
  cantidad integer NOT NULL,
  stock_anterior integer NOT NULL,
  stock_nuevo integer NOT NULL,
  razon text NOT NULL,
  id_usuario bigint NOT NULL,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT movimientos_stock_pkey PRIMARY KEY (id),
  CONSTRAINT movimientos_stock_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id)
);
CREATE TABLE public.productos (
  id bigint NOT NULL DEFAULT nextval('productos_id_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  categoria character varying NOT NULL,
  url_imagen text,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  stock_bajo integer DEFAULT 0,
  stock_eficiente integer DEFAULT 0,
  stock_recomendado integer DEFAULT 0,
  extra_imagenes_urls ARRAY,
  categoria_id bigint,
  es_destacado boolean DEFAULT false,
  es_mas_pedido boolean DEFAULT false,
  activo boolean NOT NULL DEFAULT true,
  precio_sin_igv numeric,
  precio_con_igv numeric,
  igv_porcentaje numeric DEFAULT 18.00,
  precio_costo numeric,
  margen_ganancia numeric,
  precio_mayorista numeric,
  precio_minorista numeric,
  moneda character varying DEFAULT 'PEN'::character varying,
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);
CREATE TABLE public.provincias (
  id integer NOT NULL DEFAULT nextval('provincias_id_seq'::regclass),
  nombre text NOT NULL,
  departamento_id integer NOT NULL,
  CONSTRAINT provincias_pkey PRIMARY KEY (id),
  CONSTRAINT provincias_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id)
);
CREATE TABLE public.solicitud_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  solicitud_id uuid NOT NULL,
  producto_id bigint NOT NULL,
  cantidad_solicitada integer NOT NULL,
  cantidad_aprobada integer,
  CONSTRAINT solicitud_items_pkey PRIMARY KEY (id),
  CONSTRAINT solicitud_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT solicitud_items_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id)
);
CREATE TABLE public.solicitudes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  solicitante_id uuid NOT NULL,
  sucursal_id uuid NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  observaciones text,
  CONSTRAINT solicitudes_pkey PRIMARY KEY (id),
  CONSTRAINT solicitudes_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id),
  CONSTRAINT solicitudes_solicitante_id_fkey FOREIGN KEY (solicitante_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.solicitudes_stock (
  id bigint NOT NULL DEFAULT nextval('solicitudes_stock_id_seq'::regclass),
  id_empleado uuid NOT NULL,
  id_producto bigint NOT NULL,
  cantidad_solicitada integer NOT NULL,
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying::text, 'aprobada'::character varying::text, 'rechazada'::character varying::text, 'cumplida'::character varying::text])),
  notas text,
  solicitado_en timestamp with time zone DEFAULT now(),
  revisado_en timestamp with time zone,
  revisado_por bigint,
  CONSTRAINT solicitudes_stock_pkey PRIMARY KEY (id),
  CONSTRAINT solicitudes_stock_id_empleado_fkey FOREIGN KEY (id_empleado) REFERENCES public.usuarios(id),
  CONSTRAINT solicitudes_stock_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id)
);
CREATE TABLE public.stock (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sucursal_id uuid NOT NULL,
  producto_id bigint NOT NULL,
  cantidad integer NOT NULL DEFAULT 0,
  estado USER-DEFINED NOT NULL DEFAULT 'normal'::stock_estado,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stock_pkey PRIMARY KEY (id),
  CONSTRAINT stock_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id),
  CONSTRAINT stock_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.stock_sucursales (
  id integer NOT NULL DEFAULT nextval('stock_sucursales_id_seq'::regclass),
  sucursal_id uuid,
  producto_id bigint,
  cantidad_actual integer NOT NULL DEFAULT 0,
  stock_minimo integer NOT NULL DEFAULT 10,
  stock_maximo integer NOT NULL DEFAULT 100,
  ultima_actualizacion timestamp with time zone DEFAULT now(),
  CONSTRAINT stock_sucursales_pkey PRIMARY KEY (id),
  CONSTRAINT stock_sucursales_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id),
  CONSTRAINT stock_sucursales_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.sucursales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  provincia_id integer NOT NULL,
  direccion text,
  creado_en timestamp with time zone DEFAULT now(),
  estado text NOT NULL DEFAULT 'activa'::text,
  latitud numeric,
  longitud numeric,
  CONSTRAINT sucursales_pkey PRIMARY KEY (id),
  CONSTRAINT sucursales_provincia_id_fkey FOREIGN KEY (provincia_id) REFERENCES public.provincias(id)
);
CREATE TABLE public.usuarios (
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  rol character varying NOT NULL CHECK (rol::text = ANY (ARRAY['admin'::character varying::text, 'empleado'::character varying::text])),
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  sucursal_id uuid,
  nombre text,
  apellido text,
  celular character varying,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT usuarios_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id)
);
CREATE TABLE public.usuarios_backup (
  id bigint,
  nombre_usuario character varying,
  email character varying,
  hash_contrasena character varying,
  rol character varying,
  nombre_completo character varying,
  departamento character varying,
  provincia character varying,
  creado_en timestamp with time zone,
  actualizado_en timestamp with time zone
);