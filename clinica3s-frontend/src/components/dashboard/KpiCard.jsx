import { Card } from 'primereact/card';

/**
 * Componente de tarjeta KPI para el dashboard
 * @param {Object} props
 * @param {string} props.title - Título del KPI
 * @param {string|number} props.value - Valor a mostrar
 * @param {string} props.icon - Clase de icono PrimeIcons (ej: 'pi-users')
 * @param {string} props.color - Color del tema (primary, success, warning, danger, info)
 * @param {string} [props.subtitle] - Texto secundario opcional
 * @param {string} [props.trend] - Tendencia opcional (ej: '+5%')
 * @param {string} [props.trendType] - Tipo de tendencia (up, down)
 */
const KpiCard = ({ title, value, icon, color = 'primary', subtitle, trend, trendType }) => {
  const colorClasses = {
    primary: 'text-indigo-500 bg-indigo-100',
    success: 'text-green-500 bg-green-100',
    warning: 'text-orange-500 bg-orange-100',
    danger: 'text-red-500 bg-red-100',
    info: 'text-blue-500 bg-blue-100'
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500'
  };

  const trendIcons = {
    up: 'pi-arrow-up',
    down: 'pi-arrow-down'
  };

  return (
    <Card className={`kpi-card ${color} hover-lift shadow-2`}>
      <div className="flex align-items-center justify-content-between">
        <div>
          <span className="block text-500 font-medium mb-2">{title}</span>
          <div className="flex align-items-center">
            <span className="text-900 font-bold text-3xl">{value}</span>
            {trend && (
              <span className={`ml-2 flex align-items-center text-sm font-medium ${trendColors[trendType] || 'text-500'}`}>
                <i className={`pi ${trendIcons[trendType] || ''} text-xs mr-1`}></i>
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="block text-500 text-sm mt-1">{subtitle}</span>
          )}
        </div>
        <div className={`flex align-items-center justify-content-center border-round p-3 ${colorClasses[color]}`}>
          <i className={`pi ${icon} text-2xl`}></i>
        </div>
      </div>
    </Card>
  );
};

export default KpiCard;
