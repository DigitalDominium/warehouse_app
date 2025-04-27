import React, { useState } from 'react';
import axios from 'axios';

const ReplenishmentForm = ({ userId, consumables, onComplete }) => {
  const [discrepancies, setDiscrepancies] = useState([]);
  const [showDiscrepancyForm, setShowDiscrepancyForm] = useState(false);

  const handleReplenishment = async (status) => {
    try {
      await axios.post('https://warehouse-app-backend-kbt5.onrender.com/api/replenish', {
        userId,
        status,
        discrepancies: status === 'discrepancy' ? discrepancies : [],
      });
      onComplete();
    } catch (err) {
      console.error('Error submitting replenishment:', err);
    }
  };

  const toggleDiscrepancy = (item) => {
    setDiscrepancies((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div>
      {!showDiscrepancyForm ? (
        <>
          <button onClick={() => handleReplenishment('completed')}>
            Replenishment Completed
          </button>
          <button onClick={() => setShowDiscrepancyForm(true)}>
            Replenishment Completed with Discrepancy
          </button>
        </>
      ) : (
        <>
          <h3>Select Missing Items</h3>
          {consumables.map((item) => (
            <div key={item}>
              <input
                type="checkbox"
                checked={discrepancies.includes(item)}
                onChange={() => toggleDiscrepancy(item)}
              />
              <label>{item}</label>
            </div>
          ))}
          <button onClick={() => handleReplenishment('discrepancy')}>
            Submit Discrepancy
          </button>
        </>
      )}
    </div>
  );
};

export default ReplenishmentForm;
