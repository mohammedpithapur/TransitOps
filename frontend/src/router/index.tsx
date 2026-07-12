import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { VehiclesPage } from '../pages/vehicles/VehiclesPage';
import { DriversPage } from '../pages/drivers/DriversPage';
import { TripsPage } from '../pages/trips/TripsPage';
import { MaintenancePage } from '../pages/maintenance/MaintenancePage';
import { FuelPage } from '../pages/fuel/FuelPage';
import { ReportsPage } from '../pages/reports/ReportsPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'vehicles', element: <VehiclesPage /> },
      { path: 'drivers', element: <DriversPage /> },
      { path: 'trips', element: <TripsPage /> },
      { path: 'maintenance', element: <MaintenancePage /> },
      { path: 'fuel', element: <FuelPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
