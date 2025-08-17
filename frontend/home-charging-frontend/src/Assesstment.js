import React, { useState, useEffect } from 'react';
import './Assesstment.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import bgRight from './res/bg-right-side2.png';
import useElectricVehicles from './useElectricVehicles';
import assessmentService from './services/assessmentService';
import authService from './services/authService';
import Swal from 'sweetalert2';

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
      HasCharger: false,
      WantsToBuy: false,
      EvCharger: {
        Brand: '',
        Model: '',
        PowerKw: 0
      }
    },
    CurrentPage: 0,
    IsComplete: false
  });

  // Track which steps have been saved
  const [savedSteps, setSavedSteps] = useState(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // DODANO - State za auth proveravanja
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // NOVO - State za EvCharger podatke
  const [evChargers, setEvChargers] = useState([]);
  const [evChargerLoading, setEvChargerLoading] = useState(false);

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
  const [alertShown, setAlertShown] = useState(false);

  // State za validacione greške
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    phone: ''
  });
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  // NOVO - Helper funkcije za EvCharger
  const getUniqueEvBrands = () => {
    const brands = evChargers.map(charger => charger.brand);
    return [...new Set(brands)].sort();
  };

  const getUniqueModelsForBrand = (selectedBrand) => {
    const models = evChargers
      .filter(charger => charger.brand === selectedBrand)
      .map(charger => charger.model);
    return [...new Set(models)].sort();
  };

  const getPowerOptionsForModel = (selectedBrand, selectedModel) => {
    const chargers = evChargers.filter(
      c => c.brand === selectedBrand && c.model === selectedModel
    );
    
    // Izdvojiti jedinstvene snage i sortirati ih
    const powers = [...new Set(chargers.map(c => c.powerKw))].sort((a, b) => a - b);
    return powers;
  };

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

  // NOVO - useEffect za učitavanje EvCharger podataka
  useEffect(() => {
    const loadEvChargers = async () => {
      setEvChargerLoading(true);
      try {
        const response = await fetch('http://localhost:5092/api/EvCharger');
        if (!response.ok) {
          throw new Error('Failed to fetch EvChargers');
        }
        const data = await response.json();
        setEvChargers(data);
      } catch (error) {
        console.error('Error loading EvChargers:', error);
        // Fallback na praznu listu ako API ne radi
        setEvChargers([]);
      } finally {
        setEvChargerLoading(false);
      }
    };

    loadEvChargers();
  }, []);

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

  // PROMENJENO - Koristi assessmentService umesto direktnih API poziva
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

  // PROMENJENO - Čuvanje trenutnog koraka u bazi
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

      await assessmentService.updateAssessment(
        assessment.id, 
        assessment.customerId, 
        updatedAssessment
      );

    } catch (error) {
      console.error('Save step error:', error);
      setError('Error while saving data: ' + error.message);
      
      // Handle auth errors
      if (error.message.includes('log in')) {
        setIsAuthenticated(false);
        setAuthMessage('Your session has expired. Please log in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // PROMENJENO - Kreiranje novog assessment-a
  const createAssessment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { id, customerId, ...assessmentPayload } = assessment;

      const response = await assessmentService.createAssessment(assessmentPayload);

      setAssessment(prev => ({
        ...prev,
        id: response.id,
        customerId: response.customerId
      }));
      
    } catch (error) {
      console.error('Create assessment error:', error);
      setError('Error while creating assessment: ' + error.message);
      
      // Handle auth errors
      if (error.message.includes('log in')) {
        setIsAuthenticated(false);
        setAuthMessage('Your session has expired. Please log in again.');
      }
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

  // PROMENJENO - Finalizovanje assessment-a
  const completeAssessment = async () => {
    setLoading(true);

    try {
      const finalAssessment = {
        ...assessment,
        CurrentPage: steps.length,
        IsComplete: true,
        CompletedAt: new Date().toISOString()
      };
      
      await assessmentService.updateAssessment(
        assessment.id,
        assessment.customerId,
        finalAssessment
      );

      // Mark all steps as saved when completing assessment
      setSavedSteps(new Set([0, 1, 2, 3, 4, 5]));
      
      setShowCompletionModal(true);

    } catch (error) {
      console.error('Complete assessment error:', error);
      setError('Error while completing assessment: ' + error.message);
      
      // Handle auth errors  
      if (error.message.includes('log in')) {
        setIsAuthenticated(false);
        setAuthMessage('Your session has expired. Please log in again.');
      }
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
          // Ako ima punjač, sva tri polja su obavezna
          if (stepData.HasCharger === true) {
            return stepData.EvCharger?.Brand && 
                  stepData.EvCharger?.Model && 
                  stepData.EvCharger?.PowerKw > 0;
          }
          // Ako nema punjač
          if (stepData.HasCharger === false) {
            // Ako želi da kupi, sva tri polja su obavezna
            if (stepData.WantsToBuy === true) {
              return stepData.EvCharger?.Brand && 
                    stepData.EvCharger?.Model && 
                    stepData.EvCharger?.PowerKw > 0;
            }
            
            // Ako ne želi da kupi (želi preporuke), to je validno
            return stepData.WantsToBuy === false;
          }
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
      HasCharger: false,
      WantsToBuy: false,
      EvCharger: {
        Brand: '',
        Model: '',
        PowerKw: 0
      }
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
      HasCharger: false,
      WantsToBuy: false,
      EvCharger: {
        Brand: '',
        Model: '',
        PowerKw: 0
      }
    },
        CurrentPage: 0,
        IsComplete: false
      });
    }
  };

 useEffect(() => {
  if (!authService.isLoggedIn()) {
    setIsAuthenticated(false);
    
    // Prikaži SweetAlert2 samo jednom
    if (!alertShown) {
      setAlertShown(true);
      showAuthAlert();
    }
    return;
  }

  setIsAuthenticated(true);
  // ... ostatak logike
}, [alertShown]);

