// App.js - Glavna komponenta
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Backend URL - promenite port ako je potrebno
const API_URL = 'http://localhost:5092/api/Assessment'; // Zamenite sa vašim portom

function App() {
  // STATE - stanje komponente (podaci koji se menjaju)
  const [assessment, setAssessment] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Funkcija za kreiranje novog assessment-a
  const handleCreateAssessment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(API_URL, assessment, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setResult(response.data);
      console.log('Assessment kreiran:', response.data);
      
      // Resetuj formu
      setAssessment({
        firstName: '',
        lastName: '',
        email: ''
      });
      
    } catch (error) {
      console.error('Greška pri kreiranju:', error);
      setError('Greška pri kreiranju assessment-a: ' + 
        (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcija za dohvatanje assessment-a po ID-u
  const handleGetAssessment = async () => {
    if (!result || !result.id || !result.customerId) {
      setError('Prvo kreirajte assessment da biste ga mogli dohvatiti');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_URL}/${result.id}?partitionKey=${result.customerId}`
      );
      
      alert(`Dohvaćen assessment:\nIme: ${response.data.firstName}\nPrezime: ${response.data.lastName}\nEmail: ${response.data.email}`);
      
    } catch (error) {
      console.error('Greška pri dohvatanju:', error);
      setError('Greška pri dohvatanju assessment-a: ' + 
        (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcija za ažuriranje input polja
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssessment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // RENDER - šta se prikazuje na stranici
  return (
    <div className="App">
      <header className="App-header">
        <h1>Home Charging Assessment</h1>
        <p>Kreiranje i testiranje assessment-a</p>
      </header>
      
      <main className="main-content">
        {/* FORMA ZA KREIRANJE */}
        <div className="form-section">
          <h2>Kreiranje novog Assessment-a</h2>
          
          <div className="form-group">
            <label htmlFor="firstName">Ime:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={assessment.firstName}
              onChange={handleInputChange}
              placeholder="Unesite ime"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Prezime:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={assessment.lastName}
              onChange={handleInputChange}
              placeholder="Unesite prezime"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={assessment.email}
              onChange={handleInputChange}
              placeholder="Unesite email"
              disabled={loading}
            />
          </div>
          
          <button 
            onClick={handleCreateAssessment}
            disabled={loading || !assessment.firstName || !assessment.lastName || !assessment.email}
            className="btn btn-primary"
          >
            {loading ? 'Kreiranje...' : 'Kreiraj Assessment'}
          </button>
        </div>
        
        {/* PRIKAZ REZULTATA */}
        {result && (
          <div className="result-section">
            <h2>Kreiran Assessment:</h2>
            <div className="result-card">
              <p><strong>ID:</strong> {result.id}</p>
              <p><strong>Customer ID:</strong> {result.customerId}</p>
              <p><strong>Ime:</strong> {result.firstName}</p>
              <p><strong>Prezime:</strong> {result.lastName}</p>
              <p><strong>Email:</strong> {result.email}</p>
              <p><strong>Kreiran:</strong> {new Date(result.createdAt).toLocaleString('sr-RS')}</p>
              
              <button 
                onClick={handleGetAssessment}
                disabled={loading}
                className="btn btn-secondary"
              >
                {loading ? 'Dohvatanje...' : 'Dohvati ovaj Assessment'}
              </button>
            </div>
          </div>
        )}
        
        {/* PRIKAZ GREŠAKA */}
        {error && (
          <div className="error-section">
            <h3>Greška:</h3>
            <p className="error-message">{error}</p>
          </div>
        )}
        
        {/* LOADING INDIKATOR */}
        {loading && (
          <div className="loading-section">
            <p>Učitavanje...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;