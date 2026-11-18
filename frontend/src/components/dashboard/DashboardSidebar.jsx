import StudioTabIcon from '../atelier/StudioTabIcon.jsx';
import Brand from '../atelier/Brand.jsx';
import { Link } from 'react-router-dom';
import React from 'react';

export default function DashboardSidebar({ TABS, activeTab, setActiveTab, railOpen, setRailOpen, studio=false }) {
    return (
        <div className={`rail ${railOpen ? 'open' : ''}`}>
            <Brand compact className="atelier-rail-brand"/>
            {TABS.map((tab) => {
                return (
                    <button
                        key={tab.key}
                        className={`rail-item ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab(tab.key);
                            if (window.innerWidth <= 768 && setRailOpen) {
                                setRailOpen(false);
                            }
                        }}
                        title={tab.label}
                        aria-pressed={activeTab === tab.key}
                    >
                        <span>{studio ? <StudioTabIcon tab={tab.key} /> : <i className={`fa-solid ${tab.icon}`} /> }</span>
                        {tab.label}
                    </button>
                );
            })}
            {studio&&<Link to="/dashboard?section=account" className="rail-item studio-account-rail" title="Profil Akun"><span><StudioTabIcon tab="account" /></span>Profil Akun</Link>}
            {!studio&&<Link to="/guide" className="atelier-rail-help" title="Panduan"><span aria-hidden="true">?</span><small>Panduan</small></Link>}
        </div>
    );
}