// Nova funkcija za prikaz alert-a
const showAuthAlert = () => {
  Swal.fire({
    title: 'Login Required',
    text: 'You need to log in to access the EV charging assessment.',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Go to Login',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    showCloseButton: true,
    reverseButtons: true,
    allowOutsideClick: true,  // Dozvoli zatvaranje klikom van
    allowEscapeKey: true,     // Dozvoli zatvaranje ESC tasterom
    customClass: {
      popup: 'auth-alert-popup',
      confirmButton: 'auth-alert-login-btn',
      cancelButton: 'auth-alert-cancel-btn'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Idi na home stranicu za login
      window.location.href = '/';
    } else if (result.isDismissed) {
      // Ako je zatvoreno (Cancel, X, ESC, ili klik van)
      // Možeš dodati logiku ovde ili samo ostaviti korisnika na strani
      console.log('Alert dismissed - user stays on page');
      // Opciono: prikaži button da može ponovo da otvori alert
      setAlertShown(false); // Reset da može ponovo da se prikaže
    }
  });
};

// Auth check early return
if (!isAuthenticated) {
  return (
    <div className="App">
      <div className="assessment-loading">
        <div className="loading-content">
          <div className="auth-message">
            <div className="lock-icon-large">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="#10b981"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#059669" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" fill="white"/>
              </svg>
            </div>
            <h2>Authentication Required</h2>
            <p>You need to log in to access the EV charging assessment.</p>
            <div className="auth-actions">
              <button 
                onClick={showAuthAlert}
                className="retry-auth-btn"
              >
                Show Login Options
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="go-home-btn"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
                      HasCharger: false,
                      WantsToBuy: false,
                      EvCharger: {
                        Brand: '',
                        Model: '',
                        PowerKw: 0
                      }
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
  const uniqueBrands = getUniqueEvBrands();
  const uniqueModelsForBrand = getUniqueModelsForBrand(stepData.EvCharger?.Brand || '');
  const powerOptionsForModel = getPowerOptionsForModel(
    stepData.EvCharger?.Brand || '', 
    stepData.EvCharger?.Model || ''
  );

  return (
    <div className="step-form ev-charger-step">
      <StepHeader title={step.title} image={step.image} />

      {/* Main Question - Inline */}
      <div className="inline-question">
        <div className="question-row">
          <div className="question-label">
            <svg className="question-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C13.1 2 14 2.9 14 4V6H18C19.1 6 20 6.9 20 8V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V8C4 6.9 4.9 6 6 6H10V4C10 2.9 10.9 2 12 2ZM12 4V6H12V4ZM8 10V14H16V10H8Z" fill="currentColor"/>
              <circle cx="12" cy="12" r="1.5" fill="white"/>
            </svg>
            <span>Do you currently have an EV charger?</span>
          </div>
          
          <div className="inline-options">
            <label className={`inline-radio ${stepData.HasCharger === true ? 'selected' : ''}`}>
              <input
                type="radio"
                name="hasCharger"
                checked={stepData.HasCharger === true}
                onChange={() => {
                  updateStepData('EvChargerInfo', 'HasCharger', true);
                  updateStepData('EvChargerInfo', 'WantsToBuy', false);
                }}
              />
              <span>Yes, I have one</span>
            </label>

            <label className={`inline-radio ${stepData.HasCharger === false ? 'selected' : ''}`}>
              <input
                type="radio"
                name="hasCharger"
                checked={stepData.HasCharger === false}
                onChange={() => {
                  updateStepData('EvChargerInfo', 'HasCharger', false);
                  updateStepData('EvChargerInfo', 'EvCharger', {
                    Brand: '',
                    Model: '',
                    PowerKw: 0
                  });
                }}
              />
              <span>No, I don't</span>
            </label>
          </div>
        </div>
      </div>

      {/* Existing Charger Details - Inline */}
      {stepData.HasCharger === true && (
        <div className="inline-form">
          <div className="form-row">
            <div className="form-label">
              <svg className="form-icon" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="#34d399"/>
                <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Tell us about your current charger:</span>
            </div>
            
            <div className="inline-inputs">
              <div className="input-group">
                <label>Brand</label>
                {evChargerLoading ? (
                  <select disabled>
                    <option>Loading brands...</option>
                  </select>
                ) : (
                  <select
                    value={stepData.EvCharger?.Brand || ''}
                    onChange={(e) => {
                      const selectedBrand = e.target.value;
                      updateStepData('EvChargerInfo', 'EvCharger', {
                        Brand: selectedBrand,
                        Model: '', // Reset model when brand changes
                        PowerKw: 0 // Reset power when brand changes
                      });
                    }}
                    required
                  >
                    <option value="">Choose brand</option>
                    {uniqueBrands.map((brand, index) => (
                      <option key={index} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="input-group">
                <label>Model</label>
                <select
                  value={stepData.EvCharger?.Model || ''}
                  onChange={(e) => {
                    const selectedModel = e.target.value;
                    updateStepData('EvChargerInfo', 'EvCharger', {
                      ...stepData.EvCharger,
                      Model: selectedModel,
                      PowerKw: 0 // Reset power when model changes
                    });
                  }}
                  disabled={!stepData.EvCharger?.Brand || evChargerLoading}
                  required
                >
                  <option value="">Choose model</option>
                  {uniqueModelsForBrand.map((model, index) => (
                    <option key={index} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Power</label>
                <select
                  value={stepData.EvCharger?.PowerKw || 0}
                  onChange={(e) => {
                    updateStepData('EvChargerInfo', 'EvCharger', {
                      ...stepData.EvCharger,
                      PowerKw: parseFloat(e.target.value)
                    });
                  }}
                  disabled={!stepData.EvCharger?.Model || evChargerLoading}
                  required
                >
                  <option value="0">Select power</option>
                  {powerOptionsForModel.map((power, index) => (
                    <option key={index} value={power}>
                      {power} kW
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Charger Options - Inline */}
      {stepData.HasCharger === false && (
        <div className="inline-question">
          <div className="question-row">
            <div className="question-label">
              <svg className="question-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#06b6d4"/>
                <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>What would you like to do?</span>
            </div>
            
            <div className="inline-options">
              <div 
                className={`inline-option ${stepData.WantsToBuy ? 'selected' : ''}`}
                onClick={() => updateStepData('EvChargerInfo', 'WantsToBuy', true)}
              >
                <svg className="option-icon" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" fill="#f59e0b"/>
                  <circle cx="8" cy="21" r="2" fill="#f59e0b"/>
                  <circle cx="16" cy="21" r="2" fill="#f59e0b"/>
                  <path d="M6 6H22L20 16H8L6 6ZM6 6L4 2H2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Buy a Charger</span>
              </div>

              <div 
                className={`inline-option ${!stepData.WantsToBuy ? 'selected' : ''}`}
                onClick={() => {
                  updateStepData('EvChargerInfo', 'WantsToBuy', false);
                  updateStepData('EvChargerInfo', 'EvCharger', {
                    Brand: '',
                    Model: '',
                    PowerKw: 0
                  });
                }}
              >
                <svg className="option-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="#8b5cf6"/>
                  <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Get Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Details - Inline */}
      {stepData.HasCharger === false && stepData.WantsToBuy === true && (
        <div className="inline-form purchase-form">
          <div className="form-row">
            <div className="form-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-ev-station-fill" viewBox="0 0 16 16">
                <path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V9c0-.258-.104-.377-.357-.635l-.007-.008C13.379 8.096 13 7.71 13 7V4a.5.5 0 0 1 .146-.354l.5-.5a.5.5 0 0 1 .708 0l.5.5A.5.5 0 0 1 15 4v8.5a1.5 1.5 0 1 1-3 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1zm2 .5v5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5m2.631 9.96H4.14v-.893h1.403v-.505H4.14v-.855h1.49v-.54H3.485V13h2.146zm1.316.54h.794l1.106-3.333h-.733l-.74 2.615h-.031l-.747-2.615h-.764z"/>
              </svg>
              <span>Select your preferred charger:</span>
            </div>
            
            <div className="inline-inputs">
              <div className="input-group">
                <label>Brand</label>
                {evChargerLoading ? (
                  <select disabled>
                    <option>Loading brands...</option>
                  </select>
                ) : (
                  <select
                    value={stepData.EvCharger?.Brand || ''}
                    onChange={(e) => {
                      const selectedBrand = e.target.value;
                      updateStepData('EvChargerInfo', 'EvCharger', {
                        Brand: selectedBrand,
                        Model: '', // Reset model when brand changes
                        PowerKw: 0 // Reset power when brand changes
                      });
                    }}
                    required
                  >
                    <option value="">Choose brand</option>
                    {uniqueBrands.map((brand, index) => (
                      <option key={index} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="input-group">
                <label>Model</label>
                <select
                  value={stepData.EvCharger?.Model || ''}
                  onChange={(e) => {
                    const selectedModel = e.target.value;
                    updateStepData('EvChargerInfo', 'EvCharger', {
                      ...stepData.EvCharger,
                      Model: selectedModel,
                      PowerKw: 0 // Reset power when model changes
                    });
                  }}
                  disabled={!stepData.EvCharger?.Brand || evChargerLoading}
                  required
                >
                  <option value="">Choose model</option>
                  {uniqueModelsForBrand.map((model, index) => (
                    <option key={index} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Power</label>
                <select
                  value={stepData.EvCharger?.PowerKw || 0}
                  onChange={(e) => {
                    updateStepData('EvChargerInfo', 'EvCharger', {
                      ...stepData.EvCharger,
                      PowerKw: parseFloat(e.target.value)
                    });
                  }}
                  disabled={!stepData.EvCharger?.Model || evChargerLoading}
                  required
                >
                  <option value="0">Select power</option>
                  {powerOptionsForModel.map((power, index) => (
                    <option key={index} value={power}>
                      {power} kW
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Info - Inline */}
      {stepData.HasCharger === false && stepData.WantsToBuy === false && (
        <div className="inline-info">
          <div className="info-row">
            <svg className="info-icon" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#06d6a0"/>
              <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span><strong>Perfect!</strong> We'll provide personalized charger recommendations based on your assessment.</span>
          </div>
        </div>
      )}
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
          // Ako ima punjač, sva tri polja su obavezna
          if (stepData.HasCharger === true) {
            return stepData.EvCharger?.Brand && 
                  stepData.EvCharger?.Model && 
                  stepData.EvCharger?.PowerKw > 0;
          }
          // Ako nema punjač
          if (stepData.HasCharger === false) {
            // Ako želi da kupi, sva tri polja su obavezna
            if (stepData.WantsToBuy === true) {
              return stepData.EvCharger?.Brand && 
                    stepData.EvCharger?.Model && 
                    stepData.EvCharger?.PowerKw > 0;
            }
            // Ako ne želi da kupi (želi preporuke), to je validno
            return stepData.WantsToBuy === false;
          }
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