import { useState, useEffect, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { SPREADSHEET_ID, API_KEY } from '../config/constants';

interface Prices {
  eurodiesel: string;
  eurosuper98BS: string;
  geForce95Plus: string;
  extremeDiesel: string;
  extraLesno: string;
  mazut: string;
}

export function RegulatoryPricesView() {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [updatedBy, setUpdatedBy] = useState('');
  const [prices, setPrices] = useState<Prices>({
    eurodiesel: '',
    eurosuper98BS: '',
    geForce95Plus: '',
    extremeDiesel: '',
    extraLesno: '',
    mazut: ''
  });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/RegulatoryPrices!A2:H1000?key=${API_KEY}&t=${Date.now()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.values && data.values.length > 0) {
        const lastRow = data.values[data.values.length - 1];
        setPrices({
          eurodiesel: lastRow[1] || '',
          eurosuper98BS: lastRow[2] || '',
          geForce95Plus: lastRow[3] || '',
          extremeDiesel: lastRow[4] || '',
          extraLesno: lastRow[5] || '',
          mazut: lastRow[6] || ''
        });
        setLastUpdate(new Date(lastRow[0]).toLocaleDateString());
        setUpdatedBy(lastRow[7] || 'Unknown');
      }
    } catch (error) {
      console.error('Error loading prices:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!Object.values(prices).some(p => p)) {
      alert('⚠️ Please enter at least one price');
      return;
    }

    setLoading(true);

    try {
      await ApiService.updateRegulatoryPrices(prices, currentUser!.id);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await loadPrices();
      alert('✅ Regulatory prices updated successfully!');
    } catch (error) {
      console.error('Error saving prices:', error);
      alert('❌ Error saving prices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📊 Daily Regulatory Prices</h2>
        <button className="btn btn-secondary" onClick={loadPrices}>
          Refresh
        </button>
      </div>
      <div style={{ padding: '0 0.5rem' }}>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Enter today's regulatory fuel prices from{' '}
          <a
            href="https://www.erc.org.mk/page.aspx?id=290"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3b82f6' }}
          >
            ERC Website
          </a>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label>Eurodiesel (MKD/L)</label>
              <input
                type="number"
                step="0.01"
                value={prices.eurodiesel}
                onChange={(e) => setPrices({ ...prices, eurodiesel: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Eurosuper 98 BS (MKD/L)</label>
              <input
                type="number"
                step="0.01"
                value={prices.eurosuper98BS}
                onChange={(e) => setPrices({ ...prices, eurosuper98BS: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>GeForce 95 Plus (MKD/L)</label>
              <input
                type="number"
                step="0.01"
                value={prices.geForce95Plus}
                onChange={(e) => setPrices({ ...prices, geForce95Plus: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Extreme Diesel (MKD/L)</label>
              <input
                type="number"
                step="0.01"
                value={prices.extremeDiesel}
                onChange={(e) => setPrices({ ...prices, extremeDiesel: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Extra Lesno (MKD/L)</label>
              <input
                type="number"
                step="0.01"
                value={prices.extraLesno}
                onChange={(e) => setPrices({ ...prices, extraLesno: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Mazut (MKD/L)</label>
              <input
                type="number"
                step="0.01"
                value={prices.mazut}
                onChange={(e) => setPrices({ ...prices, mazut: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Prices'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
          <h4>Current Prices</h4>
          {lastUpdate ? (
            <>
              <p><strong>Last updated:</strong> {lastUpdate}</p>
              <p><strong>By:</strong> {updatedBy}</p>
            </>
          ) : (
            <p style={{ color: '#6b7280' }}>No prices entered yet. Enter the first set of prices above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
