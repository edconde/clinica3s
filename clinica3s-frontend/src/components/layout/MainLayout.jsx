import { Avatar } from 'primereact/avatar';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Ripple } from 'primereact/ripple';
import { Sidebar } from 'primereact/sidebar';
import { useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MENU_ITEMS } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';

const MainLayout = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener items de menú según el rol del usuario
  const menuItems = user ? MENU_ITEMS[user.role] || [] : [];

  // Mapa de rutas para el breadcrumb
  const routeLabels = {
    '/': 'Inicio',
    '/dashboard': 'Finanzas',
    '/appointments': 'Citas',
    '/appointments/new': 'Nueva Cita',
    '/patients': 'Pacientes',
    '/dentists': 'Dentistas',
    '/services': 'Servicios',
    '/specialties': 'Especialidades',
    '/users': 'Usuarios',
    '/profile': 'Mi Perfil'
  };

  // Generar items del breadcrumb según la ruta actual
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return []; // Estamos en inicio, no mostrar nada más que el home
    }

    const items = [];
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      if (index === pathSegments.length - 1) {
        // Último segmento, no es clicable
        items.push({ label });
      } else {
        // Segmentos intermedios, son clicables
        const path = currentPath;
        items.push({ 
          label, 
          command: () => navigate(path)
        });
      }
    });

    return items;
  };

  // Menú de usuario
  const userMenuItems = [
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      command: () => navigate('/profile')
    },
    { separator: true },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => {
        logout();
        navigate('/login');
      }
    }
  ];

  // Renderizar item de menú
  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.to;
    
    return (
      <li key={item.to}>
        <a
          className="p-ripple flex align-items-center cursor-pointer p-3 border-round transition-duration-150 transition-colors w-full"
          style={{
            backgroundColor: isActive ? '#6366f1' : 'transparent',
            color: isActive ? '#ffffff' : '#4b5563',
            fontWeight: isActive ? '600' : '500'
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          onClick={() => {
            navigate(item.to);
            setSidebarVisible(false);
          }}
        >
          <i className={`${item.icon} mr-3 text-xl`}></i>
          <span>{item.label}</span>
          <Ripple />
        </a>
      </li>
    );
  };

  // Contenido del sidebar - renderizado como JSX directo
  const sidebarContent = (
    <div className="flex flex-column h-full surface-ground">
      {/* Logo */}
      <div className="flex align-items-center justify-content-center py-4">
        <div className="flex align-items-center">
          <img src="/assets/img/dientes-white-background.png" alt="Logo" style={{ height: '32px' }} className="mr-2" />
          <span className="text-xl font-bold" style={{ color: '#1f2937' }}>Clínica 3S</span>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-grow-1 overflow-y-auto py-3 px-3">
        <ul className="list-none p-0 m-0">
          {menuItems.map(renderMenuItem)}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="p-3 mt-auto">
        <div className="flex align-items-center p-2 border-round" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
          <Avatar 
            label={getInitials(user?.username || '')} 
            className="mr-2"
            shape="circle"
            style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
          />
          <div className="flex-grow-1">
            <div className="font-medium text-sm" style={{ color: '#1f2937' }}>{user?.username}</div>
            <div className="text-xs" style={{ color: '#6b7280' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="layout-wrapper">
      {/* Sidebar para móvil - PrimeReact Sidebar component */}
      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        className="layout-sidebar-mobile"
        modal
        showCloseIcon
      >
        {sidebarContent}
      </Sidebar>

      {/* Sidebar fijo para desktop */}
      <aside className="layout-sidebar">
        {sidebarContent}
      </aside>

      {/* Contenedor principal */}
      <div className="layout-main">
        {/* Header */}
        <header className="layout-header">
          {/* Botón menú móvil */}
          <Button
            icon="pi pi-bars"
            className="layout-menu-button p-button-text p-button-rounded"
            onClick={() => setSidebarVisible(true)}
          />

          {/* Breadcrumb */}
          <div className="layout-header-title flex-grow-1">
            <BreadCrumb 
              model={getBreadcrumbItems()} 
              home={{ icon: 'pi pi-home mr-2', label: 'Inicio', command: () => navigate('/') }}
              className="border-none surface-ground p-0"
            />
          </div>

          {/* Acciones del header */}
          <div className="flex align-items-center gap-2">
            {/* Menú de usuario */}
            <Menu model={userMenuItems} popup ref={userMenuRef} />
            <Button
              className="p-button-text p-button-rounded flex align-items-center gap-2"
              onClick={(e) => userMenuRef.current?.toggle(e)}
            >
              <Avatar 
                label={getInitials(user?.username || '')} 
                shape="circle"
                size="normal"
                style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
              />
              <span className="layout-user-name font-medium" style={{ color: '#1f2937' }}>{user?.username}</span>
              <i className="pi pi-chevron-down text-sm" style={{ color: '#6b7280' }}></i>
            </Button>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
