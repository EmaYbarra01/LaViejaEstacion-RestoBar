import { Outlet } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import EmployeePanelLayout from '../components/EmployeePanelLayout';

const AdminPage = ({ isNightMode, onToggleNightMode }) => {
  const { user } = useUserStore();

  return (
    <EmployeePanelLayout
      isNightMode={isNightMode}
      onToggleNightMode={onToggleNightMode}
      roleType="admin"
    >
      <Outlet context={{ role: user?.role }} />
    </EmployeePanelLayout>
  );
};

export default AdminPage;
