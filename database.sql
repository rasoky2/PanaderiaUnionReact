-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.agencias_envio (
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tiempo_entrega_dias integer DEFAULT 3,
  costo_base numeric DEFAULT 0.00,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT agencias_envio_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categorias (
  nombre text NOT NULL UNIQUE,
  creado_en timestamp with time zone DEFAULT now(),
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clientes (
  dni character varying UNIQUE,
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  nombre text NOT NULL,
  apellido text NOT NULL,
  celular character varying,
  direccion text,
  departamento_id integer,
  provincia_id integer,
  fecha_nacimiento date,
  genero character varying CHECK (genero::text = ANY (ARRAY['masculino'::character varying, 'femenino'::character varying, 'otro'::character varying]::text[])),
  ultimo_acceso timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activo boolean NOT NULL DEFAULT true,
  email_verificado boolean NOT NULL DEFAULT false,
  fecha_registro timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ruc character varying,
  CONSTRAINT clientes_pkey PRIMARY KEY (id),
  CONSTRAINT clientes_provincia_id_fkey FOREIGN KEY (provincia_id) REFERENCES public.provincias(id),
  CONSTRAINT clientes_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id)
);
CREATE TABLE public.costos_envio (
  departamento_origen_id integer NOT NULL,
  departamento_destino_id integer NOT NULL,
  costo_base numeric NOT NULL,
  peso_min_kg numeric NOT NULL DEFAULT 0.0,
  peso_max_kg numeric NOT NULL DEFAULT 1.0,
  costo_por_kg_adicional numeric NOT NULL DEFAULT 0.0,
  tiempo_entrega_dias integer NOT NULL DEFAULT 3 CHECK (tiempo_entrega_dias > 0),
  tipo_servicio character varying NOT NULL DEFAULT 'terrestre'::character varying CHECK (tipo_servicio::text = ANY (ARRAY['terrestre'::character varying::text, 'aereo'::character varying::text, 'express'::character varying::text])),
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  id bigint NOT NULL DEFAULT nextval('costos_envio_id_seq'::regclass),
  CONSTRAINT costos_envio_pkey PRIMARY KEY (id),
  CONSTRAINT costos_envio_departamento_destino_id_fkey FOREIGN KEY (departamento_destino_id) REFERENCES public.departamentos(id),
  CONSTRAINT costos_envio_departamento_origen_id_fkey FOREIGN KEY (departamento_origen_id) REFERENCES public.departamentos(id)
);
CREATE TABLE public.departamentos (
  nombre text NOT NULL UNIQUE,
  centroid jsonb,
  id integer NOT NULL DEFAULT nextval('departamentos_id_seq'::regclass),
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
CREATE TABLE public.pedido_items (
  pedido_id uuid,
  producto_id bigint,
  cantidad integer NOT NULL,
  precio_unitario numeric NOT NULL,
  subtotal numeric NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pedido_items_pkey PRIMARY KEY (id),
  CONSTRAINT pedido_items_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id),
  CONSTRAINT pedido_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.pedidos (
  cliente_id uuid,
  sucursal_id uuid,
  agencia_envio_id uuid,
  numero_tracking character varying UNIQUE,
  subtotal numeric NOT NULL,
  total numeric NOT NULL,
  metodo_pago character varying NOT NULL,
  direccion_entrega text NOT NULL,
  notas text,
  fecha_entrega_estimada date,
  fecha_entrega_real timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  estado character varying DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'confirmado'::character varying, 'preparando'::character varying, 'enviado'::character varying, 'en_transito'::character varying, 'entregado'::character varying, 'cancelado'::character varying]::text[])),
  costo_envio numeric DEFAULT 0.00,
  fecha_pedido timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pedidos_pkey PRIMARY KEY (id),
  CONSTRAINT pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT pedidos_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id),
  CONSTRAINT pedidos_agencia_envio_id_fkey FOREIGN KEY (agencia_envio_id) REFERENCES public.agencias_envio(id)
);
CREATE TABLE public.productos (
  nombre character varying NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  categoria character varying NOT NULL,
  url_imagen text,
  categoria_id bigint,
  precio_sin_igv numeric,
  precio_con_igv numeric,
  precio_costo numeric,
  margen_ganancia numeric,
  precio_mayorista numeric,
  precio_minorista numeric,
  creado_en timestamp with time zone DEFAULT now(),
  id bigint NOT NULL DEFAULT nextval('productos_id_seq'::regclass),
  extra_imagenes_urls ARRAY,
  actualizado_en timestamp with time zone DEFAULT now(),
  stock_bajo integer DEFAULT 0,
  stock_eficiente integer DEFAULT 0,
  stock_recomendado integer DEFAULT 0,
  es_destacado boolean DEFAULT false,
  es_mas_pedido boolean DEFAULT false,
  activo boolean NOT NULL DEFAULT true,
  igv_porcentaje numeric DEFAULT 18.00,
  moneda character varying DEFAULT 'PEN'::character varying,
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);
CREATE TABLE public.provincias (
  nombre text NOT NULL,
  departamento_id integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('provincias_id_seq'::regclass),
  CONSTRAINT provincias_pkey PRIMARY KEY (id),
  CONSTRAINT provincias_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id)
);
CREATE TABLE public.seguimiento_pedido (
  pedido_id uuid,
  estado character varying NOT NULL,
  descripcion text,
  ubicacion character varying,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha_evento timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT seguimiento_pedido_pkey PRIMARY KEY (id),
  CONSTRAINT seguimiento_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id)
);
CREATE TABLE public.solicitud_items (
  solicitud_id uuid NOT NULL,
  producto_id bigint NOT NULL,
  cantidad_solicitada integer NOT NULL,
  cantidad_aprobada integer,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  CONSTRAINT solicitud_items_pkey PRIMARY KEY (id),
  CONSTRAINT solicitud_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT solicitud_items_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id)
);
CREATE TABLE public.solicitudes (
  solicitante_id uuid NOT NULL,
  sucursal_id uuid NOT NULL,
  observaciones text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  estado text NOT NULL DEFAULT 'pendiente'::text,
  CONSTRAINT solicitudes_pkey PRIMARY KEY (id),
  CONSTRAINT solicitudes_solicitante_id_fkey FOREIGN KEY (solicitante_id) REFERENCES public.usuarios(id),
  CONSTRAINT solicitudes_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id)
);
CREATE TABLE public.solicitudes_stock (
  id_empleado uuid NOT NULL,
  id_producto bigint NOT NULL,
  cantidad_solicitada integer NOT NULL,
  notas text,
  revisado_en timestamp with time zone,
  revisado_por bigint,
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying::text, 'aprobada'::character varying::text, 'rechazada'::character varying::text, 'cumplida'::character varying::text])),
  solicitado_en timestamp with time zone DEFAULT now(),
  id bigint NOT NULL DEFAULT nextval('solicitudes_stock_id_seq'::regclass),
  CONSTRAINT solicitudes_stock_pkey PRIMARY KEY (id),
  CONSTRAINT solicitudes_stock_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id),
  CONSTRAINT solicitudes_stock_id_empleado_fkey FOREIGN KEY (id_empleado) REFERENCES public.usuarios(id)
);
CREATE TABLE public.stock (
  sucursal_id uuid NOT NULL,
  producto_id bigint NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cantidad integer NOT NULL DEFAULT 0,
  estado USER-DEFINED NOT NULL DEFAULT 'normal'::stock_estado,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stock_pkey PRIMARY KEY (id),
  CONSTRAINT stock_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id),
  CONSTRAINT stock_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.stock_sucursales (
  sucursal_id uuid,
  producto_id bigint,
  cantidad_actual integer NOT NULL DEFAULT 0,
  stock_minimo integer NOT NULL DEFAULT 10,
  stock_maximo integer NOT NULL DEFAULT 100,
  ultima_actualizacion timestamp with time zone DEFAULT now(),
  id integer NOT NULL DEFAULT nextval('stock_sucursales_id_seq'::regclass),
  CONSTRAINT stock_sucursales_pkey PRIMARY KEY (id),
  CONSTRAINT stock_sucursales_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT stock_sucursales_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id)
);
CREATE TABLE public.sucursales (
  nombre text NOT NULL,
  provincia_id integer NOT NULL,
  direccion text,
  latitud numeric,
  longitud numeric,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creado_en timestamp with time zone DEFAULT now(),
  estado text NOT NULL DEFAULT 'activa'::text,
  CONSTRAINT sucursales_pkey PRIMARY KEY (id),
  CONSTRAINT sucursales_provincia_id_fkey FOREIGN KEY (provincia_id) REFERENCES public.provincias(id)
);
CREATE TABLE public.usuarios (
  sucursal_id uuid,
  celular character varying,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  rol character varying NOT NULL CHECK (rol::text = ANY (ARRAY['admin'::character varying::text, 'empleado'::character varying::text])),
  nombre text,
  apellido text,
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id),
  CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
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