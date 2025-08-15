import { useState, useEffect } from 'react';

const useElectricVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(
          'https://public.opendatasoft.com/api/records/1.0/search/?dataset=all-vehicles-model&q=&rows=1000&refine.fueltype1=Electricity'
        );
        const data = await response.json();

        // mapiranje na objekat sa samo 3 polja
        const mappedVehicles = data.records.map(record => ({
          brand: record.fields.make,
          baseModel: record.fields.basemodel,
          model: record.fields.model,
        }));

        setVehicles(mappedVehicles);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return { vehicles, loading };
};

export default useElectricVehicles;
