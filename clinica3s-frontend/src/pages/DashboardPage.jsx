import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import KpiCard from '../components/dashboard/KpiCard';
import { getDashboardStats } from '../services/reportService';
import { CHART_COLORS } from '../utils/constants';
import { formatCurrency, formatNumber } from '../utils/formatters';

// Generar opciones de años (desde 2025 hasta el año actual + 1)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [{ label: 'Todos los años', value: null }];
  for (let year = currentYear + 1; year >= 2025; year--) {
    years.push({ label: year.toString(), value: year });
  }
  return years;
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const yearOptions = generateYearOptions();
  const toast = useRef(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedYear]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats(selectedYear);
      setStats(data);
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      setError('No se pudieron cargar las estadísticas');
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las estadísticas',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Configuración del gráfico de barras (Ingresos por Dentista)
  const getRevenueByDentistData = () => {
    if (!stats?.dentistStats?.length) return null;

    return {
      labels: stats.dentistStats.map(d => d.dentistName),
      datasets: [
        {
          label: 'Ingresos',
          backgroundColor: CHART_COLORS.primary,
          data: stats.dentistStats.map(d => d.revenue)
        },
        {
          label: 'Comisión',
          backgroundColor: CHART_COLORS.success,
          data: stats.dentistStats.map(d => d.commission)
        }
      ]
    };
  };

  // Configuración del gráfico de líneas (Tendencia Mensual)
  const getMonthlyTrendData = () => {
    if (!stats?.monthlyStats?.length) return null;

    // Ordenar por mes cronológicamente
    const sortedStats = [...stats.monthlyStats].sort((a, b) => {
      const [yearA, monthA] = a.month.split('-').map(Number);
      const [yearB, monthB] = b.month.split('-').map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    });

    return {
      labels: sortedStats.map(m => m.month),
      datasets: [
        {
          label: 'Ingresos',
          data: sortedStats.map(m => m.revenue),
          fill: true,
          borderColor: CHART_COLORS.primary,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4
        },
        {
          label: 'Citas',
          data: sortedStats.map(m => m.appointments),
          fill: false,
          borderColor: CHART_COLORS.success,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Configuración del gráfico de dona (Distribución de Estados)
  const getStatusDistributionData = () => {
    if (!stats) return null;

    const completed = stats.completedAppointments || 0;
    const pending = stats.pendingAppointments || 0;
    const noShow = (stats.totalAppointments || 0) - completed - pending;

    return {
      labels: ['Completadas', 'Pendientes', 'No asistió'],
      datasets: [
        {
          data: [completed, pending, noShow > 0 ? noShow : 0],
          backgroundColor: [
            CHART_COLORS.success,
            CHART_COLORS.warning,
            CHART_COLORS.danger
          ],
          hoverBackgroundColor: [
            '#16a34a',
            '#d97706',
            '#dc2626'
          ]
        }
      ]
    };
  };

  // Opciones del gráfico de barras
  const barOptions = {
    plugins: {
      legend: {
        labels: { usePointStyle: true }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    },
    maintainAspectRatio: false
  };

  // Opciones del gráfico de líneas
  const lineOptions = {
    plugins: {
      legend: {
        labels: { usePointStyle: true }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          callback: (value) => formatCurrency(value),
          color: CHART_COLORS.primary
        },
        title: {
          color: CHART_COLORS.primary
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          color: CHART_COLORS.success
        },
        title: {
          color: CHART_COLORS.success
        }
      }
    },
    maintainAspectRatio: false
  };

  // Opciones del gráfico de dona
  const doughnutOptions = {
    plugins: {
      legend: {
        labels: { usePointStyle: true },
        position: 'bottom'
      }
    },
    maintainAspectRatio: false
  };

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Message severity="error" text={error} className="w-full mb-4" />
        <button onClick={loadDashboardData} className="p-button p-component">
          <span className="p-button-icon p-c pi pi-refresh"></span>
          <span className="p-button-label">Reintentar</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />

      {/* Header con filtro de año */}
      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 text-2xl font-semibold text-900">Dashboard</h2>
        <div className="flex align-items-center gap-2">
          <label htmlFor="year-filter" className="font-medium text-600">Año:</label>
          <Dropdown
            id="year-filter"
            value={selectedYear}
            options={yearOptions}
            onChange={(e) => setSelectedYear(e.value)}
            placeholder="Seleccionar año"
            className="w-10rem"
          />
        </div>
      </div>

      {/* KPI Cards - Primera fila: Pacientes y Citas */}
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <KpiCard
            title="Total Pacientes"
            value={formatNumber(stats?.totalPatients || 0)}
            icon="pi-users"
            color="primary"
            subtitle="Clientes registrados"
          />
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <KpiCard
            title="Total Citas"
            value={formatNumber(stats?.totalAppointments || 0)}
            icon="pi-calendar"
            color="info"
            subtitle={`${stats?.completedAppointments || 0} completadas`}
          />
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <KpiCard
            title="Citas Pendientes"
            value={formatNumber(stats?.pendingAppointments || 0)}
            icon="pi-clock"
            color="warning"
            subtitle="Citas futuras"
          />
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <KpiCard
            title="Sin Cobrar"
            value={formatNumber(stats?.unpaidAppointments || 0)}
            icon="pi-exclamation-circle"
            color="danger"
            subtitle="Atendidas sin pago"
          />
        </div>
      </div>

      {/* KPI Cards - Segunda fila: Finanzas */}
      <div className="grid mt-2">
        <div className="col-12 md:col-6 lg:col-3">
          <KpiCard
            title="Facturación Total"
            value={formatCurrency(stats?.totalInvoicing || 0)}
            icon="pi-money-bill"
            color="info"
            subtitle="Total cobrado"
          />
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <KpiCard
            title="Coste Total"
            value={formatCurrency(stats?.totalCost || 0)}
            icon="pi-chart-line"
            color="secondary"
            subtitle="Coste tratamientos"
          />
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <KpiCard
            title="Ganancia Neta"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon="pi-dollar"
            color="success"
            subtitle="Ingresos - Costes"
          />
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <KpiCard
            title="Pagos Pendientes"
            value={formatCurrency(stats?.pendingPayments || 0)}
            icon="pi-wallet"
            color="warning"
            subtitle="Por cobrar"
          />
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid mt-4">
        {/* Ingresos por Dentista */}
        <div className="col-12 lg:col-6">
          <Card title="Ingresos por Dentista" className="shadow-2">
            <div className="chart-container">
              {getRevenueByDentistData() ? (
                <Chart type="bar" data={getRevenueByDentistData()} options={barOptions} />
              ) : (
                <div className="flex align-items-center justify-content-center h-full text-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Distribución de Citas */}
        <div className="col-12 lg:col-6">
          <Card title="Estado de Citas" className="shadow-2">
            <div className="chart-container">
              {getStatusDistributionData() ? (
                <Chart type="doughnut" data={getStatusDistributionData()} options={doughnutOptions} />
              ) : (
                <div className="flex align-items-center justify-content-center h-full text-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Tendencia Mensual */}
        <div className="col-12">
          <Card title="Tendencia Mensual" className="shadow-2">
            <div className="chart-container">
              {getMonthlyTrendData() ? (
                <Chart type="line" data={getMonthlyTrendData()} options={lineOptions} />
              ) : (
                <div className="flex align-items-center justify-content-center h-full text-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
