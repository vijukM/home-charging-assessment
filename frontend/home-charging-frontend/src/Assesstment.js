import React, { useState, useEffect } from 'react';
import './Assesstment.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import bgRight from './res/bg-right-side2.png';
import useElectricVehicles from './useElectricVehicles';

const API_URL = 'http://localhost:5092/api/Assessment';
const phoneRegex = /\d{10,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      Brand: '',
      BaseModel: '',
      Model: '',
      Year: new Date().getFullYear()
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
      Address: {
        Street: '',
        StreetNumber: '',
        City: '',
        PostalCode: '',
        Country: ''
      },
      NumberOfHighEnergyDevices: 0
    },
    EvChargerInfo: {
      WantsToBuy: false,
      Brand: '',
      Model: '',
      PowerKw: 0
    },
    CurrentPage: 0,
    IsComplete: false
  });

  // Track which steps have been saved
  const [savedSteps, setSavedSteps] = useState(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Jednostavan način - koristi samo najvažnije gradove
  const loadCitiesForCountry = (countryName) => {
    if (!countryName) {
      setCities([]);
      return;
    }

    // Jednostavan lokalni podatci za gradove
    const localCities = {
      'Serbia': [
        { id: 1, name: 'Belgrade' },
        { id: 2, name: 'Novi Sad' },
        { id: 3, name: 'Niš' },
        { id: 4, name: 'Kragujevac' },
        { id: 5, name: 'Subotica' },
        { id: 6, name: 'Pančevo' }
      ],
      'Croatia': [
        { id: 1, name: 'Zagreb' },
        { id: 2, name: 'Split' },
        { id: 3, name: 'Rijeka' },
        { id: 4, name: 'Osijek' },
        { id: 5, name: 'Zadar' }
      ],
      'Germany': [
        { id: 1, name: 'Berlin' },
        { id: 2, name: 'Munich' },
        { id: 3, name: 'Hamburg' },
        { id: 4, name: 'Frankfurt' },
        { id: 5, name: 'Cologne' }
      ],
      'United States': [
        { id: 1, name: 'New York' },
        { id: 2, name: 'Los Angeles' },
        { id: 3, name: 'Chicago' },
        { id: 4, name: 'Houston' },
        { id: 5, name: 'Miami' }
      ]
      // dodaj ostale zemlje...
    };
    setCities(localCities[countryName] || []);
  };

  const [currentStep, setCurrentStep] = useState(-1); // -1 = start screen, 0-5 = steps, 6 = completion screen
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [chargerLocations, setChargerLocations] = useState([]);
  const [panelLocations, setPanelLocations] = useState([]);
  const { vehicles: allEVs, loading: evLoading } = useElectricVehicles();
  const brands = Array.from(new Set(allEVs.map(v => v.brand))).sort();
  const [baseModels, setBaseModels] = useState([]);
  const [models, setModels] = useState([]); 
  // State za validacione greške
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    phone: ''
  });
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  // Funkcije za validaciju
  const validatePhone = (phone) => {
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    return emailRegex.test(email);
  };

  // Handleri za blur događaje
  const handleEmailBlur = (email) => {
    if (email && !validateEmail(email)) {
      setValidationErrors(prev => ({
        ...prev,
        email: 'Invalid email format (example: example@email.com)'
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        email: ''
      }));
    }
  };

  const handlePhoneBlur = (phone) => {
    if (phone && !validatePhone(phone)) {
      setValidationErrors(prev => ({
        ...prev,
        phone: 'Invalid phone number format (must be at least 8 digits)'
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  // Zameni postojeće useEffect hook-ove sa ovim ispravkama:
  useEffect(() => {
    const vehicleData = assessment.VehicleInfo; // Definiši lokalno
    if (vehicleData.Brand) {
      const filteredBaseModels = allEVs
        .filter(v => v.brand === vehicleData.Brand)
        .map(v => v.baseModel);
      const uniqueBaseModels = Array.from(new Set(filteredBaseModels)).sort();
      setBaseModels(uniqueBaseModels);

      // Resetuj modele kada se promeni brand
      setModels([]);
      
      // Resetuj vrednosti u assessment-u ako nisu validne
      if (vehicleData.BaseModel && !uniqueBaseModels.includes(vehicleData.BaseModel)) {
        setAssessment(prev => ({
          ...prev,
          VehicleInfo: {
            ...prev.VehicleInfo,
            BaseModel: '',
            Model: ''
          }
        }));
      }
    } else {
      setBaseModels([]);
      setModels([]);
    }
  }, [assessment.VehicleInfo.Brand, allEVs]);

  useEffect(() => {
    const vehicleData = assessment.VehicleInfo; // Definiši lokalno
    if (vehicleData.BaseModel) {
      const filteredModels = allEVs
        .filter(v => v.brand === vehicleData.Brand && v.baseModel === vehicleData.BaseModel)
        .map(v => v.model);
      const uniqueModels = Array.from(new Set(filteredModels)).sort();
      setModels(uniqueModels);
      
      // Resetuj Model ako nije validan za novi BaseModel
      if (vehicleData.Model && !uniqueModels.includes(vehicleData.Model)) {
        setAssessment(prev => ({
          ...prev,
          VehicleInfo: {
            ...prev.VehicleInfo,
            Model: ''
          }
        }));
      }
    } else {
      setModels([]);
    }
  }, [assessment.VehicleInfo.BaseModel, assessment.VehicleInfo.Brand, allEVs]);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const formattedCountries = data
        .map(country => ({
          name: country.name.common,
          flag: country.flags.png,
          flagAlt: country.flags.alt || `Flag of ${country.name.common}`
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setCountries(formattedCountries);
      
    } catch (error) {
      console.error('Error loading countries:', error);
      // Fallback na lokalne podatke
      // ovde je planirano da  pokupim lokalne podatke ali necu to
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('http://localhost:5092/api/ChargerLocation')
      .then(res => res.json())
      .then(data => setChargerLocations(data))
      .catch(err => console.error("Error fetching charger locations:", err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:5092/api/PanelLocation')
      .then(res => res.json())
      .then(data => setPanelLocations(data))
      .catch(err => console.error("Error fetching charger locations:", err));
  }, []);

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
        IsComplete: currentStep === steps.length
      };
      const partitionKey = assessment.customerId;

      await apiCall('PUT', `${API_URL}/${assessment.id}?partitionKey=${encodeURIComponent(partitionKey)}`, updatedAssessment);

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

    // Mark current step as saved when "Save and Continue" is clicked
    setSavedSteps(prev => new Set([...prev, currentStep]));

    if (currentStep < steps.length) {
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

      // Mark all steps as saved when completing assessment
      setSavedSteps(new Set([0, 1, 2, 3, 4, 5]));
      
      setShowCompletionModal(true);

    } catch (error) {
      setError('Error while completing assessment');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to specific step
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Check if a step is completed (has valid data)
  const isStepCompleted = (stepIndex) => {
    if (stepIndex >= currentStep) return false; // Current and future steps are not completed
    
    const step = steps[stepIndex];
    const stepData = assessment[step.key];

    switch (step.key) {
      case 'PersonalInfo':
        const isFirstNameValid = !!stepData.FirstName?.trim();
        const isLastNameValid = !!stepData.LastName?.trim();
        const isEmailValid = emailRegex.test(stepData.Email || '');
        const isPhoneValid = phoneRegex.test(stepData.Phone || '');
        return isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid;

      case 'VehicleInfo':
        return stepData.Brand && stepData.Model && stepData.Year;
      case 'ElectricalPanelInfo':
        return stepData.Location && stepData.MainBreakerCapacity > 0 && stepData.NumberOfOpenSlots >= 0;
      case 'ChargerInfo':
        return stepData.Location && stepData.DistanceFromPanelMeters >= 0;
      case 'HomeInfo':
        return stepData.Address.Country && stepData.Address.City && stepData.Address.Street && stepData.Address.StreetNumber && stepData.Address.PostalCode && stepData.NumberOfHighEnergyDevices >= 0;
      case 'EvChargerInfo':
        // If user doesn't want to buy, step is valid
        if (stepData.WantsToBuy === false) return true;
        // If user wants to buy, all three fields are required
        if (stepData.WantsToBuy === true) {
          return stepData.Brand && stepData.Model && stepData.PowerKw > 0;
        }
        // If WantsToBuy is null/undefined, step is not valid
        return false;
      default:
        return false;
    }
  };

  // Check if step has been saved (Save and Continue clicked)
  const isStepSaved = (stepIndex) => {
    return savedSteps.has(stepIndex);
  };

  // Get step status for display
  const getStepStatus = (stepIndex) => {
    const isCompleted = isStepCompleted(stepIndex);
    const isSaved = isStepSaved(stepIndex);
    const isActive = currentStep === stepIndex;
    const isSkipped = stepIndex < currentStep && !isCompleted;
    const hasValidData = stepIndex < currentStep && isCompleted && !isSaved;

    if (isActive) return 'active';
    if (isSkipped) return 'skipped';
    if (isSaved) return 'saved';
    if (hasValidData) return 'attention';
    return 'inactive';
  };

  // Check if all steps are completed and valid
  const areAllStepsValid = () => {
    for (let i = 0; i < steps.length; i++) {
      if (!isStepSaved(i) && i !== currentStep) {
        return false;
      }
    }
    // Also check if current step is valid
    return isCurrentStepValid();
  };

  // Handle completion modal actions
  const handleViewRecommendations = () => {
    setShowCompletionModal(false);
    window.location.href = 'http://localhost:3000/purchase';
  };

  const handleStartNewAssessment = () => {
    setShowCompletionModal(false);
    setCurrentStep(-1);
    setSavedSteps(new Set());
    setAssessment({
      id: null,
      customerId: null,
      PersonalInfo: {
        FirstName: '',
        LastName: '', 
        Email: '',
        Phone: ''
      },
      VehicleInfo: {
        Brand: '',
        BaseModel: '',
        Model: '',
        Year: new Date().getFullYear()
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
        Address: {
          Street: '',
          StreetNumber: '',
          City: '',
          PostalCode: '',
          Country: ''
        },
        NumberOfHighEnergyDevices: 0
      },
      EvChargerInfo: {
        WantsToBuy: false,
        Brand: '',
        Model: '',
        PowerKw: 0
      },
      CurrentPage: 0,
      IsComplete: false
    });
  };

  // Handle charger purchase decision
  const handleChargerDecision = (wantsToBuy) => {
    if (wantsToBuy) {
      // Redirect to purchase page
      window.location.href = 'http://localhost:3000/purchase';
    } else {
      // Go back to start
      setCurrentStep(-1);
      // Reset assessment if needed
                            setSavedSteps(new Set());
                      setAssessment({
        id: null,
        customerId: null,
        PersonalInfo: {
          FirstName: '',
          LastName: '', 
          Email: '',
          Phone: ''
        },
        VehicleInfo: {
          Brand: '',
          BaseModel: '',
          Model: '',
          Year: new Date().getFullYear()
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
          Address: {
            Street: '',
            StreetNumber: '',
            City: '',
            PostalCode: '',
            Country: ''
          },
          NumberOfHighEnergyDevices: 0
        },
        EvChargerInfo: {
          WantsToBuy: false,
          Brand: '',
          Model: '',
          PowerKw: 0
        },
        CurrentPage: 0,
        IsComplete: false
      });
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

    // Completion screen
    if (currentStep === steps.length) {
      return (
        <div className="completion-screen">
          <div className="completion-content">
            <div className="completion-icon">🎉</div>
            <h2>Congratulations!</h2>
            <p>You have successfully completed the EV Charger Assessment!</p>
            <p>Based on your information, we can now provide you with personalized recommendations.</p>
            
            <div className="completion-actions">
              <h3>What would you like to do next?</h3>
              <div className="decision-buttons">
                <button 
                  className="btn btn-success"
                  onClick={() => window.location.href = 'http://localhost:3000/purchase'}
                >
                  View Recommendations
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setCurrentStep(-1);
                    // Reset assessment
                    setAssessment({
                      id: null,
                      customerId: null,
                      PersonalInfo: {
                        FirstName: '',
                        LastName: '', 
                        Email: '',
                        Phone: ''
                      },
                      VehicleInfo: {
                        Brand: '',
                        BaseModel: '',
                        Model: '',
                        Year: new Date().getFullYear()
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
                        Address: {
                          Street: '',
                          StreetNumber: '',
                          City: '',
                          PostalCode: '',
                          Country: ''
                        },
                        NumberOfHighEnergyDevices: 0
                      },
                      EvChargerInfo: {
                        WantsToBuy: false,
                        Brand: '',
                        Model: '',
                        PowerKw: 0
                      },
                      CurrentPage: 0,
                      IsComplete: false
                    });
                  }}
                >
                  Start New Assessment
                </button>
              </div>
            </div>
          </div>
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
                  onBlur={(e) => handleEmailBlur(e.target.value)}
                  placeholder="example@email.com"
                  className={validationErrors.email ? 'error' : ''}
                  required
                />
                {validationErrors.email && (
                  <div className="validation-error">
                    {validationErrors.email}
                  </div>
                )}
              </div>

              <div className="form-group phone-group">
                <label>Phone</label>
                <div className="phone-input-wrapper">
                  <PhoneInput
                    country={detectedCountry}
                    value={stepData.Phone}
                    onChange={(value) => updateStepData('PersonalInfo', 'Phone', value)}
                    onBlur={() => handlePhoneBlur(stepData.Phone)}
                    enableSearch
                    enableAreaCodes={false}
                    disableCountryCode={false}
                    placeholder="Enter phone number"
                    inputProps={{
                      name: 'phone',
                      required: false,
                      autoFocus: false,
                    }}
                  />
                </div>
                  {validationErrors.phone && (
                      <div className="validation-error">
                        {validationErrors.phone}
                      </div>
                    )}
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
              {evLoading ? (
                <div>Loading brands...</div>
              ) : (
                <select
                  value={stepData.Brand}
                  onChange={(e) => updateStepData('VehicleInfo', 'Brand', e.target.value)}
                  required
                >
                  <option value="">Select brand</option>
                  {brands.map((brand, idx) => (
                    <option key={idx} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              )}
           </div>
           <div className="form-group">
              <label>Base Model</label>
              <select
                value={stepData.BaseModel}
                onChange={(e) => updateStepData('VehicleInfo', 'BaseModel', e.target.value)}
                required
                disabled={!stepData.Brand}
              >
                <option value="">Select base model</option>
                {baseModels.map((bm, idx) => (
                  <option key={idx} value={bm}>
                    {bm}
                  </option>
                ))}
              </select>
            </div>

             <div className="form-group">
                <label>Model</label>
                <select
                  value={stepData.Model}
                  onChange={(e) => updateStepData('VehicleInfo', 'Model', e.target.value)}
                  required
                  disabled={!stepData.BaseModel}>
                  <option value="">Select model</option>
                  {models.map((m, idx) => (
                    <option key={idx} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
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

            </div>
          </div>
        );

      case 'ElectricalPanelInfo':
        return (
          <div className="step-form">
            <StepHeader title={step.title} image={step.image} />

          <div className="form-grid-three">
    <div className="form-group">
      <label>Panel Location</label>
      <select
        value={stepData.Location}
        onChange={(e) => updateStepData('ElectricalPanelInfo', 'Location', e.target.value)}
        required
      >
        <option value="">Select location</option>
        {panelLocations.map(loc => (
          <option key={loc.id} value={loc.name}>{loc.name}</option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>Main Circuit Breaker Capacity (A)</label>
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
                      {chargerLocations.map(loc => (
                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                      ))}
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
        <div className="form-grid-three">
          <div className="form-group">
            <label>Country</label>
            <select
              value={stepData.Address.Country}
              onChange={(e) => {
                updateStepData('HomeInfo', 'Address', {
                  ...stepData.Address,
                  Country: e.target.value,
                  City: '' // Reset city when country changes
                });
                // Load cities for selected country
                loadCitiesForCountry(e.target.value);
              }}
              required
            >
                  <option value="">Select Country</option>
              {loading && <option value="" disabled>Loading countries...</option>}
                         {countries.map((country, index) => (
                <option key={index} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>City</label>
            <select
              value={stepData.Address.City}
              onChange={(e) => updateStepData('HomeInfo', 'Address', {
                ...stepData.Address,
                City: e.target.value
              })}
              disabled={!stepData.Address.Country}
              required
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
    <div className="form-group ">
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
          <div className="form-group">
            <label>Street</label>
            <input
              type="text"
              value={stepData.Address.Street}
              onChange={(e) => updateStepData('HomeInfo', 'Address', {
                ...stepData.Address,
                Street: e.target.value
              })}
              placeholder="Enter street name"
              required
            />
          </div>

          <div className="form-group">
            <label>Street Number</label>
            <input
              type="text"
              value={stepData.Address.StreetNumber}
              onChange={(e) => updateStepData('HomeInfo', 'Address', {
                ...stepData.Address,
                StreetNumber: e.target.value
              })}
              placeholder="Enter street number"
              required
            />
          </div>

          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              value={stepData.Address.PostalCode}
              onChange={(e) => updateStepData('HomeInfo', 'Address', {
                ...stepData.Address,
                PostalCode: e.target.value
              })}
              placeholder="Enter postal code"
              required
            />
          </div>

        
        </div>
      </div>
    );

    case 'EvChargerInfo':
      return (
        <div className="step-form">
          <StepHeader title={step.title} image={step.image} />

          <div className="form-group">
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

          <div className="form-grid-three">
            {stepData.WantsToBuy && (
              <>
                <div className="form-group">
                  <label>Preferred Brand</label>
                  <select
                    value={stepData.Brand}
                    onChange={(e) => updateStepData('EvChargerInfo', 'Brand', e.target.value)}
                    required
                  >
                    <option value="">Select brand</option>
                    <option value="Tesla">Tesla</option>
                    <option value="Wallbox">Wallbox</option>
                    <option value="ChargePoint">ChargePoint</option>
                    <option value="ABB">ABB</option>
                    <option value="Schneider">Schneider Electric</option>
                    <option value="BP Pulse">BP Pulse</option>
                    <option value="Shell Recharge">Shell Recharge</option>
                    <option value="Blink">Blink Charging</option>
                    <option value="Autel">Autel</option>
                    <option value="Siemens">Siemens</option>
                    <option value="Eaton">Eaton</option>
                    <option value="Delta Electronics">Delta Electronics</option>
                    <option value="Tritium">Tritium</option>
                    <option value="EVB">EVB (Beny New Energy)</option>
                    <option value="Qoltec">Qoltec</option>
                    <option value="Victron Energy">Victron Energy</option>
                    <option value="Voltech">Voltech</option>
                    <option value="Enel X">Enel X</option>
                    <option value="Pod Point">Pod Point</option>
                    <option value="Electrify America">Electrify America</option>
                    <option value="EVBox">EVBox</option>
                    <option value="ClipperCreek">ClipperCreek</option>
                    <option value="Rolec">Rolec</option>
                    <option value="Wallenius">Wallenius</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Charger Model</label>
                  <input
                    type="text"
                    value={stepData.Model}
                    onChange={(e) => updateStepData('EvChargerInfo', 'Model', e.target.value)}
                    placeholder="Enter charger model"
                    required
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
    if (currentStep === -1 || currentStep === steps.length) return true;

    const step = steps[currentStep];
    const stepData = assessment[step.key];

    switch (step.key) {
      case 'PersonalInfo':
        const isFirstNameValid = !!stepData.FirstName?.trim();
        const isLastNameValid = !!stepData.LastName?.trim();
        const isEmailValid = emailRegex.test(stepData.Email || '');
        const isPhoneValid = phoneRegex.test(stepData.Phone || '');
        return isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid;

      case 'VehicleInfo':
        return stepData.Brand && stepData.Model && stepData.Year;
      case 'ElectricalPanelInfo':
        return stepData.Location && stepData.MainBreakerCapacity > 0 && stepData.NumberOfOpenSlots >= 0;
      case 'ChargerInfo':
        return stepData.Location && stepData.DistanceFromPanelMeters >= 0;
      case 'HomeInfo':
        return stepData.Address.Country && stepData.Address.City && stepData.Address.Street && stepData.Address.StreetNumber && stepData.Address.PostalCode && stepData.NumberOfHighEnergyDevices >= 0;
      case 'EvChargerInfo':
        // If user doesn't want to buy, step is valid
        if (stepData.WantsToBuy === false) return true;
        // If user wants to buy, all three fields are required
        if (stepData.WantsToBuy === true) {
          return stepData.Brand && stepData.Model && stepData.PowerKw > 0;
        }
        // If WantsToBuy is null/undefined, step is not valid
        return false;
      default:
        return true;
    }
  };

  return (
    <div className="App">
      <main className="main-content">
        {/* Left side - Form */}
        <div className="left-side">
          <div className="form-container"
            style={{
            backgroundImage: 'url("https://static.vecteezy.com/system/resources/previews/002/006/653/non_2x/ev-electric-car-battery-charging-at-station-illustration-vector.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '20px',
            borderRadius: '10px'
            }}>
              
            {renderCurrentStep()}

            {currentStep === -1 && (
              <div className="start-button-container">
                <button className="btn btn-start" onClick={startAssessment}>
                  Start Assessment
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep >= 0 && currentStep < steps.length && (
              <div className="navigation-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  ← Back
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                  >
                    {savedSteps.has(currentStep) ? (
                      <>
                        ✓ Saved
                      </>
                    ) : (
                      'Save and Continue →'
                    )}
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={completeAssessment}
                    disabled={!areAllStepsValid()}
                  >
                    ✓ Finish Assessment
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
          <div className="stepper-container" 
            style={{
            backgroundImage: `url(${bgRight})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '20px',
            borderRadius: '10px'
            }}>
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(index);
              
              return (
                <div key={step.key} className="stepper-item">
                  <div 
                    className={`step-circle ${stepStatus}`}
                    onClick={() => goToStep(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="step-image">
                      <img
                        src={require(`./res/${step.image}.png`)}
                        alt={step.title}
                        className="step-img"
                      />
                      {stepStatus === 'saved' && (
                        <div className="completion-checkmark">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="checkmark-icon"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                      {stepStatus === 'attention' && (
                        <div className="attention-mark">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="attention-icon"
                          >
                            <path
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                      {stepStatus === 'skipped' && (
                        <div className="skipped-mark">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="x-icon"
                          >
                            <path
                              d="M18 6L6 18M6 6L18 18"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="step-label">
                    {step.title}
                  </div>
                  {index < steps.length - 1 && <div className="step-connector"></div>}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Custom Completion Modal */}
      {showCompletionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#27ae60"/>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>Assessment Completed!</h2>
              <p>Congratulations! You have successfully completed the EV Charger Assessment. Based on your information, we can now provide you with personalized recommendations.</p>
            </div>
            
            <div className="modal-body">
              <h3>What would you like to do next?</h3>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary modal-btn"
                onClick={handleStartNewAssessment}
              >
                Start New Assessment
              </button>
              <button 
                className="btn btn-success modal-btn"
                onClick={handleViewRecommendations}
              >
                View Recommendations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;