// script.js

let currencySymbols = {};
let conversionHistory = [];

// Function to fetch currency symbols
function fetchCurrencySymbols() {
    return fetch('https://restcountries.com/v3.1/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching symbols: ' + response.statusText);
            }
            return response.json();
        })
        .then(countries => {
            countries.forEach(country => {
                if (country.currencies) {
                    for (let code in country.currencies) {
                        const currency = country.currencies[code];
                        if (currency.symbol && !currencySymbols[code]) {
                            currencySymbols[code] = currency.symbol;
                        }
                    }
                }
            });
            console.log('Currency symbols fetched:', currencySymbols);
        })
        .catch(error => {
            console.error('Error fetching currency symbols:', error);
            alert("Failed to fetch currency symbols. Please try again.");
        });
}

// Function to fetch currency codes from Frankfurter API and populate dropdowns
function fetchCurrencyCodes() {
    return fetch('https://api.frankfurter.app/currencies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching currencies: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const fromCurrency = document.getElementById('fromCurrency');
            const toCurrency = document.getElementById('toCurrency');

            for (let code in data) {
                const symbol = currencySymbols[code] || ''; // Use the fetched symbol if available
                const optionText = `${symbol} ${code} - ${data[code]}`;

                // Add to both "From" and "To" dropdowns
                const option1 = document.createElement('option');
                option1.value = code;
                option1.textContent = optionText;
                fromCurrency.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = code;
                option2.textContent = optionText;
                toCurrency.appendChild(option2);
            }

            // Set default values and update symbol
            fromCurrency.value = 'USD';
            toCurrency.value = 'EUR';
            document.getElementById('fromSymbol').textContent = currencySymbols[fromCurrency.value] || '';

            // Update symbol when "From" currency changes
            fromCurrency.addEventListener('change', () => {
                document.getElementById('fromSymbol').textContent = currencySymbols[fromCurrency.value] || '';
            });

            console.log('Currency codes fetched successfully:', data);
        })
        .catch(error => {
            console.error('Error fetching currency codes:', error);
            alert("Failed to fetch currency codes. Please try again.");
        });
}

// Function to perform currency conversion
function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrencyValue = document.getElementById('fromCurrency').value;
    const toCurrencyValue = document.getElementById('toCurrency').value;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than zero.');
        return;
    }

    if (fromCurrencyValue === toCurrencyValue) {
        alert('Please select different currencies for conversion.');
        return;
    }

    const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrencyValue}&to=${toCurrencyValue}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching exchange rate: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const convertedAmount = data.rates[toCurrencyValue];
            const fromSymbol = currencySymbols[fromCurrencyValue] || '';
            const toSymbol = currencySymbols[toCurrencyValue] || '';

            const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
            const formattedConvertedAmount = convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 });

            const resultText = `${fromSymbol}${formattedAmount} ${fromCurrencyValue} = ${toSymbol}${formattedConvertedAmount} ${toCurrencyValue}`;
            const resultElement = document.getElementById('result');
            resultElement.className = 'slide-in pop'; // Add animation classes
            resultElement.textContent = resultText;

            // Save to history
            const timestamp = new Date().toLocaleString();
            const historyEntry = `${timestamp}: ${resultText}`;
            conversionHistory.push(historyEntry);

            // Add to history section
            updateHistoryDisplay(historyEntry);
        })
        .catch(error => {
            console.error('Error performing currency conversion:', error);
            alert("Failed to convert currency. Please try again.");
        });
}

// Function to update the history display
function updateHistoryDisplay(entry) {
    const historyContent = document.getElementById('historyContent');
    const entryDiv = document.createElement('div');
    entryDiv.className = 'fade-in';
    entryDiv.textContent = entry;
    historyContent.appendChild(entryDiv);
}

// Function to swap "From" and "To" currencies
function swapCurrencies() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');

    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

    document.getElementById('fromSymbol').textContent = currencySymbols[fromCurrency.value] || '';
}

// Function to reset the form
function resetForm() {
    document.getElementById('amount').value = '1';
    document.getElementById('fromCurrency').value = 'USD';
    document.getElementById('toCurrency').value = 'EUR';
    document.getElementById('result').textContent = '';
    document.getElementById('fromSymbol').textContent = currencySymbols['USD'] || '';

    conversionHistory = [];
    document.getElementById('historyContent').innerHTML = '';
}

// Attach event listeners to buttons
document.getElementById('convert').addEventListener('click', convertCurrency);
document.getElementById('swap').addEventListener('click', swapCurrencies);
document.getElementById('reset').addEventListener('click', resetForm);

// Fetch data on load
fetchCurrencySymbols()
    .then(fetchCurrencyCodes)
    .catch(error => console.error('Initialization error:', error));
