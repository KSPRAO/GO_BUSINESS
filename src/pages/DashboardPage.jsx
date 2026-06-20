import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState([]);
  const [serviceSummary, setServiceSummary] = useState(null);
  const [shareConfig, setShareConfig] = useState({ link: '', code: '' });
  const [referrals, setReferrals] = useState([]);
  
  const [initialLoad, setInitialLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.replace(/-/g, '/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to match the API labels to simple text icons
  const getIconForMetric = (label) => {
    const text = label.toLowerCase();
    if (text.includes('balance')) return '$';
    if (text.includes('discount percentage')) return '💳';
    if (text.includes('total referral')) return '🔗';
    if (text.includes('discount amount')) return '⏳';
    if (text.includes('commission amount')) return '%';
    if (text.includes('total earning')) return '💰';
    if (text.includes('commission discount')) return '👥';
    if (text.includes('bank transfer')) return '⇄';
    return '📊'; // Default fallback icon
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, sort]);

  const fetchData = async () => {
    setIsUpdating(true);
    setError('');
    const token = Cookies.get('jwt_token');

    try {
      const url = new URL('https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals');
      
      if (debouncedSearch.trim() !== '') {
        url.searchParams.append('search', debouncedSearch.trim());
      }
      url.searchParams.append('sort', sort);

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      if (data.success && data.data) {
        setMetrics(data.data.metrics || []);
        setServiceSummary(data.data.serviceSummary || null);
        setShareConfig(data.data.referral || { link: '', code: '' });
        setReferrals(data.data.referrals || []);
        setCurrentPage(1); 
      } else {
        setError('Failed to load dashboard data.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setInitialLoad(false);
      setIsUpdating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const totalRows = referrals.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);

  const currentReferrals = referrals.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="dashboard-layout-wrapper">
      <Navbar />

      <main className="dashboard-content">
        <header className="dashboard-title-area">
          <h1 className="dashboard-heading">Referral Dashboard</h1>
          <p className="dashboard-subtitle">
            Track your referrals, earnings, and partner activity in one place.
          </p>
        </header>

        {initialLoad && <div style={{textAlign: 'center', marginTop: '20px'}}>Loading...</div>}

        {error && (
          <div className="error-alert-panel" role="alert">
            {error}
          </div>
        )}

        {!initialLoad && !error && (
          <>
            <section className="dashboard-section" aria-label="Overview metrics">
              <h2 className="section-title">Overview</h2>
              <div className="metrics-grid">
                {metrics.map((m) => (
                  <div className="metric-box-card" key={m.id}>
                    {/* Added the icon box here! */}
                    <div className="metric-icon-box">
                      {getIconForMetric(m.label)}
                    </div>
                    <strong className="metric-numeric-value">{m.value}</strong>
                    <span className="metric-title-label">{m.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-section" aria-label="Service summary">
              <h2 className="section-title">Service summary</h2>
              <div style={{overflowX: 'auto'}}>
                <table className="summary-data-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Your Referrals</th>
                      <th>Active Referrals</th>
                      <th>Total Ref. Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceSummary ? (
                      <tr>
                        <td style={{color: '#6366f1'}}>{serviceSummary.service}</td>
                        <td>{serviceSummary.yourReferrals}</td>
                        <td>{serviceSummary.activeReferrals}</td>
                        <td>{serviceSummary.totalRefEarnings}</td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>No summary data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="dashboard-section" aria-label="Share referral">
              <h2 className="section-title" style={{ color: '#6366f1' }}>Refer friends and earn more</h2>
              <div className="sharing-controls-grid">
                <div className="share-field-row">
                  <label>Your Referral Link</label>
                  <div className="input-action-group">
                    <input type="text" readOnly value={shareConfig.link} />
                    <button type="button" onClick={() => copyToClipboard(shareConfig.link)} className="action-copy-btn">
                      Copy
                    </button>
                  </div>
                </div>

                <div className="share-field-row">
                  <label>Your Referral Code</label>
                  <div className="input-action-group">
                    <input type="text" readOnly value={shareConfig.code} />
                    <button type="button" onClick={() => copyToClipboard(shareConfig.code)} className="action-copy-btn">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="table-header-control-strip">
                <h2 className="section-title" style={{ marginBottom: 0 }}>All referrals</h2>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div className="search-box-element">
                    <input
                      type="text"
                      placeholder="Name or service…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="sort-dropdown-element">
                    <label>
                      Sort by date
                      <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="desc">Newest first</option>
                        <option value="asc">Oldest first</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', overflowX: 'auto' }}>
                {isUpdating && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                    <span style={{ color: '#6366f1', fontWeight: 'bold' }}>Updating...</span>
                  </div>
                )}
                
                <table className="interactive-dataset-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReferrals.length > 0 ? (
                      currentReferrals.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => navigate(`/referral/${row.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{row.name}</td>
                          <td>{row.serviceName}</td>
                          <td>{formatDate(row.date)}</td>
                          <td>{formatCurrency(row.profit)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                          No matching entries
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <footer className="pagination-footer-nav">
                <span className="pagination-summary-text">
                  Showing {startRow}–{endRow} of {totalRows} entries
                </span>
                
                <div className="pagination-action-buttons">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'active-page' : ''}
                        style={{ width: '30px', height: '30px' }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </footer>
            </section>
          </>
        )}
      </main>

      <footer className="dashboard-global-footer">
        <div className="footer-inner-container">
          <span style={{color: '#6366f1', fontWeight: 'bold'}}>Go Business</span>
          <nav className="footer-links-nav">
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </nav>
          <span>© 2024 Go Business, Inc.</span>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage; 