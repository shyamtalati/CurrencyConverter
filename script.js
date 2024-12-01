// script.js

let currencySymbols = {};
let conversionHistory = [];

// Function to fetch currency symbols
function fetchCurrencySymbols() {
    return fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
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
        });
}

// Function to fetch currency codes and populate dropdowns
function fetchCurrencyCodes() {
    return fetch('https://api.frankfurter.app/currencies')
        .then(response => response.json())
        .then(data => {
            const currencyCodes = Object.keys(data);
            const fromCurrency = document.getElementById('fromCurrency');
            const toCurrency = document.getElementById('toCurrency');

            currencyCodes.forEach(code => {
                const symbol = currencySymbols[code] || '';
                const optionText = `${symbol} ${code} - ${data[code]}`;

                const option1 = document.createElement('option');
                option1.value = code;
                option1.textContent = optionText;
                fromCurrency.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = code;
                option2.textContent = optionText;
                toCurrency.appendChild(option2);
            });

            // Set default values and initial symbol
            fromCurrency.value = 'USD';
            toCurrency.value = 'EUR';
            document.getElementById('fromSymbol').textContent = currencySymbols[fromCurrency.value] || '';

            // Update symbol when the "From" currency changes
            fromCurrency.addEventListener('change', () => {
                document.getElementById('fromSymbol').textContent = currencySymbols[fromCurrency.value] || '';
            });
        });
}

// Fetch currency symbols and then fetch currency codes
fetchCurrencySymbols()
    .then(fetchCurrencyCodes)
    .catch(error => console.error('Error fetching currency codes or symbols:', error));

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
        .then(response => response.json())
        .then(data => {
            if (data.rates && data.rates[toCurrencyValue]) {
                const convertedAmount = data.rates[toCurrencyValue];
                const fromSymbol = currencySymbols[fromCurrencyValue] || '';
                const toSymbol = currencySymbols[toCurrencyValue] || '';

                const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
                const formattedConvertedAmount = convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 });

                const resultText = `${fromSymbol}${formattedAmount} ${fromCurrencyValue} = ${toSymbol}${formattedConvertedAmount} ${toCurrencyValue}`;
                const resultElement = document.getElementById('result');
                
                // Add slide-in and pop classes to result for visual emphasis
                resultElement.className = 'slide-in pop';
                resultElement.textContent = resultText;

                // Save to history
                const timestamp = new Date().toLocaleString();
                const historyEntry = `${timestamp}: ${resultText}`;
                conversionHistory.push(historyEntry);

                // Add the history entry to the page
                updateHistoryDisplay(historyEntry);
            } else {
                alert('Conversion rate not available.');
            }
        })
        .catch(error => {
            console.error('Error fetching exchange rates:', error);
            alert('An error occurred. Please try again later.');
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

// Function to swap currencies
function swapCurrencies() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');

    // Swap the selected currencies
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

    // Update the displayed symbol
    document.getElementById('fromSymbol').textContent = currencySymbols[fromCurrency.value] || '';
}

// Function to reset the form
function resetForm() {
    // Reset input fields
    document.getElementById('amount').value = '1';
    document.getElementById('fromCurrency').value = 'USD';
    document.getElementById('toCurrency').value = 'EUR';
    document.getElementById('result').textContent = '';
    document.getElementById('fromSymbol').textContent = currencySymbols['USD'] || '';

    // Clear the history
    conversionHistory = [];
    document.getElementById('historyContent').innerHTML = '';
}

// Attach event listeners to buttons
document.getElementById('convert').addEventListener('click', convertCurrency);
document.getElementById('swap').addEventListener('click', swapCurrencies);
document.getElementById('reset').addEventListener('click', resetForm);

// Add the pulse class if convert button is not clicked for a while
setTimeout(() => {
    document.getElementById('convert').classList.add('pulse');
}, 5000);

document.getElementById('convert').addEventListener('click', () => {
    document.getElementById('convert').classList.remove('pulse');
});
