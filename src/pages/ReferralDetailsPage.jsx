import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';

const ReferralDetailsPage = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.replace(/-/g, '/');
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(false);
      const token = Cookies.get('jwt_token');

      try {
        const url = `https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals?id=${id}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch');
        }

        const data = await res.json();

        if (data.success && data.data) {
          const payload = data.data;
          
          if (payload.referrals && Array.isArray(payload.referrals)) {
            const foundItem = payload.referrals.find((item) => String(item.id) === String(id));
            if (foundItem) {
              setDetails(foundItem);
            } else {
              setError(true);
            }
          } else if (payload.id) {
            setDetails(payload);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-layout-wrapper">
        <Navbar />
        <div style={{textAlign: 'center', marginTop: '50px'}}>Loading details...</div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="dashboard-layout-wrapper">
        <Navbar />
        <main className="notfound-viewport">
          <h1 style={{fontSize: '30px', marginBottom: '20px'}}>Referral not found</h1>
          <Link to="/" className="navigation-return-link">
            &larr; Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout-wrapper">
      <Navbar />

      <main className="detail-main-viewport">
        <Link to="/" className="navigation-return-link">
          &larr; Back to dashboard
        </Link>
        
        <div className="detail-card-frame">
          <h1 className="detail-main-heading">Referral Details</h1>
          <p style={{color: '#6b7280', marginBottom: '20px'}}>Full information for this referral partner.</p>
          
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '20px'}}>
            <h2 className="partner-name-heading" style={{margin: 0}}>{details.name}</h2>
            <span style={{backgroundColor: '#eef2ff', color: '#6366f1', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold'}}>
              {details.serviceName}
            </span>
          </div>

          <dl className="structured-definition-list">
            <div className="definition-item-row">
              <dt>REFERRAL ID</dt>
              <dd>{details.id}</dd>
            </div>
            
            <div className="definition-item-row">
              <dt>NAME</dt>
              <dd>{details.name}</dd>
            </div>

            <div className="definition-item-row">
              <dt>SERVICE NAME</dt>
              <dd>{details.serviceName}</dd>
            </div>

            <div className="definition-item-row">
              <dt>DATE</dt>
              <dd>{formatDate(details.date)}</dd>
            </div>

            <div className="definition-item-row" style={{borderBottom: 'none'}}>
              <dt>PROFIT</dt>
              <dd>{formatCurrency(details.profit)}</dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
};

export default ReferralDetailsPage;