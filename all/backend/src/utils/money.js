'use strict';

/**
 * Format integer paise as an Indian-rupee display string, e.g. 9900 → "₹99",
 * 150000 → "₹1,500", 9950 → "₹99.50".
 * @param {number} paise
 */
function formatINR(paise) {
  const rupees = paise / 100;
  const whole = Number.isInteger(rupees);
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

module.exports = { formatINR };
