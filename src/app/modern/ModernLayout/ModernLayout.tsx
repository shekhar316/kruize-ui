import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Page,
  Masthead,
  MastheadToggle,
  MastheadMain,
  MastheadBrand,
  MastheadContent,
  PageSidebar,
  PageSidebarBody,
  Nav,
  NavList,
  NavItem,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { routes, IAppRoute } from '@app/routes';
import KruizeLogo from '!!url-loader!@app/Assets/images/kruize_icon.png';
import './ModernLayout.css';

interface ModernLayoutProps {
  children: React.ReactNode;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();

  const onSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const headerToolbar = (
    <Toolbar id="modern-toolbar" isFullHeight isStatic>
      <ToolbarContent>
        <ToolbarItem>
          <div className="modern-header-info">
            <span className="modern-version">v2.0</span>
          </div>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const Header = (
    <Masthead className="modern-masthead">
      <MastheadToggle>
        <PageToggleButton
          variant="plain"
          aria-label="Global navigation"
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={onSidebarToggle}
        >
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand>
          <div className="modern-brand">
            <img src={KruizeLogo} alt="Kruize Logo" width="40" height="40" />
            <span className="modern-brand-text">Kruize</span>
          </div>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>{headerToolbar}</MastheadContent>
    </Masthead>
  );

  const Navigation = (
    <Nav className="modern-nav">
      <NavList>
        {routes.map((route, idx) => {
          const appRoute = route as IAppRoute;
          if (appRoute.label && appRoute.menu) {
            return (
              <NavItem key={`nav-${idx}`} isActive={appRoute.path === location.pathname}>
                <NavLink to={appRoute.path} className="modern-nav-link">
                  {appRoute.label}
                </NavLink>
              </NavItem>
            );
          }
          return null;
        })}
      </NavList>
    </Nav>
  );

  const Sidebar = (
    <PageSidebar className="modern-sidebar" isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody>{Navigation}</PageSidebarBody>
    </PageSidebar>
  );

  return (
    <Page header={Header} sidebar={Sidebar} className="modern-page">
      {children}
    </Page>
  );
};

export { ModernLayout };

// Made with Bob
