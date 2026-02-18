import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/Invoices/InvoiceList';
import InvoiceDetail from './pages/Invoices/InvoiceDetail';
import InvoiceForm from './pages/Invoices/InvoiceForm';
import PayStubList from './pages/PayStubs/PayStubList';
import PayStubDetail from './pages/PayStubs/PayStubDetail';
import PayStubForm from './pages/PayStubs/PayStubForm';
import StatementList from './pages/Statements/StatementList';
import StatementGenerate from './pages/Statements/StatementGenerate';
import StatementDetail from './pages/Statements/StatementDetail';
import InterpreterList from './pages/People/InterpreterList';
import InterpreterDetail from './pages/People/InterpreterDetail';
import InterpreterForm from './pages/People/InterpreterForm';
import ClientList from './pages/People/ClientList';
import ClientDetail from './pages/People/ClientDetail';
import ClientForm from './pages/People/ClientForm';
import AssignmentList from './pages/Operations/AssignmentList';
import AssignmentDetail from './pages/Operations/AssignmentDetail';
import AssignmentForm from './pages/Operations/AssignmentForm';
import ClientPaymentList from './pages/Finance/ClientPaymentList';
import InterpreterPaymentList from './pages/Finance/InterpreterPaymentList';
import ExpenseList from './pages/Finance/ExpenseList';
import PayrollDocsList from './pages/Finance/PayrollDocsList';
import AssignmentCalendar from './pages/Operations/AssignmentCalendar';
import QuotesPage from './pages/Operations/QuotesPage';
import ContractsPage from './pages/People/ContractsPage';
import DocumentCenter from './pages/Communications/DocumentCenter';
import NotificationCenter from './pages/Communications/NotificationCenter';
import ContactMessageList from './pages/Communications/ContactMessageList';
import LoginPage from './pages/Login';

// Module placeholders (to be implemented)
const OperationsPage = () => (
  <Routes>
    <Route index element={<Navigate to="assignments" replace />} />
    <Route path="assignments" element={<AssignmentList />} />
    <Route path="assignments/calendar" element={<AssignmentCalendar />} />
    <Route path="assignments/new" element={<AssignmentForm />} />
    <Route path="assignments/:id" element={<AssignmentDetail />} />
    <Route path="assignments/:id/edit" element={<AssignmentForm />} />
    <Route path="quotes" element={<QuotesPage />} />
  </Routes>
);

const PeoplePage = () => (
  <Routes>
    <Route index element={<Navigate to="interpreters" replace />} />
    <Route path="interpreters" element={<InterpreterList />} />
    <Route path="interpreters/new" element={<InterpreterForm />} />
    <Route path="interpreters/:id" element={<InterpreterDetail />} />
    <Route path="interpreters/:id/edit" element={<InterpreterForm />} />
    <Route path="clients" element={<ClientList />} />
    <Route path="clients/new" element={<ClientForm />} />
    <Route path="clients/:id" element={<ClientDetail />} />
    <Route path="clients/:id/edit" element={<ClientForm />} />
    <Route path="contracts" element={<ContractsPage />} />
  </Routes>
);

const FinancePage = () => (
  <Routes>
    <Route index element={<Navigate to="client-payments" replace />} />
    <Route path="client-payments" element={<ClientPaymentList />} />
    <Route path="interpreter-payments" element={<InterpreterPaymentList />} />
    <Route path="expenses" element={<ExpenseList />} />
    <Route path="payroll" element={<PayrollDocsList />} />
  </Routes>
);

const InvoicesPage = () => (
  <Routes>
    <Route index element={<InvoiceList />} />
    <Route path="new" element={<InvoiceForm />} />
    <Route path=":id" element={<InvoiceDetail />} />
    <Route path=":id/edit" element={<InvoiceForm />} />
  </Routes>
);
const PayStubsPage = () => (
  <Routes>
    <Route index element={<PayStubList />} />
    <Route path="new" element={<PayStubForm />} />
    <Route path=":id" element={<PayStubDetail />} />
    <Route path=":id/edit" element={<PayStubForm />} />
  </Routes>
);
const StatementsPage = () => (
  <Routes>
    <Route index element={<StatementList />} />
    <Route path="generate" element={<StatementGenerate />} />
    <Route path=":id" element={<StatementDetail />} />
  </Routes>
);
const DocumentsPage = () => (
  <Routes>
    <Route index element={<DocumentCenter />} />
  </Routes>
);

const CommsPage = () => (
  <Routes>
    <Route index element={<Navigate to="notifications" replace />} />
    <Route path="notifications" element={<NotificationCenter />} />
    <Route path="messages" element={<ContactMessageList />} />
  </Routes>
);
const SettingsPage = () => <div className="p-8 text-2xl font-bold">Settings Module (Coming Soon)</div>;

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/operations/*" element={<OperationsPage />} />
            <Route path="/people/*" element={<PeoplePage />} />
            <Route path="/finance/*" element={<FinancePage />} />
            <Route path="/invoices/*" element={<InvoicesPage />} />
            <Route path="/pay-stubs/*" element={<PayStubsPage />} />
            <Route path="/statements/*" element={<StatementsPage />} />
            <Route path="/documents/*" element={<DocumentsPage />} />
            <Route path="/comms/*" element={<CommsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
