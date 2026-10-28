import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { ToastContainer } from './components/layout/ToastContainer.tsx';
import { LiveSimulatorModal } from './components/modals/LiveSimulatorModal.tsx';

// 15 Functional Views
import { OverviewView } from './components/views/OverviewView.tsx';
import { InboxView } from './components/views/InboxView.tsx';
import { AiAgentConfigView } from './components/views/AiAgentConfigView.tsx';
import { FacebookPagesView } from './components/views/FacebookPagesView.tsx';
import { ProductsView } from './components/views/ProductsView.tsx';
import { OrdersView } from './components/views/OrdersView.tsx';
import { CustomersView } from './components/views/CustomersView.tsx';
import { AutomationRulesView } from './components/views/AutomationRulesView.tsx';
import { KnowledgeBaseView } from './components/views/KnowledgeBaseView.tsx';
import { CommentsAutomationView } from './components/views/CommentsAutomationView.tsx';
import { AnalyticsView } from './components/views/AnalyticsView.tsx';
import { TeamView } from './components/views/TeamView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { SubscriptionView } from './components/views/SubscriptionView.tsx';
import { HelpDocsView } from './components/views/HelpDocsView.tsx';

const MainContent: React.FC = () => {
  const { activeNav } = useApp();

  const renderView = () => {
    switch (activeNav) {
      case 'overview':
        return <OverviewView />;
      case 'inbox':
        return <InboxView />;
      case 'ai-agent':
        return <AiAgentConfigView />;
      case 'facebook-pages':
        return <FacebookPagesView />;
      case 'products':
        return <ProductsView />;
      case 'orders':
        return <OrdersView />;
      case 'customers':
        return <CustomersView />;
      case 'automation-rules':
        return <AutomationRulesView />;
      case 'knowledge-base':
        return <KnowledgeBaseView />;
      case 'comments-automation':
        return <CommentsAutomationView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      case 'subscription':
        return <SubscriptionView />;
      case 'help-docs':
        return <HelpDocsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderView()}
        </main>
      </div>
      <LiveSimulatorModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
