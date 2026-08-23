import React from 'react';

export default function DashboardSidebar({ TABS, activeTab, setActiveTab, railOpen, setRailOpen }) {
    return (
        <div className={`rail ${railOpen ? 'open' : ''}`}>
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
                    >
                        <span><i className={`fa-solid ${tab.icon}`}></i></span>
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
