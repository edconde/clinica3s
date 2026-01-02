# Clinica3s Frontend

Frontend del sistema de gestión para clínicas dentales que permite administrar pacientes, citas, dentistas, servicios y especialidades. Interfaz moderna desarrollada con React y PrimeReact.

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn
- Backend de Clinica3s en ejecución (clinica3s-backend)

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/edconde/clinica3s.git
   cd clinica3s/clinica3s-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (opcional)
   
   Verifica que la URL del API en `src/api/api.js` apunte a tu backend.

## Ejecutar el Proyecto

### Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Compilar para Producción
```bash
npm run build
```

### Vista Previa de Producción
```bash
npm run preview
```

## Tecnologías Utilizadas

- React 19
- Vite
- PrimeReact (componentes UI)
- React Router DOM
- Axios
- Chart.js
- TailwindCSS
- date-fns
