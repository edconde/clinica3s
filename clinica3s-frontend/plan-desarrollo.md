# Plan de Desarrollo Frontend: Clínica Odontológica (React + Vite + PrimeReact)

Este documento sirve como guía paso a paso para que una IA genere el código del cliente web utilizando la suite de componentes PrimeReact.

## 🛠️ Paso 0: Stack Tecnológico e Inicialización

**Instrucción para el IDE:**

"Inicializa un proyecto React con Vite.

**Stack Tecnológico requerido:**

- **Framework:** React 18+ (Javascript o Typescript).
- **UI Library (Core):** primereact y primeicons.
  - **Importante:** Configurar el tema (ej: lara-light-indigo o saga-blue) y los estilos base en main.jsx (primereact/resources/themes/..., primereact/resources/primereact.min.css, primeicons/primeicons.css).
  - Instalar primeflex para sistema de rejilla y utilidades CSS (opcional pero recomendado junto a PrimeReact).
- **Routing:** react-router-dom (v6+).
- **HTTP Client:** axios.
- **Gráficas:** Usar el componente Chart de PrimeReact (que usa chart.js por debajo). Instalar chart.js.
- **Fechas:** date-fns (para manipulación lógica) + Componente `<Calendar>` de PrimeReact.
- **Estilos adicionales:** Tailwind CSS (opcional, para márgenes/paddings específicos si no usas PrimeFlex)."

## 🔐 Paso 1: Infraestructura de Autenticación (Auth & Axios)

**Instrucción para el IDE:**

"Implementa el núcleo de seguridad y comunicación:

**Axios Instance (api.js):**
- Configuración estándar con baseURL.
- Interceptores para inyectar Token JWT y manejar errores 401/403.

**AuthContext (AuthProvider.jsx):**
- Estado global: user, token, isAuthenticated.
- Usar el componente `<Toast>` de PrimeReact para mostrar errores de login o éxito.
- Funciones login y logout.

**Rutas Protegidas:**
- Componente wrapper estándar para react-router-dom."

## 🎨 Paso 2: Layout y Navegación (PrimeReact Components)

**Instrucción para el IDE:**

"Crea la estructura visual usando componentes de PrimeReact:

**Layout Principal:**
- Usar componente `<Menubar>` para la navegación superior o una combinación de `<Sidebar>` + `<Button>` para menú lateral.
- El modelo del menú (items) debe generarse dinámicamente según el rol del usuario (ADMIN vs DENTIST).

**Página Login:**
- Usar componente `<Card>` para centrar el formulario.
- Usar `<InputText>`, `<Password>` (con feedback visual desactivado si se prefiere) y `<Button>`."

## 📊 Paso 3: Dashboard de BI

**Instrucción para el IDE:**

"Implementa el Dashboard usando los componentes de visualización de PrimeReact:

**KPI Cards:**
- Usar componentes `<Card>` simples con iconos grandes (pi pi-dollar, pi pi-calendar).

**Gráficas:**
- Ingresos por Dentista: `<Chart type="bar" data={...} options={...} />`.
- Tendencia de Citas: `<Chart type="line" data={...} />`.
- Top Servicios: `<Chart type="doughnut" data={...} />`.

**Nota:** Los datos deben venir del backend y mapearse al formato que exige Chart.js (labels, datasets)."

## 📅 Paso 4: Gestión de Citas (DataTable Avanzado)

**Instrucción para el IDE:**

"Esta es la vista clave. Usa el componente `<DataTable>` de PrimeReact, que es muy potente.

**Tabla de Citas:**
- `<DataTable value={appointments} paginator rows={10} ...>`
- **Columnas:** Fecha, Paciente, Dentista, Importe.
- **Columna Estado:** Usar `<Tag>` para mostrar el estado con colores (Verde='COMPLETED', Naranja='PENDING', Rojo='NO_SHOW').
- **Filtros:** Usar las capacidades de filtrado nativas de PrimeReact o inputs externos `<Calendar>` (rango fechas) y `<Dropdown>` (dentista) que recarguen los datos.

**Acciones:**
- Columna con `<Button icon="pi pi-search">` para ver detalles.
- Columna con `<Button icon="pi pi-wallet">` para pagar (visible solo si hay deuda)."

## 📝 Paso 5: Formulario de Nueva Cita (Wizard o Dialog)

**Instrucción para el IDE:**

"Formulario complejo para crear citas.

**Estructura:**
- Usar `<Card>` o `<Dialog>` (modal) si se prefiere abrir desde la lista.

**Campos Cabecera:**
- **Paciente:** `<AutoComplete>` (busca pacientes mientras escribes) o `<Dropdown>` con filtro.
- **Dentista:** `<Dropdown>`.
- **Fecha:** `<Calendar showTime hourFormat="24">`.

**Detalle (Servicios):**
- Botón 'Añadir Servicio' abre un pequeño `<Dialog>` o añade una fila a una tabla editable.
- Lista de servicios seleccionados: `<DataTable>` pequeño.
- Input de cantidad: `<InputNumber showButtons min={1}>`.

**Resumen:**
- Mostrar total calculado en tiempo real.
- Botón `<Button label="Guardar" icon="pi pi-save" />`."

## ⚙️ Paso 6: CRUDs de Administración

**Instrucción para el IDE:**

"Implementa la gestión de Doctores y Pacientes usando el patrón clásico de PrimeReact:

**Vista Principal:**
- `<Toolbar>` (con botón Nuevo) + `<DataTable>`.

**Formulario de Edición:**
- Usar `<Dialog>` modal que contiene el formulario.

**Gestión de Dentistas:**
- Para asignar especialidades, usar `<MultiSelect>` (permite seleccionar varias especialidades de una lista desplegable con checkboxes).
- Al guardar, mostrar notificación con `<Toast>`."