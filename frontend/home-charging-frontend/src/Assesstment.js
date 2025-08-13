import React, { useState, useEffect } from 'react';
import './Assesstment.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const API_URL = 'http://localhost:5092/api/Assessment';

function App() {
  // Glavni state za assessment podatke
  const [assessment, setAssessment] = useState({
    id: null,
    customerId: null,
    PersonalInfo: {
      FirstName: '',
      LastName: '', 
      Email: '',
      Phone: ''
    },
    VehicleInfo: {
      Manufacturer: '',
      Model: '',
      Year: new Date().getFullYear(),
      VehicleId: ''
    },
    ElectricalPanelInfo: {
      Location: '',
      MainBreakerCapacity: 0,
      NumberOfOpenSlots: 0
    },
    ChargerInfo: {
      Location: '',
      DistanceFromPanelMeters: 0
    },
    HomeInfo: {
      Address: '',
      NumberOfHighEnergyDevices: 0
    },
    EvChargerInfo: {
      WantsToBuy: true,
      Brand: '',
      Model: '',
      PowerKw: 0
    },
    CurrentPage: 0,
    IsComplete: false
  });

  const [currentStep, setCurrentStep] = useState(-1); // -1 = start screen, 0-5 = steps
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const steps = [
    { key: 'PersonalInfo', title: 'Personal Information', image: 'person' },
    { key: 'VehicleInfo', title: 'Vehicle Information', image: 'electric-car' },
    { key: 'ElectricalPanelInfo', title: 'Electrical Panel', image: 'electric-panel' },
    { key: 'ChargerInfo', title: 'Charger Location', image: 'electric-charger' },
    { key: 'HomeInfo', title: 'Home Information', image: 'house' },
    { key: 'EvChargerInfo', title: 'EV Charger', image: 'ev-charger' }
  ];



const StepHeader = ({ title, image }) => {   // ovo ti je da ti slika i naslov budu u headeru svakog koraka
  let src;
  try {
    src = require(`./res/${image}.png`);
  } catch (e) {
    src = null; // fallback ako nema slike
  }

  return (
    <div className="step-header">
      {src && <img src={src} alt={title} className="step-header-img" />}
      <h3 className="step-title">{title}</h3>
    </div>
  );
};

  // Detektovana zemlja (ISO2, lowercase) za react-phone-input-2
  const [detectedCountry, setDetectedCountry] = useState('rs');

  // API pozivi pomoću fetch
  const apiCall = async (method, url, data = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.title || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  // Detektuj državu po IP-u pri mount-u
  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.country_code) {
          setDetectedCountry(data.country_code.toLowerCase());
        } else {
          setDetectedCountry('rs');
        }
      } catch (e) {
        setDetectedCountry('rs'); // fallback
      }
    };
    detect();
  }, []);

  // Automatsko čuvanje kada se promeni korak
  useEffect(() => {
    if (assessment.id && currentStep >= 0 && currentStep < steps.length) {
      saveCurrentStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Čuvanje trenutnog koraka u bazi
  const saveCurrentStep = async () => {
    if (!assessment.id || !assessment.customerId) {
      console.log('Assessment not yet created, skipping save');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedAssessment = {
        ...assessment,
        CurrentPage: currentStep,
        IsComplete: currentStep === steps.length - 1
      };
      const partitionKey = assessment.customerId;

      await apiCall('PUT', `${API_URL}/${assessment.id}?partitionKey=${encodeURIComponent(partitionKey)}`, updatedAssessment);

      setSuccess('Data saved automatically!');
      setTimeout(() => setSuccess(null), 500);

    } catch (error) {
      setError('Error while saving data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Kreiranje novog assessment-a
  const createAssessment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { id, customerId, ...assessmentPayload } = assessment;

      const response = await apiCall('POST', API_URL, assessmentPayload);

      setAssessment(prev => ({
        ...prev,
        id: response.id,
        customerId: response.customerId
      }));

      setSuccess('Assessment created! You can continue filling it out.');
      setTimeout(() => setSuccess(null), 500);

    } catch (error) {
      setError('Error while creating assessment');
    } finally {
      setLoading(false);
    }
  };

  // Ažuriranje podataka za trenutni korak
  const updateStepData = (stepKey, field, value) => {
    setAssessment(prev => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        [field]: value
      }
    }));
  };

  // Prelazak na sledeći korak
  const nextStep = async () => {
    if (!assessment.id) {
      await createAssessment();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Povratak na prethodni korak
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Početak upitnika
  const startAssessment = () => {
    setCurrentStep(0);
  };

  // Finalizovanje assessment-a
  const completeAssessment = async () => {
    setLoading(true);

    try {
      const finalAssessment = {
        ...assessment,
        CurrentPage: steps.length,
        IsComplete: true,
        CompletedAt: new Date().toISOString()
      };
      const partitionKey = assessment.customerId;
      await apiCall('PUT', `${API_URL}/${assessment.id}?partitionKey=${encodeURIComponent(partitionKey)}`, finalAssessment);

      setSuccess('Assessment successfully completed!');

    } catch (error) {
      setError('Error while completing assessment');
    } finally {
      setLoading(false);
    }
  };

 // Renderovanje forme za trenutni korak
const renderCurrentStep = () => {
  if (currentStep === -1) {
    return (
      <div className="welcome-screen">
        <h2>Welcome to the EV Charger Assessment</h2>
        <p>Let's evaluate the possibilities of installing a home charger for your electric vehicle.</p>
        <p>The questionnaire consists of 6 steps that will help us provide the best recommendation.</p>
      </div>
    );
  }

  const step = steps[currentStep];
  const stepData = assessment[step.key];

  switch (step.key) {
    case 'PersonalInfo':
      return (
        <div className="step-form">
          <StepHeader title={step.title} image={step.image} />

          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={stepData.FirstName}
                onChange={(e) => updateStepData('PersonalInfo', 'FirstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={stepData.LastName}
                onChange={(e) => updateStepData('PersonalInfo', 'LastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={stepData.Email}
                onChange={(e) => updateStepData('PersonalInfo', 'Email', e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group phone-group">
              <label>Phone</label>
              <div className="phone-input-wrapper">
                <PhoneInput
                  country={detectedCountry}
                  value={stepData.Phone}
                  onChange={(value) => updateStepData('PersonalInfo', 'Phone', value)}
                  enableSearch
                  enableAreaCodes={false}
                  disableCountryCode={false}
                  placeholder="Enter phone number"
                  inputProps={{
                    name: 'phone',
                    required: false,
                    autoFocus: false
                  }}
                />
              </div>
              <small className="phone-help">Flag indicates country calling code. You can change it from the dropdown.</small>
            </div>
          </div>
        </div>
      );

    case 'VehicleInfo':
      return (
        <div className="step-form">
          <StepHeader title={step.title} image={step.image} />

          <div className="form-grid">
            <div className="form-group">
              <label>Brand</label>
              <select
                value={stepData.Manufacturer}
                onChange={(e) => updateStepData('VehicleInfo', 'Manufacturer', e.target.value)}
                required
              >
                <option value="">Select brand</option>
                <option value="Tesla">Tesla</option>
                <option value="BMW">BMW</option>
                <option value="Audi">Audi</option>
                <option value="Mercedes">Mercedes</option>
                <option value="Volkswagen">Volkswagen</option>
                <option value="Nissan">Nissan</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Kia">Kia</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                value={stepData.Model}
                onChange={(e) => updateStepData('VehicleInfo', 'Model', e.target.value)}
                placeholder="Vehicle model"
                required
              />
            </div>

            <div className="form-group">
              <label>Year of Manufacture</label>
              <input
                type="number"
                min="2010"
                max={new Date().getFullYear() + 1}
                value={stepData.Year}
                onChange={(e) => updateStepData('VehicleInfo', 'Year', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle VIN number</label>
              <input
                type="text"
                value={stepData.VehicleId}
                onChange={(e) => updateStepData('VehicleInfo', 'VehicleId', e.target.value)}
                placeholder="VIN number (optional)"
              />
            </div>
          </div>
        </div>
      );

    case 'ElectricalPanelInfo':
      return (
        <div className="step-form">
          <StepHeader title={step.title} image={step.image} />

          <div className="form-grid">
            <div className="form-group">
              <label>Panel Location</label>
              <select
                value={stepData.Location}
                onChange={(e) => updateStepData('ElectricalPanelInfo', 'Location', e.target.value)}
                required
              >
                <option value="">Select location</option>
                <option value="Basement">Basement</option>
                <option value="Garage">Garage</option>
                <option value="Inside house">Inside house</option>
                <option value="Exterior wall">Exterior wall</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Main Breaker Capacity (A)</label>
              <select
                value={stepData.MainBreakerCapacity}
                onChange={(e) => updateStepData('ElectricalPanelInfo', 'MainBreakerCapacity', parseInt(e.target.value))}
                required
              >
                <option value="0">Select capacity</option>
                <option value="63">63A</option>
                <option value="80">80A</option>
                <option value="100">100A</option>
                <option value="125">125A</option>
                <option value="160">160A</option>
                <option value="200">200A</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Free Slots in Panel</label>
              <input
                type="number"
                min="0"
                max="20"
                value={stepData.NumberOfOpenSlots}
                onChange={(e) => updateStepData('ElectricalPanelInfo', 'NumberOfOpenSlots', parseInt(e.target.value))}
                required
              />
            </div>
          </div>
        </div>
      );

    case 'ChargerInfo':
      return (
        <div className="step-form">
          <StepHeader title={step.title} image={step.image} />

          <div className="form-grid">
            <div className="form-group">
              <label>Planned Charger Location</label>
              <select
                value={stepData.Location}
                onChange={(e) => updateStepData('ChargerInfo', 'Location', e.target.value)}
                required
              >
                <option value="">Select location</option>
                <option value="Garage">Garage</option>
                <option value="Carport">Carport</option>
                <option value="Yard">Yard</option>
                <option value="Street">Street</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Distance from Electrical Panel (m)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={stepData.DistanceFromPanelMeters}
                onChange={(e) => updateStepData('ChargerInfo', 'DistanceFromPanelMeters', parseFloat(e.target.value))}
                placeholder="Distance in meters"
                required
              />
            </div>
          </div>
        </div>
      );

    case 'HomeInfo':
      return (
        <div className="step-form">
          <StepHeader title={step.title} image={step.image} />

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                value={stepData.Address}
                onChange={(e) => updateStepData('HomeInfo', 'Address', e.target.value)}
                placeholder="Enter full address"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Number of High-Energy Devices</label>
              <input
                type="number"
                min="0"
                max="20"
                value={stepData.NumberOfHighEnergyDevices}
                onChange={(e) => updateStepData('HomeInfo', 'NumberOfHighEnergyDevices', parseInt(e.target.value))}
                required
              />
              <small>Air conditioners, boilers, induction stoves, etc.</small>
            </div>
          </div>
        </div>
      );

    case 'EvChargerInfo':
      return (
        <div className="step-form">
          <StepHeader title={step.title} image={step.image} />

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Do you want to buy an EV charger?</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="wantsToBuy"
                    checked={stepData.WantsToBuy === true}
                    onChange={() => updateStepData('EvChargerInfo', 'WantsToBuy', true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="wantsToBuy"
                    checked={stepData.WantsToBuy === false}
                    onChange={() => updateStepData('EvChargerInfo', 'WantsToBuy', false)}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {stepData.WantsToBuy && (
              <>
                <div className="form-group">
                  <label>Preferred Brand</label>
                  <select
                    value={stepData.Brand}
                    onChange={(e) => updateStepData('EvChargerInfo', 'Brand', e.target.value)}
                  >
                    <option value="">Select brand</option>
                    <option value="Tesla">Tesla</option>
                    <option value="Wallbox">Wallbox</option>
                    <option value="ChargePoint">ChargePoint</option>
                    <option value="ABB">ABB</option>
                    <option value="Schneider">Schneider Electric</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Charger model</label>
                  <input
                    type="text"
                    value={stepData.Model}
                    onChange={(e) => updateStepData('EvChargerInfo', 'Model', e.target.value)}
                    placeholder="Charger model"
                  />
                </div>

                <div className="form-group">
                  <label>Charger Power (kW)</label>
                  <select
                    value={stepData.PowerKw}
                    onChange={(e) => updateStepData('EvChargerInfo', 'PowerKw', parseFloat(e.target.value))}
                    required
                  >
                    <option value="0">Select power</option>
                    <option value="3.7">3.7 kW</option>
                    <option value="7.4">7.4 kW</option>
                    <option value="11">11 kW</option>
                    <option value="22">22 kW</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      );

    default:
      return <div>Unknown step</div>;
  }
};


  // Validacija trenutnog koraka
  const isCurrentStepValid = () => {
    if (currentStep === -1) return true;

    const step = steps[currentStep];
    const stepData = assessment[step.key];

    switch (step.key) {
      case 'PersonalInfo':
        return stepData.FirstName && stepData.LastName && stepData.Email;
      case 'VehicleInfo':
        return stepData.Manufacturer && stepData.Model && stepData.Year;
      case 'ElectricalPanelInfo':
        return stepData.Location && stepData.MainBreakerCapacity > 0 && stepData.NumberOfOpenSlots >= 0;
      case 'ChargerInfo':
        return stepData.Location && stepData.DistanceFromPanelMeters >= 0;
      case 'HomeInfo':
        return stepData.Address && stepData.NumberOfHighEnergyDevices >= 0;
      case 'EvChargerInfo':
        return stepData.WantsToBuy !== null && (!stepData.WantsToBuy || stepData.PowerKw > 0);
      default:
        return true;
    }
  };

  return (
    <div className="App">
      <main className="main-content">
        {/* Left side - Form */}
        <div className="left-side">
          <div className="form-container">
            {renderCurrentStep()}

              {currentStep === -1 && (
              <button className="btn btn-start" onClick={startAssessment} disabled={loading}>
                Start Assessment
              </button>
            )}
            {/* Navigation Buttons */}
            {currentStep >= 0 && (
              <div className="navigation-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={prevStep}
                  disabled={currentStep === 0 || loading}
                >
                  ← Back
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid() || loading}
                  >
                    {loading ? 'Saving...' : 'Next →'}
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={completeAssessment}
                    disabled={!isCurrentStepValid() || loading}
                  >
                    {loading ? 'Finishing...' : '✓ Finish Assessment'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="message success-message">
              ✓ {success}
            </div>
          )}

          {error && (
            <div className="message error-message">
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Right side - Stepper */}
        <div className="right-side">
          <div className="stepper-container">
            {steps.map((step, index) => (
              <div key={step.key} className="stepper-item">
                <div className={`step-circle ${
                  currentStep > index ? 'completed' :
                  currentStep === index ? 'active' :
                  'inactive'
                }`}>
                  <div className="step-image">
                    <img
                      src={require(`./res/${step.image}.png`)}
                      alt={step.title}
                      className="step-img"
                    />
                  </div>
                </div>
                <div className="step-label">
                  {step.title}
                </div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}

          
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 
