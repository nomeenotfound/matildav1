const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf8');

code = code.replace(
  "const [upiConfig, setUpiConfig] = useState({ upi_id: import.meta.env.VITE_STORE_UPI_ID || 'matilda@upi', payee_name: 'Matilda Studio' });",
  "const [upiConfig] = useState({ upi_id: import.meta.env.VITE_UPI_ID || 'your-upi-id@okbank', payee_name: 'Matilda Studio' });"
);

code = code.replace(
  "if (d.upi_config) setUpiConfig(d.upi_config);",
  ""
);

fs.writeFileSync('src/components/CheckoutPage.tsx', code);
